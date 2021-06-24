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
        report.in_progress = 0;
        fs.appendFile('log.txt', '\n' + result.error, function (err) {
        });
        await Scheduler.updateReport(reportId, report);
        //await Database.closeDatabaseConnection();
        return false;
    } else if (result.notice) {
        console.log(result.notice)
        return false;
    }

    let documentLink = '';
   // console.log(await LinkedInScraper.prepareAutoCommenter(result))
    await google.saveOnDisk(await LinkedInScraper.prepareAutoCommenter(result), 'comments').then(async function (value) {
        if (typeof value.success !== 'undefined' && value.success === false) {
            report.success = 0;
            report.in_progress = 0;
            report.error = value.errorMessage;
            await Scheduler.updateReport(reportId, report);
            //await Database.closeDatabaseConnection();
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
                    report.in_progress = 0;
                    await Scheduler.updateReport(reportId, report)
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
                        report.in_progress = 0;
                        fs.appendFile('log.txt', '\n' + result.error, function (err) {
                        });
                        await Scheduler.updateReport(reportId, report);
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

let report = {
    script: 'autoLikerCommenter',
    success: 0,
    error: '',
    account_id: 0,
    queue_id: 0,
    in_progress: 1
};
let Database = new DBManager();
let Scheduler = new SchedulerClass();
let LinkedInScraper = new LinkedIn();
let reportId = 0;

//async function startScraper(accountId) {
module.exports.startLiker = async function (accountId) {
    console.time("liker");
    let queue = await Database.getNotLikedQueueByAccountId(accountId);
    if (queue === false ) {
        report.error = errors.allQueuesProcessed;
        report.in_progress = 0;
        await Scheduler.makeReport(report);
        return new Promise((resolve, reject) => {
            resolve(false);
        });
        // await Database.closeDatabaseConnection();
        // process.exit();
    }
    report.account_id = queue.account_id;
    report.queue_id = queue.id;
    fs.appendFile('log.txt', '\n Queue for liker = ' + queue.id);
    reportId = await Scheduler.makeReport(report);
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
        report.in_progress = 0;
        await Scheduler.updateReport(reportId, report);
        console.timeEnd("liker");
        // await Database.closeDatabaseConnection();
        // process.exit();
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    } else {
        await Database.updateLikedQueue(queue.id);
        report.error = errors.allAccountsLiked;
        report.in_progress = 0;
        await Scheduler.updateReport(reportId, report);
        return new Promise((resolve, reject) => {
            resolve(false);
        });
        // await Database.closeDatabaseConnection();
        // process.exit();
    }
}

//startScraper(3);
