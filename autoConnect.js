const google = require('./google.js');
const credentials = require('./credentials.js')
const LinkedIn = require('./LinkedInScraper')
const DBManager = require('./DBManager')

/**
 *  Create a Google Drive document with Linkedin Users urls and start Auto Connect with it
 *
 * @returns {Promise<void>}
 */

async function autoConnect() {
    await google.saveOnDisk(await LinkedInScraper.prepareAutoConnector (), 'users').then(async function(value) {
        await LinkedInScraper.runAutoConnect(value).then(async function (value) {
            let result = await LinkedInScraper.getResults(value, credentials.autoLikerId)
            console.log(result)
            if (result.error) {
                report.error = result.error;
                await Scheduler.makeReport(report);
                return false;
            }
            await database.setConnected()
            console.log('Connection requests are sent successfully!')
        });
     });
}

let report = {
    script: 'autoLikerCommenter',
    success: 0,
    error: ''
};
let database = new DBManager();
let LinkedInScraper = new LinkedIn();

autoConnect()