const google = require('./google.js');
const credentials = require('./credentials.js')
const LinkedIn = require('./LinkedInScraper')

async function sleep() {
    let time = Math.floor(Math.random() * (300000 - 50000) + 50000);
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

async function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = await Math.floor(await Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

async function splitArray (array) {
    let arraySize = await Math.floor(Math.random() * (3 - 1) + 1);
    let formedArray = [];
    for (let i = 0; i < arraySize; index ++, i ++) {
        if (array[index] !== undefined) {
            await formedArray.push(array[index])
        }
    }
    console.log(index)
    if (formedArray.length > 0) {
        return formedArray
    } else {
        return false
    }
}

async function useAutoLikerAndAutoCommenter(containerId) {
    console.log(containerId)
    let result = await LinkedInScraper.getResults(containerId, credentials.activitiesScrapperId)
    if (!result[0] || !result[0].error) {
        let postsArray = [];
        let array = await shuffle(result);
        while (postsArray = await splitArray(array)) {
            let documentLink = '';
            console.log(postsArray)
            console.log(await LinkedInScraper.prepareAutoCommenter(postsArray))
            await google.saveOnDisk(await LinkedInScraper.prepareAutoCommenter(postsArray), 'comments').then(async function (value) {
                documentLink = value;
                await sleep();
                await LinkedInScraper.runAutoLiker(value).then(async function (value) {
                    await LinkedInScraper.getResults(value, credentials.autoLikerId)
                    console.log('Posts are liked successfully')
                }).then(async function () {
                    await sleep()
                    await LinkedInScraper.runAutoCommenter(documentLink).then(async function (value) {
                        await LinkedInScraper.getResults(value, credentials.autoCommenterId)
                        console.log('Posts are commented successfully')
                    })
                })
            })
            await sleep();
        }
    }
}

// Running search process on phantombuster
async function startScraper(query) {
    let containerId = await LinkedInScraper.startLinkedInSearchForPeople(query)
    let result = await LinkedInScraper.getResults(containerId, credentials.searchScrapperId);
    let array = await shuffle(result);
    for (const user of array) {
        if (!user.error) {
            await LinkedInScraper.saveUserToDatabase(user.url, user.firstName, user.lastName)
            await sleep();
            index = 0;
            await useAutoLikerAndAutoCommenter(await LinkedInScraper.parseActivities(user.url));
        }
    }
    await LinkedInScraper.closeDatabaseConnection();
}

// ---------Start---------
// Reading values from console
let searchArguments = [];
let query = '';
let index = 0;
process.argv.forEach(function (val, index) {
    if (index > 1) {
        searchArguments.push(val);
    }
});
company = searchArguments[0];
searchArguments.forEach(element => query = query + ' ' + element)

let LinkedInScraper = new LinkedIn();

startScraper(query)

// const axios = require("axios")
//
// const options = {
//     headers: {
//         "x-phantombuster-key": "EyFgiCi6NdgRhjv9dBtqncWTVyw3ssyMDeTmwShRToY",
//         "Content-Type": "application/json",
//     },
// }
// let LinkedInScraper = new LinkedIn();
// axios
//     .post(
//         "https://api.phantombuster.com/api/v2/agents/launch",
//         {
//             "id":"3859887893193578",
//             "argument":{
//                 "firstCircle":true,
//                 "secondCircle":true,
//                 "thirdCircle":true,
//                 "category":"People",
//                 "numberOfLinesPerLaunch":10,
//                 "sessionCookie":"AQEDATUY_a4DstQFAAABeKE3lT8AAAF4xUQZP00AbIV5hTvI_Rg-O6JJDApgP4OBbKCJkaDS4Yt5sMpExUIAKI6KVKtU3Ooz5KX_4DGocA0zF2EM5Li17tB1v7S6GyXYRKcG3Hgoy-IILmCOeVX1uDvQ",
//                 "search":"itechart group",
//                 "numberOfResultsPerLaunch":30,
//                 "numberOfResultsPerSearch":60,
//                 "removeDuplicateProfiles":true,
//                 "csvName":"itechartGroup"}},
//         options,
//     )
//     .then((res) => console.log(LinkedInScraper.getResults(res.data, credentials.searchScrapperId)))
//     .catch((error) => console.error("Something went wrong :(", error))
// const fetch = require('node-fetch');
//
// let url = 'https://api.phantombuster.com/api/v1/agent/' + credentials.searchScrapperId + '/output';
// console.log('Container ID: 4320286229357853')
// let options = {
//     method: 'GET',
//     qs: {containerId: '4320286229357853', withoutResultObject: 'false'},
//     headers: {
//         Accept: 'application/json',
//         'X-Phantombuster-Key': credentials.phantomBusterApiKey
//     }
// };
//
// let response =  fetch(url, options)
// if (response.ok) {
//     result =  response.json();
//     console.log(result)
//     if (result.data.resultObject) {
//         console.log(JSON.parse(result.data.resultObject))
//     } else {
//         console.log(result.data.output);
//     }
// } else {
//     console.log('Request failed')
// }