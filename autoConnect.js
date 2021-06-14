const google = require('./google.js');
const credentials = require('./credentials.js')
const LinkedIn = require('./LinkedInScraper')
const DBManager = require('./DBManager')
const SchedulerClass = require('./Scheduler');
const errors = require('./errorList.js')
const fs = require('fs');

/**
 *  Create a Google Drive document with Linkedin Users urls and start Auto Connect with it
 *
 * @returns {Promise<void>}
 */

async function autoConnect() {
    console.time("connect");
    fs.appendFile('log.txt', '\n connect', function (err) {
    });
    let queue = await Database.getNotConnectedQueue();
    if (queue === false ) {
        report.error = errors.allQueuesProcessed;
        await Scheduler.makeReport(report);
        await Database.closeDatabaseConnection();
        process.exit();
    }
    let links = await LinkedInScraper.prepareAutoConnector(queue.id);
    console.log(links)

    if (links !== false) {
        await google.saveOnDisk(links, 'users').then(async function (value) {
            if (typeof value.success !== 'undefined' && value.success === false) {
                report.success = 0;
                report.error = value.errorMessage;
                await Scheduler.makeReport(report);
                await Database.closeDatabaseConnection();
                fs.appendFile('log.txt', '\n Code finished with error:' + value.errorMessage, function (err) {
                });
                console.log('Code finished with error:' + value.errorMessage);
                process.exit();
            } else {
                await LinkedInScraper.runAutoConnect(value, await Database.getAccountSessionByID(queue.account_id)).then(async function (value) {
                    let result = await LinkedInScraper.getResults(value, credentials.autoConnectAgentId);
                    console.log(result);
                    if (result.error) {
                        report.error = result.error;
                        await Scheduler.makeReport(report);
                        process.exit();
                    }
                    report.success = 1;
                    await Scheduler.makeReport(report);
                    for (let link of links) {
                        await Database.setConnected(link.link);
                        fs.appendFile('log.txt', '\n ' + link.link + ' - connection sent', function (err) {
                        });
                    }
                    await Database.closeDatabaseConnection();
                    console.timeEnd("connect");
                    fs.appendFile('log.txt', '\n Connection requests are sent successfully!', function (err) {
                    });
                    console.log('Connection requests are sent successfully!');
                    process.exit();
                });
            }
        });
    } else {
        report.error = errors.allConnected;
        await Scheduler.makeReport(report);
        await Database.updateConnectedQueue(queue.id);
        process.exit();
    }
}

let report = {
    script: 'autoConnect',
    success: 0,
    error: ''
};
let Database = new DBManager();
let LinkedInScraper = new LinkedIn();
let Scheduler = new SchedulerClass()

autoConnect()