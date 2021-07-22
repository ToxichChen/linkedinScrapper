const credentials = require('./credentials.js')
const errors = require('./errorList.js')
const LinkedIn = require('./LinkedInScraper')
const DBManager = require('./DBManager')
const SchedulerClass = require('./Scheduler');


let LinkedInScraper = new LinkedIn();
let Database = new DBManager();
let Scheduler = new SchedulerClass();
//async function startSearch() {
module.exports.startSearch = async function (accountId) {
    console.time("search");
    let result = false;
    let report = {
        script: 'search',
        success: 0,
        error: '',
        account_id: accountId,
        queue_id: 0,
        in_progress: 1
    };
    let reportId = await Database.getIdOfLastWorkingReport(accountId, report.script);
    do {
        let query = await Database.getSearchQueryByAccountId(accountId);
        if (query === false) {
            report.error = errors.allQueriesSearched;
            console.log(report.error)
            report.in_progress = 0;
            await Scheduler.updateReport(reportId, report);
            break
        }
        report.account_id = query.account_id;
        let containerId = await LinkedInScraper.startLinkedInSearchForPeople(query.query, query.file_name, await Database.getAccountSessionByID(query.account_id));
        result = await LinkedInScraper.getResults(containerId, credentials.searchScrapperId);
        if (result.error) {
            report.error = result.error;
            report.in_progress = 0;
            await Scheduler.updateReport(reportId, report);I
            break;
        }

        if (result !== false) {
            let queueId = await Database.createQueue(query.account_id, query.id);
            for (const user of result) {
                if (!user.error) {
                    await Database.saveUserToDatabase(user.url, user.firstName, user.lastName, query.account_id, queueId)
                }
            }
            report.success = 1;
            report.queue_id = queueId;
            report.in_progress = 0;
            await Scheduler.updateReport(reportId, report);
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