const axios = require("axios")
const mysql = require('mysql');
const google = require('./google.js');
const credentials = require('./credentials.js')
const fetch = require('node-fetch');


let con = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "root",
    database: "linkedin"
});

let urlsArray = [];

/**
 * Check status of working agent: running/finished
 *
 * @param agentId
 * @returns {Promise<*>}
 */

async function checkStatus  (agentId) {
    let url = 'https://api.phantombuster.com/api/v2/agents/fetch-output?id=' + agentId;
    let result = '';
    let options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-Phantombuster-Key': credentials.phantomBusterApiKey
        }
    };

    let response = await fetch(url, options)
    if (response.ok) {
        result = await response.json();
        return result.status;
    }
}

/**
 * Fetch clients urls from database
 *
 * @returns {Promise<array>}
 */

async function getUsersArray () {
    let sql = ('SELECT `linkedinUrl` FROM `clients` WHERE `connectSent` = 0');
    return await new Promise((resolve, reject) => {
        let urls = [];
        con.query(sql, async function (err, result) {
            await result.forEach(function (value) {
                urls.push(value.linkedinUrl);
            });
            resolve(urls);
        });
    });
}

/**
 *  Set client's `connectSent` if client has already received connection proposal
 *
 * @returns {Promise<boolean>}
 */

async function setConnected () {
    return await new Promise((resolve, reject) => {
        for (const value of urlsArray) {
            con.query('UPDATE `clients` SET `connectSent` = 1 WHERE `linkedinUrl` = ' + value, async function (err, result) {
                console.log(value + ' - connection sent')
            });
        }
        resolve(true);
    })
}

/**
 *  Form data for Auto Connect
 *
 * @returns {Promise<array>}
 */

async function prepareAutoConnector () {
    let urls = await getUsersArray();
    let formattedData = []
    return await new Promise((resolve, reject) => {
        for (const value of urls) {
            formattedData.push({
                link: value,
            })
            urlsArray.push(value);
        }
        resolve(formattedData);
    })
}

/**
 *  Create a Google Drive document with Linkedin Users urls and start Auto Connect with it
 *
 * @returns {Promise<void>}
 */

async function autoConnect() {
    await google.saveOnDisk(await prepareAutoConnector (), 'users').then(async function(value) {
        await runAutoConnect(value).then(async function (value) {
            let status;
            do {
                status = await checkStatus(credentials.autoConnectAgentId);
                console.log(status)
            } while (status !== 'finished')
            await setConnected()
            console.log('Connection requests are sent successfully!')
        });
     });
}

/**
 * Run Phantombuster's Auto Connect agent
 *
 * @param documentUrl
 * @returns {Promise<void>}
 */

async function runAutoConnect(documentUrl) {
    await axios
        .post(
            "https://api.phantombuster.com/api/v2/agents/launch",
            {
                "id": credentials.autoConnectAgentId,
                "argument":
                    {"numberOfAddsPerLaunch":10,
                        "onlySecondCircle":false,
                        "waitDuration":30,
                        "skipProfiles":true,
                        "sessionCookie": credentials.sessionCookie,
                        "dwellTime":true,
                        "spreadsheetUrl": documentUrl
                    }
                    },
            credentials.initOptions,
        )
        .catch((error) => console.error("Something went wrong :(", error))
}

autoConnect()