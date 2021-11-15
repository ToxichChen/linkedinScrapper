const DBManager = require('./DBManager')
const searchScript = require('./searchScript.js')
const autoLikerScript = require('./autoLikerCommenter.js')
const autoConnectScript = require('./autoConnect.js')
const SchedulerClass = require('./Scheduler.js');

async function startScrapper() {
    let accountsArray = await Database.getAccounts();
    for (const account of accountsArray) {
        console.log(account)
        let lastLaunches = await Database.getJobsLaunchesByAccount(account.id);
        console.log(lastLaunches)
        let planToLaunch = [];
        let report = {
            script: '',
            success: 0,
            previousError: '',
            error: '',
            account_id: 0,
            queue_id: 0,
            in_progress: 1
        };
        if (lastLaunches !== false && lastLaunches.length === 3) {
            console.log(account.id)
            for (const launch of lastLaunches) {
                // if (launch.error_message !== '') {
                //     report.previousError = launch.error_message;
                // }
                if (launch.script === 'search') {
                    let time = Date.parse(launch.date) + (2 * 60 * 60 * 1000);
                    if (time < Date.now()) {
                        planToLaunch.push(launch);
                        report.script = 'search';
                        report.account_id = account.id;
                        await Scheduler.makeReport(report);
                    }
                    // if launch time + 2hrs < now -> launch again
                } else if (launch.script === 'autoLikerCommenter') {
                    let time = Date.parse(launch.date) + (3 * 60 * 60 * 1000) + (30 * 60 * 1000);
                    if (time < Date.now()) {
                        planToLaunch.push(launch);
                        report.script = 'autoLikerCommenter';
                        report.account_id = account.id;
                        await Scheduler.makeReport(report);
                    }
                } else if (launch.script === 'autoConnect') {
                    let time = Date.parse(launch.date) + (3 * 60 * 60 * 1000) + (10 * 60 * 1000);
                    if (time < Date.now()) {
                        planToLaunch.push(launch);
                        report.script = 'autoConnect';
                        report.account_id = account.id;
                        await Scheduler.makeReport(report);
                    }
                }
            }
        } else {
            report.script = 'search';
            planToLaunch.push({script: report.script});
            report.account_id = account.id;
            await Scheduler.makeReport(report);
            report.script = 'autoLikerCommenter';
            planToLaunch.push({script: report.script});
            report.account_id = account.id;
            await Scheduler.makeReport(report);
            report.script = 'autoConnect';
            planToLaunch.push({script: report.script});
            report.account_id = account.id;
            await Scheduler.makeReport(report);
        }
        console.log(planToLaunch)
        for (const launch of planToLaunch) {
            if (launch.script === 'search') {
                await searchScript.startSearch(account.id);
            } else if (launch.script === 'autoLikerCommenter') {
                await autoLikerScript.startLiker(account.id);
            } else if (launch.script === 'autoConnect') {
                await autoConnectScript.startAutoConnect(account.id);
            }
        }
    }
    await Database.closeDatabaseConnection();
    process.exit();
}

let Database = new DBManager();
let Scheduler = new SchedulerClass();
startScrapper();