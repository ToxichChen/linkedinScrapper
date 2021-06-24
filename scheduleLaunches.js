const DBManager = require('./DBManager')
const searchScript = require('./searchScript.js')
const autoLikerScript = require('./autoLikerCommenter.js')
const autoConnectScript = require('./autoConnect.js')

async function startScrapper() {
    let accountsArray = await Database.getAccounts();
    for (const account of accountsArray) {
        let lastLaunches = await Database.getJobsLaunchesByAccount(account.id);
        if (lastLaunches !== false) {
            console.log(account.id)
            for (const launch of lastLaunches) {
                if (launch.script === 'search') {
                    let time = Date.parse(launch.date) + (2 * 60 * 60 * 1000);
                    if (time < Date.now()) {
                        await searchScript.startSearch(account.id);
                    }
                    // if launch time + 2hrs < now -> launch again
                } else if (launch.script === 'autoLikerCommenter') {
                    let time = Date.parse(launch.date) + (3 * 60 * 60 * 1000) + (30 * 60 * 1000);
                     if (time < Date.now()) {
                         await autoLikerScript.startLiker(account.id);
                     }
                } else if (launch.script === 'autoConnect') {
                    let time = Date.parse(launch.date) + (3 * 60 * 60 * 1000) + (10 * 60 * 1000);
                    if (time < Date.now()) {
                        await autoConnectScript.startAutoConnect(account.id);
                    }
                }
            }
        } else {
            await searchScript.startSearch(account.id);
            await autoLikerScript.startLiker(account.id);
            await autoConnectScript.startAutoConnect(account.id);
        }
    }
    await Database.closeDatabaseConnection();
    process.exit();
}

let Database = new DBManager();
startScrapper();