const credentials = require('./credentials.js')
const errors = require('./errorList.js')
const LinkedIn = require('./LinkedInScraper')
const DBManager = require('./DBManager')
const SchedulerClass = require('./Scheduler');


async function startSearch() {
    let result = true;
    let report = {
        script: 'search',
        success: 0,
        error: ''
    };
    do {
        let query = await Database.getSearchQuery();
        if (query === false) {
            report.error = errors.allQueriesSearched;
            await Scheduler.makeReport(report);
            break
        }
        let containerId = await LinkedInScraper.startLinkedInSearchForPeople(query.query, query.file_name);
        result = await LinkedInScraper.getResults(containerId, credentials.searchScrapperId);
        if (result.error) {
            report.error = result.error;
            await Scheduler.makeReport(report);
            break
        }
        if (result !== false) {
            for (const user of result) {
                if (!user.error) {
                    await Database.saveUserToDatabase(user.url, user.firstName, user.lastName)
                }
            }
            report.success = 1;
            await Scheduler.makeReport(report)
        } else {
            await Database.updateSearchQuery(query);
        }
    } while (result === false);
    await Database.closeDatabaseConnection();
}

let LinkedInScraper = new LinkedIn();
let Database = new DBManager();
let Scheduler = new SchedulerClass();

startSearch()