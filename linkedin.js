const axios = require("axios")
const mysql = require('mysql');
const fetch = require('node-fetch');
const google = require('./google.js');
const credentials = require('./credentials.js')


let con = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "root",
    database: "linkedin"
});

// Calling to rocketreach.co for email by LinkedIn url
// async function searchForEmail(linkedinUrl) {
//     let url = 'https://api.rocketreach.co/v2/api/lookupProfile?li_url=' + linkedinUrl;
//     let emails = [];
//     let result = '';
//     let options = {
//         method: 'GET',
//         headers: {
//             Accept: 'application/json',
//             'Api-Key': rocketSearchApiKey
//         }
//     };
//
//     let response = await fetch(url, options)
//     if (response.ok) {
//         result = await response.json();
//         emails = result.emails
//         return emails[0].email;
//     }
// }

/**
 * Make a delay
 *
 * @param time
 * @returns {Promise<unknown>}
 */

async function sleep() {
    let time = Math.floor(Math.random() * (180000 - 30000) + 20000);
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

/**
 * Get result of Users Search and run Activities parsing
 *
 * @param containerId
 * @returns {Promise<void>}
 */
async function getUsers(containerId) {
    let result = await getResults(containerId, credentials.searchScrapperId);
    for (const user of result) {
        if (!user.error) {
            await saveUserToDatabase(user.url, user.firstName, user.lastName)
            await sleep();
            await parseActivities(user.url);
        }
    }
    con.end()
}

/**
 * Get Activities and start Liking and Commenting process
 *
 * @param containerId
 * @returns {Promise<void>}
 */
async function likeAndCommentActivities (containerId) {
    console.log(containerId)
    let result = await getResults(containerId, credentials.activitiesScrapperId)
    if (!result[0] || !result[0].error) {
        let documentLink = '';
        await google.saveOnDisk(await prepareAutoCommenter(result), 'comments').then(async function(value) {
            documentLink = value;
            await sleep();
            await runAutoLiker(value).then(async function(value) {
                let status;
                do {
                    status = await checkStatus(credentials.autoLikerId);
                    console.log(status)
                } while (status !== 'finished')
                console.log('Posts are liked successfully')
            }).then(async function () {
                await sleep();
                await runAutoCommenter(documentLink).then(async function(value) {
                    let status;
                    do {
                        status = await checkStatus(credentials.autoCommenterId);
                        console.log(status)
                    } while (status !== 'finished')
                    console.log('Posts are commented successfully')
                })
            })
        });
    } else {
        console.log(result[0].error)
    }
}

/**
 * Prepare and form data for Auto Commenter
 *
 * @param activities
 * @returns {Promise<activities and comments array>}
 */
async function prepareAutoCommenter (activities ) {
    let comments = await getCommentsArray();
    let formattedData = []
    return await new Promise((resolve, reject) => {
        for (const value of activities) {
            let commentsIndex = Math.floor(Math.random() * Math.floor(comments.length));
            formattedData.push({
                link: value.postUrl,
                comment: comments[commentsIndex],
            });
        }
        resolve(formattedData);
    })
}

/**
 * Fetch comments from database
 *
 * @returns {Promise<comments>}
 */
async function getCommentsArray () {
    let sql = ('SELECT `comment` FROM `comments`');
    return await new Promise((resolve, reject) => {
        let comments = [];
        con.query(sql, async function (err, result) {
            await result.forEach(function (value) {
                comments.push(value.comment);
            });
            resolve(comments);
        });
    });
}

/**
 * Save Linkedin Users urls to database `clients`
 *
 * @param url
 * @param name
 * @param lastName
 * @returns {Promise<unknown>}
 */

async function saveUserToDatabase (url, name, lastName) {
    let sql = ('INSERT INTO clients (`linkedinUrl`, `name`, `lastName`) VALUES ('+ ' \' ' + url + ' \' ' + ' ,  ' + ' \' ' + name + ' \' ' + ' ,  ' + ' \' ' + lastName + ' \' ' + ' ) ');
    return await new Promise((resolve, reject) => {
        con.query(sql, async function (err, result) {
            resolve(result);
        });
    });
}

/**
 *  Run Phantombuster's Auto Commenter agent
 *
 * @param documentLink
 * @returns {Promise<void>}
 */
async function runAutoCommenter (documentLink) {
    await axios
            .post(
                "https://api.phantombuster.com/api/v2/agents/launch",
                {
                    "id": credentials.autoCommenterId,
                    "argument":
                        {
                            "sessionCookie": credentials.sessionCookie,
                            "spreadsheetUrl": documentLink,
                            "columnName":"column A",
                            "columnNameMessage":"column B",
                            "randomComments": false
                        }},
                credentials.initOptions,
            )
            .then((res) => console.log(res.data))
            .catch((error) => console.error("Something went wrong :(", error))
}

/**
 * Run Phantombuster's Auto Liker agent
 *
 * @param documentLink
 * @returns {Promise<void>}
 */
async function runAutoLiker (documentLink) {
    axios
        .post(
            "https://api.phantombuster.com/api/v2/agents/launch",
            {
                "id": credentials.autoLikerId,
                "argument":
                    {"sessionCookie": credentials.sessionCookie,
                        "spreadsheetUrl": documentLink,
                        "articleType":"posts"
                    }
                },
            credentials.initOptions,
        )
        .then((res) => console.log(res.data))
        .catch((error) => console.error("Something went wrong :(", error))
}

/**
 * Start parsing Activities of user
 *
 * @param userLinkedinUrl
 * @returns {Promise<void>}
 */
async function parseActivities (userLinkedinUrl) {
    await axios
        .post(
            "https://api.phantombuster.com/api/v2/agents/launch",
            {
                "id": credentials.activitiesScrapperId,
                "argument":{
                    "sessionCookie": credentials.sessionCookie,
                    "spreadsheetUrl": userLinkedinUrl,
                    "numberOfLinesPerLaunch":10,
                    "numberMaxOfPosts":20,
                    "csvName":"result",
                    "onlyScrapePosts":true,
                    "reprocessAll":false
                }},
            credentials.initOptions,
        )
        .then((res) => likeAndCommentActivities(res.data.containerId))
        .catch((error) => console.error("Something went wrong :(", error))
}

/**
 * Check status of working agent: running/finished
 *
 * @param agentId
 * @returns {Promise<string>}
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
 * Get and save results of searches
 *
 * @param containerId
 * @param scrapperId
 * @returns {Promise<any>}
 */
async function getResults(containerId, scrapperId) {
    let url = 'https://api.phantombuster.com/api/v1/agent/' + scrapperId + '/output' ;
    console.log('Container ID: ' + containerId)
    let options = {
        method: 'GET',
        qs: {containerId: containerId, withoutResultObject: 'false'},
        headers: {
            Accept: 'application/json',
            'X-Phantombuster-Key': credentials.phantomBusterApiKey
        }
    };
    let status = '';
    let result = '';
    // Receiving status, if finished than go on.
    do {
        status = await checkStatus(scrapperId);
        console.log(status)
    } while (status !== 'finished')

    let response = await fetch(url, options)
    if (response.ok) {
        result = await response.json();
        console.log(result)
        if (result.data.resultObject) {
            return await JSON.parse(result.data.resultObject)
        } else {
            console.log(result.data.output);
        }
    }

}

// ---------Start---------
// Reading values from console
let searchArguments = [];
let company = '';
let query = '';
process.argv.forEach(function (val, index, array) {
    if (index > 1) {
        searchArguments.push(val);
    }
});
company = searchArguments[0];
searchArguments.forEach(element => query = query + ' ' + element)

// Running search process on phantombuster
axios
    .post(
        "https://api.phantombuster.com/api/v2/agents/launch",
        {
            "id": credentials.searchScrapperId,
            "argument": {
                "circles": {"first": false, "second": true, "third": true},
                "category": "People",
                "numberOfPage": 5,
                "numberOfLinesPerLaunch": 10,
                "queryColumn": true,
                "sessionCookie": credentials.sessionCookie,
                "search": query
            }
        },
        credentials.initOptions,
    )
    .then((res) => getUsers(res.data.containerId))
    .catch((error) => console.error("Something went wrong :(", error))
