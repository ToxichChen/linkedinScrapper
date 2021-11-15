const credentials = require('./credentials.js')
const errors = require('./errorList.js')
const LinkedIn = require('./LinkedInScraper')
const DBManager = require('./DBManager')
const SchedulerClass = require('./Scheduler');


let LinkedInScraper = new LinkedIn();
let Database = new DBManager();
let Scheduler = new SchedulerClass();
//async function startSearch() {
module.exports.startSearch = async function (accountId, report) {
    console.time("search");
    let result = false;
    let reportId = await Database.getIdOfLastWorkingReport(accountId, report.script);
    report.account_id = accountId;
    do {
        let query = await Database.getSearchQueryByAccountId(accountId);
        if (query === false) {
            await Scheduler.formReport(report, errors.allQueriesSearched);
            break;
        }
        let containerId = await LinkedInScraper.startLinkedInSearchForPeople(query.query, query.file_name, await Database.getAccountSessionByID(query.account_id));
        result = await LinkedInScraper.getResults(containerId, credentials.searchScrapperId);
        if (result.error) {
            await Scheduler.formReport(report, result.error);
            break;
        }

        if (result !== false) {
            let queueId = await Database.createQueue(query.account_id, query.id);
            for (const user of result) {
                if (!user.error) {
                    await Database.saveUserToDatabase(user.url, user.firstName, user.lastName, query.account_id, queueId)
                }
            }
            report.queue_id = queueId;
            await Scheduler.formReport(report, result.error);
        } else {
            await Database.updateSearchQuery(query);
        }
    } while (result === false);
    console.log('Finished!');
    //await Database.closeDatabaseConnection();
    console.timeEnd("search");
    return new Promise((resolve, reject) => {
        resolve(true);
    });
    //process.exit();
}

//startSearch()