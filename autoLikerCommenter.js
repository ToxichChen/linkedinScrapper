const google = require('./google.js');
const credentials = require('./credentials.js')
const LinkedIn = require('./LinkedInScraper')
const DBManager = require('./DBManager')
const SchedulerClass = require('./Scheduler');
const errors = require('./errorList.js')
const fs = require('fs');


async function sleep() {
    let time = Math.floor(Math.random() * (180000 - 30000) + 30000);
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

async function useAutoLikerAndAutoCommenter(containerId, queue) {
    console.log(containerId)
    fs.appendFile('log.txt', '\n' + containerId, function (err) {
    });
    let result = await LinkedInScraper.getResults(containerId, credentials.activitiesScrapperId);

    if (result.error) {
        report.error = result.error;
        fs.appendFile('log.txt', '\n' + result.error, function (err) {
        });
        await Scheduler.makeReport(report);
        await Database.closeDatabaseConnection();
        return false;
    }

    let documentLink = '';
   // console.log(await LinkedInScraper.prepareAutoCommenter(result))
    await google.saveOnDisk(await LinkedInScraper.prepareAutoCommenter(result), 'comments').then(async function (value) {
        if (typeof value.success !== 'undefined' && value.success === false) {
            report.success = 0;
            report.error = value.errorMessage;
            await Scheduler.makeReport(report);
            await Database.closeDatabaseConnection();
            fs.appendFile('log.txt', '\n' + value.errorMessage, function (err) {
            });
            console.log('Code finished with error:' + value.errorMessage);
        } else {
            documentLink = value;
            await sleep();
            await LinkedInScraper.runAutoLiker(value, await Database.getAccountSessionByID(queue.account_id)).then(async function (value) {
                let likerResult = await LinkedInScraper.getResults(value, credentials.autoLikerId)
                if (likerResult.error) {
                    report.error = result.error;
                    await Scheduler.makeReport(report);
                    return false;
                }
                fs.appendFile('log.txt', '\n Posts are liked successfully', function (err) {
                });
                console.log('Posts are liked successfully')
            }).then(async function () {
                await sleep()
                await LinkedInScraper.runAutoCommenter(documentLink, await Database.getAccountSessionByID(queue.account_id)).then(async function (value) {
                    let commenterResult = await LinkedInScraper.getResults(value, credentials.autoCommenterId)
                    if (commenterResult.error) {
                        report.error = result.error;
                        fs.appendFile('log.txt', '\n' + result.error, function (err) {
                        });
                        await Scheduler.makeReport(report);
                        return false;
                    }
                    fs.appendFile('log.txt', '\n Posts are commented successfully ', function (err) {
                    });
                    console.log('Posts are commented successfully')
                })
            })
        }
    })
}

async function startScraper() {
    console.time("liker");
    let queue = await Database.getNotLikedQueue();
    if (queue === false ) {
        report.error = errors.allQueuesProcessed;
        await Scheduler.makeReport(report);
        await Database.closeDatabaseConnection();
        process.exit();
    }

    fs.appendFile('log.txt', '\n Queue for liker = ' + queue.id, function (err) {
    });
    let result = await Database.getNotLikedUsersArray(queue.id)
    if (result !== false) {
        console.log(result)
        for (const user of result) {
            fs.appendFile('log.txt', '\n' + user.linkedinUrl, function (err) {
            });
            console.log(user.linkedinUrl)
            await useAutoLikerAndAutoCommenter(await LinkedInScraper.parseActivities(user.linkedinUrl, await Database.getAccountSessionByID(queue.account_id)), queue);
            await Database.updateUsersLikedAndCommented(user.id);
            await sleep();
        }
        console.log('Finished!')
        fs.appendFile('log.txt', '\n AutoLikerCommenter Finished!', function (err) {
        });
        report.success = 1;
        await Scheduler.makeReport(report);
        await Database.closeDatabaseConnection();
        console.timeEnd("liker");
        process.exit();
    } else {
        await Database.updateLikedQueue(queue.id);
        report.error = errors.allAccountsLiked;
        await Scheduler.makeReport(report);
        await Database.closeDatabaseConnection();
        process.exit();
    }
}
let report = {
    script: 'autoLikerCommenter',
    success: 0,
    error: ''
};
let Database = new DBManager();
let Scheduler = new SchedulerClass();
let LinkedInScraper = new LinkedIn();
startScraper();
