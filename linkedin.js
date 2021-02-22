const axios = require("axios")
const mysql = require('mysql');
const fetch = require('node-fetch');
const fs = require('fs');
const google = require('./google.js');


let con = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "root",
    database: "linkedin"
});

const searchScrapperId = '5481724136268845';
const profileScrapperId = '7534201859802850';
const activitiesScrapperId = '2323214014770879';
const autoLikerId = '3442324939018265';
const autoCommenterId = '7247605854052666';
const rocketSearchApiKey = '8cd41kb002500ac227ce845e7e889ac9d40265';
const phantomBusterApiKey = 'uFYNGCPshHobRk3kB7tNyKUsuXmrpnO9bom77Cl04fI';
const sessionCookie = 'AQEDATR7_soDTn4sAAABd8kymjEAAAF37T8eMVYA0Wm9TUeleCs6xcjcqFtdHtsvww2Dtwx-P_LQILsMVHYfNQPdJBd_MJ5UtQKgGuftnxZIgHEZe2jdNqCVwBZQydGp0agZOqqK9QLNP9DNZNXmzWm9';
// Credentials for phantombuster
const initOptions = {
    headers: {
        "x-phantombuster-key": phantomBusterApiKey,
        "Content-Type": "application/json",
    },
}
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

// Get result of Users Search and run Activities parsing
async function getUsers(containerId) {
    let result = await getResults(containerId, searchScrapperId);
    for (const user of result) {
        await parseActivities(user.url);
    }
    con.end()
}

// Get Activities and start Liking and Commenting process
async function likeAndCommentActivities (containerId) {
    console.log(containerId)
    let result = await getResults(containerId, activitiesScrapperId)
    if (!result[0] || !result[0].error) {
        let documentLink = '';
        await google.saveOnDisk(await prepareAutoCommenter(result)).then(async function(value) {
            documentLink = value;
            await runAutoLiker(value).then(async function(value) {
                let status;
                do {
                    status = await checkStatus(autoLikerId);
                    console.log(status)
                } while (status !== 'finished')
                console.log('Posts are liked successfully')
            }).then(async function () {
                await runAutoCommenter(documentLink).then(async function(value) {
                    let status;
                    do {
                        status = await checkStatus(autoCommenterId);
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

// Prepare and form data for Auto Commenter
async function prepareAutoCommenter (activities ) {
    let comments = await getCommentsArray();
    let formattedData = []
    return await new Promise((resolve, reject) => {
        for (const value of activities) {
            let commentsIndex = Math.floor(Math.random() * Math.floor(comments.length));
            formattedData.push({
                link: value.postUrl,
                comment: comments[commentsIndex],
            })
        }
        resolve(formattedData);
    })
}

// Fetch comments from database
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

// Run Phantombuster's Auto Commenter agent
async function runAutoCommenter (documentLink) {
    await   axios
            .post(
                "https://api.phantombuster.com/api/v2/agents/launch",
                {
                    "id": autoCommenterId,
                    "argument":
                        {
                            "sessionCookie": sessionCookie,
                            "spreadsheetUrl": documentLink,
                            "columnName":"column A",
                            "columnNameMessage":"column B",
                            "randomComments": false
                        }},
                initOptions,
            )
            .then((res) => console.log(res.data))
            .catch((error) => console.error("Something went wrong :(", error))
}

// Run Phantombuster's Auto Liker agent
async function runAutoLiker (documentLink) {
    axios
        .post(
            "https://api.phantombuster.com/api/v2/agents/launch",
            {
                "id": autoLikerId,
                "argument":
                    {"sessionCookie": sessionCookie,
                        "spreadsheetUrl": documentLink,
                        "articleType":"posts"
                    }
                },
            initOptions,
        )
        .then((res) => console.log(res.data))
        .catch((error) => console.error("Something went wrong :(", error))
}

// Start parsing Activities of user
async function parseActivities (userLinkedinUrl) {
    await axios
        .post(
            "https://api.phantombuster.com/api/v2/agents/launch",
            {
                "id": activitiesScrapperId,
                "argument":{
                    "sessionCookie": sessionCookie,
                    "spreadsheetUrl": userLinkedinUrl,
                    "numberOfLinesPerLaunch":10,
                    "numberMaxOfPosts":20,
                    "csvName":"result",
                    "onlyScrapePosts":true,
                    "reprocessAll":false
                }},
            initOptions,
        )
        .then((res) => likeAndCommentActivities(res.data.containerId))
        .catch((error) => console.error("Something went wrong :(", error))
}

// Check status of working agent: running/finished
async function checkStatus(agentId) {
    let url = 'https://api.phantombuster.com/api/v2/agents/fetch-output?id=' + agentId;
    let result = '';
    let options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-Phantombuster-Key': phantomBusterApiKey
        }
    };

    let response = await fetch(url, options)
    if (response.ok) {
        result = await response.json();
        return result.status;
    }
}

// Get and save results of searches
async function getResults(containerId, scrapperId) {
    let url = 'https://api.phantombuster.com/api/v1/agent/' + scrapperId + '/output';
    console.log('Container ID: ' + containerId)
    let options = {
        method: 'GET',
        qs: {containerId: containerId, withoutReusltObject: 'false'},
        headers: {
            Accept: 'application/json',
            'X-Phantombuster-Key': phantomBusterApiKey
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
searchArguments.forEach(element => query = query + '  ' + element)

// Running search process on phantombuster
axios
    .post(
        "https://api.phantombuster.com/api/v2/agents/launch",
        {
            "id": searchScrapperId,
            "argument": {
                "circles": {"first": false, "second": true, "third": true},
                "category": "People",
                "numberOfPage": 5,
                "numberOfLinesPerLaunch": 10,
                "queryColumn": true,
                "sessionCookie": sessionCookie,
                "search": query
            }
        },
        initOptions,
    )
    .then((res) => getUsers(res.data.containerId))
    .catch((error) => console.error("Something went wrong :(", error))
