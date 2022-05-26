const google = require('../google.js');
const credentials = require('../credentials.js')
const LinkedIn = require('../classes/LinkedInScraper')
const DBManager = require('../classes/DBManager')
const SchedulerClass = require('../classes/Scheduler');
const errors = require('../constants/errorList.js')
const fs = require('fs');

/**
 *  Create a Google Drive document with Linkedin Users urls and start Auto Connect with it
 *
 * @returns {Promise<void>}
 */

//async function autoConnect() {
let report = {
    script: 'autoConnect',
    success: 0,
    error: '',
    account_id: 0,
    queue_id: 0,
    in_progress: 1
};
let Database = new DBManager();
let LinkedInScraper = new LinkedIn();
let Scheduler = new SchedulerClass()
let reportId = 0;

module.exports.startAutoConnect = async function (accountId) {
    console.time("connect");
    fs.appendFile('log.txt', '\n connect', function (err) {
    });
    report.account_id = accountId;
    reportId = await Database.getIdOfLastWorkingReport(accountId, report.script);
    let queue = await Database.getNotConnectedQueueByAccountId(accountId);
    if (queue === false) {
        report.error = errors.allQueuesProcessed;
        report.in_progress = 0;
        await Scheduler.sendErrorNotification(report.error, report.script, await Database.getAccountFullNameByID(report.account_id));
        await Scheduler.updateReport(reportId, report);
        return new Promise((resolve, reject) => {
            resolve(false);
        });
        // await Database.closeDatabaseConnection();
        // process.exit();
    }
    report.queue_id = queue.id;
    let links = await LinkedInScraper.prepareAutoConnector(queue.id);
    console.log(links)

    if (links !== false) {
        await google.saveOnDisk(links, 'users').then(async function (value) {
            if (typeof value.success !== 'undefined' && value.success === false) {
                report.error = value.errorMessage;
                report.in_progress = 0;
                await Scheduler.sendErrorNotification(report.error, report.script, await Database.getAccountFullNameByID(report.account_id));
                await Scheduler.updateReport(reportId, report);
                //await Database.closeDatabaseConnection();
                fs.appendFile('log.txt', '\n Code finished with error:' + value.errorMessage, function (err) {
                });
                console.log('Code finished with error:' + value.errorMessage);
                // process.exit();
                return new Promise((resolve, reject) => {
                    resolve(false);
                });
            } else {
                await LinkedInScraper.runAutoConnect(value, await Database.getAccountSessionByID(queue.account_id)).then(async function (value) {
                    let result = await LinkedInScraper.getResults(value, credentials.autoConnectAgentId);
                    console.log(result);
                    if (result.error) {
                        report.error = result.error;
                        report.in_progress = 0;
                        await Scheduler.sendErrorNotification(report.error, report.script, await Database.getAccountFullNameByID(report.account_id));
                        await Scheduler.updateReport(reportId, report);
                        //  process.exit();
                    }
                    report.success = 1;
                    report.in_progress = 0;
                    await Scheduler.updateReport(reportId, report);
                    for (let link of links) {
                        await Database.setConnected(link.link);
                        fs.appendFile('log.txt', '\n ' + link.link + ' - connection sent', function (err) {
                        });
                    }
                    //await Database.closeDatabaseConnection();
                    console.timeEnd("connect");
                    fs.appendFile('log.txt', '\n Connection requests are sent successfully!', function (err) {
                    });
                    console.log('Connection requests are sent successfully!');
                    //process.exit();
                    return new Promise((resolve, reject) => {
                        resolve(true);
                    });
                });
            }
        });
    } else {
        report.error = errors.allConnected;
        report.in_progress = 0;
        await Scheduler.updateReport(reportId, report);
        await Database.updateConnectedQueue(queue.id);
        return new Promise((resolve, reject) => {
            resolve(false);
        });
        //process.exit();
    }
}

//autoConnect()
