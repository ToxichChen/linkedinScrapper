const google = require('./google.js');
const credentials = require('./credentials.js')
const LinkedIn = require('./LinkedInScraper')
const DBManager = require('./DBManager')
const errors = require('./errorList.js')
const SchedulerClass = require('./Scheduler');
const fs = require('fs');


async function makePosts() {
    let accountsArray = await Database.getAccounts();
    let content = '';
    let contentArray = [];
    reportId = await Scheduler.makeReport(report);
    if (accountsArray === false) {
        report.in_progress = 0;
        report.error = errors.noActiveAccounts;
        console.log(report.error);
        await Scheduler.updateReport(reportId, report);
        process.exit();
    }
    for (const account of accountsArray) {
        let post = await Database.getNotPostedPostByAccountId(account.id);
        if (post === false) {
            console.log("Posts for account " + account.name + " " + account.last_name +" are not found!")
            continue;
        }
        console.log(post)
        content = post.text + '\n \n' + post.link;
        contentArray.push({
            content: content,
        });
        await google.saveOnDisk(contentArray, 'posts').then(async function (value) {
            if (typeof value.success !== 'undefined' && value.success === false) {
                report.error = value.errorMessage;
                report.in_progress = 0;
                await Scheduler.updateReport(reportId, report);
                await Database.closeDatabaseConnection();
                fs.appendFile('log.txt', '\n Code finished with error:' + value.errorMessage, function (err) {
                });
                console.log('Code finished with error:' + value.errorMessage);
                process.exit();
            }
            await LinkedInScraper.runAutoPoster(value, await Database.getAccountSessionByID(account.id)).then(async function (value) {
                let result = await LinkedInScraper.getResults(value, credentials.autoPosterId);
                console.log(result);
                if (result.error) {
                    report.error = result.error;
                    report.in_progress = 0;
                    await Scheduler.updateReport(reportId, report);
                    //  process.exit();
                }
                report.success = 1;
                report.in_progress = 0;
                await Scheduler.updateReport(reportId, report);
            })
        });
    }
}

let report = {
    script: 'autoPoster',
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

makePosts();