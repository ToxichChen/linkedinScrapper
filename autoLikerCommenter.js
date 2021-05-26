const google = require('./google.js');
const credentials = require('./credentials.js')
const LinkedIn = require('./LinkedInScraper')
const DBManager = require('./DBManager')
const SchedulerClass = require('./Scheduler');

async function sleep() {
    let time = Math.floor(Math.random() * (300000 - 50000) + 50000);
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

async function useAutoLikerAndAutoCommenter(containerId) {
    console.log(containerId)
    let result = await LinkedInScraper.getResults(containerId, credentials.activitiesScrapperId);

    if (result.error) {
        report.error = result.error;
        await Scheduler.makeReport(report);
        await database.closeDatabaseConnection();
        return false;
    }

    let documentLink = '';
   // console.log(await LinkedInScraper.prepareAutoCommenter(result))
    await google.saveOnDisk(await LinkedInScraper.prepareAutoCommenter(result), 'comments').then(async function (value) {
        documentLink = value;
        await sleep();
        await LinkedInScraper.runAutoLiker(value).then(async function (value) {
            let likerResult = await LinkedInScraper.getResults(value, credentials.autoLikerId)
            if (likerResult.error) {
                report.error = result.error;
                await Scheduler.makeReport(report);
                return false;
            }
            console.log('Posts are liked successfully')
        }).then(async function () {
            await sleep()
            await LinkedInScraper.runAutoCommenter(documentLink).then(async function (value) {
                let commenterResult = await LinkedInScraper.getResults(value, credentials.autoCommenterId)
                if (commenterResult.error) {
                    report.error = result.error;
                    await Scheduler.makeReport(report);
                    return false;
                }
                console.log('Posts are commented successfully')
            })
        })
    })
}

async function startScraper() {
    let result = await database.getNotLikedUsersArray();
    console.log(result)
    for (const user of result) {
        console.log(user)
        await useAutoLikerAndAutoCommenter(await LinkedInScraper.parseActivities(user));
        await database.updateUsersLikedAndCommented(user);
        await sleep();
    }
    console.log('Finished!')
    report.success = 1;
    console.log(report);
    await Scheduler.makeReport(report)
    await database.closeDatabaseConnection();
}
let report = {
    script: 'autoLikerCommenter',
    success: 0,
    error: ''
};
let database = new DBManager();
let Scheduler = new SchedulerClass();
let LinkedInScraper = new LinkedIn();
startScraper();
