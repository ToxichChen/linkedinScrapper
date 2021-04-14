const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const { convertArrayToCSV } = require('convert-array-to-csv');
const credentials = require('./credentials.js')


// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
let csvFromArrayOfObjects = '';
let auth = '';
let fileId = '';

async function generateShareUrl(insertId) {
    return 'https://drive.google.com/file/d/' + insertId + '/view?usp=sharing';
}

module.exports.saveOnDisk = async function(dataObjects, type) {
    console.log(dataObjects)
    csvFromArrayOfObjects = await convertArrayToCSV(dataObjects);
    return new Promise((resolve, reject) => {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Tasks API.
            authorize(JSON.parse(content))
                .then(function (value) {
                    auth = value;
                    uploadCsv(value, type).then(function (value) {
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
 *
 * @param googleCredentials
 * @returns {Promise<object>}
 */
async function authorize(googleCredentials) {
    const {client_secret, client_id, redirect_uris} = googleCredentials.installed;
    const oAuth2Client = await new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    return new Promise((resolve, reject) => {
        fs.readFile(credentials.TOKEN_PATH, async (err, token) => {
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
        scope: credentials.SCOPES,
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
                fs.writeFile(credentials.TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', credentials.TOKEN_PATH);
                    resolve(oAuth2Client);
                });
            });
        });
    })
}

/**
 * Uploads Csv data on Google Drive
 *
 * @param auth
 * @param type
 * @returns {Promise<*|string>}
 */
async function uploadCsv(auth, type) {
    const drive = await google.drive({version: 'v3', auth});
    let folderId = await type === 'comments' ? credentials.commentsFolderId : credentials.usersFolderId;
    let date = await new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    let docName = await type === 'comments' ? credentials.commentsCsvName : credentials.usersCsvName;
    let fileMetadata = {
        'name': date + docName,
        parents: [folderId]
    };
    let media = {
        mimeType: 'text/csv',
        body: csvFromArrayOfObjects
    };
    let file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    });
    console.log(date + docName)
    fileId = file.data.id;
    return fileId;
}

/**
 * Changes permissions to access by link
 *
 * @param auth
 * @param fileId
 * @returns {Promise<unknown>}
 */

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
