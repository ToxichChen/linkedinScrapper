const credentials = require('../credentials.js')
const constants = require('../constants/constants.js')
const errors = require('../constants/errorList.js')
const LinkedIn = require('../classes/LinkedInScraper')
const DBManager = require('../classes/DBManager')
const SchedulerClass = require('../classes/Scheduler');

const LinkedInScraper = new LinkedIn();
const Database = new DBManager();
const Scheduler = new SchedulerClass();


async function parseProfile() {
    let accountsArray = await Database.getAccounts();
    for (let account of accountsArray) {
        let employee = await Database.getNotParsedEmployee();
        console.log(employee);
        if (employee.linkedin_url != '') {
            let containerId = await LinkedInScraper.runProfileScrapper(employee.linkedin_url, account.session_token);
            let results = await LinkedInScraper.getResults(containerId, credentials.profileScrapperId);
            if (results.error) {
                console.log(results.error);
                await Database.updateParsedEmployee(employee.id);
                continue;
            }
            results = results[0];
            console.log(results);
            let email = '';
            if (results.dropcontact && results.dropcontact.email) {
                email = results.dropcontact.email;
            }
            await Database.createEmployeeInfo(results.general, email, employee.id, employee.company_id);
            if (results.jobs) {
                for (let job of results.jobs) {
                    await Database.createEmployeeJob(job, employee.id)
                }
            }
            if (results.schools) {
                for (let school of results.schools) {
                    await Database.createEmployeeEducation(school, employee.id)
                }
            }
            if (results.skills) {
                for (let skill of results.skills) {
                    await Database.createEmployeeSkill(skill, employee.id)
                }
            }
            await Database.updateParsedEmployee(employee.id);
            await Database.closeDatabaseConnection();
        }
    }
}

parseProfile();
