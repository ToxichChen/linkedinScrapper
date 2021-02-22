const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');



// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
let csvFromArrayOfObjects = '';
let auth = '';
let fileId = '';
const googleHeaders = {
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ya29.a0AfH6SMD86DE2sdgs6T2VT_EDugQtoT4C2dkfI0KDSNkKs-TboJYn3KZUJDe3O3HR_-xAgxkyQx0qgVtswML-ZVAP0UZVcktY0ViM_iOvFvdwWsSOKvBwNhAD484AlEn3Vd_9_7Mr-bIhnXNYr__zzcs2xBy_1wiOrPeuTTXj7Jk",
    }
}

async function generateShareUrl(insertId) {
    return 'https://drive.google.com/file/d/' + insertId + '/view?usp=sharing';
}

module.exports.saveOnDisk = async function(dataObjects) {
    csvFromArrayOfObjects = await convertArrayToCSV(dataObjects);
    return new Promise((resolve, reject) => {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Tasks API.
            authorize(JSON.parse(content))
                .then(function (value) {
                    auth = value;
                    uploadCsv(value).then(function (value) {
                        filePermission(auth, fileId).then(function (value) {
                            resolve(generateShareUrl(fileId));
                        });
                    })
                })
        });
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = await new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    return new Promise((resolve, reject) => {
        fs.readFile(TOKEN_PATH, async (err, token) => {
            if (err) return getNewToken(oAuth2Client);
            await oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
        });
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    return new Promise(function (resolve, reject) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                    resolve(oAuth2Client);
                });
            });
        });
    })
}

async function uploadCsv(auth) {
    const drive = await google.drive({version: 'v3', auth});
    var folderId = '18zI4KZYGjzMNoL2sPQjxlKNxYtm4UnQP';
    let date = await new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    var fileMetadata = {
        'name': date + '-linkedin.csv',
        parents: [folderId]
    };
    var media = {
        mimeType: 'text/csv',
        body: csvFromArrayOfObjects
    };
    let file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    });
    fileId = file.data.id;
    return fileId;
}

async function filePermission(auth, fileId) {
    const drive = await google.drive({version: 'v3', auth});
    let permissions = {
        "role": "reader",
        "type": "anyone"
    };
    return new Promise((resolve, reject) => {
        drive.permissions.create({
            resource: permissions,
            fileId: fileId,
            fields: 'id',
            sendNotificationEmail: false,
        }, function (err, resp) {
            if (err) return console.log(err);
            resolve(resp.status)
        });
    });
}
