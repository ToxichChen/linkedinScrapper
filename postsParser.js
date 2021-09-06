const puppeteer = require('puppeteer');
const DBManager = require('./DBManager')
const SchedulerClass = require('./Scheduler');
const errors = require('./errorList.js')

async function comparePost(accountId, savedPosts, link) {
    for (const post of savedPosts) {
        if (post.link.trim() === link.trim() && post.account_id === accountId) {
            return false;
        }
    }
    return true;
}

async function getData(url) {
    let accountsArray = await Database.getAccounts();
    let savedPosts = await Database.getAllPosts();
    reportId = await Scheduler.makeReport(report);
    if (accountsArray === false) {
        report.in_progress = 0;
        report.error = errors.noActiveAccounts;
        console.log(report.error);
        await Scheduler.updateReport(reportId, report);
        process.exit();
    }
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url);

        for (let account of accountsArray) {
            if (await Database.getNotPostedPostsByAccountId(account.id) !== false) {
                continue;
            }
            await page.waitForSelector('input[name=q]');
            await page.waitForSelector('input[name=wm]');

            const searchQuery = account.work_sphere;
            await page.$eval('input[name=q]', (el, value) => el.value = value, searchQuery);
            const checkbox = await page.$('input[name=wm]');
            if (await (await checkbox.getProperty('checked')).jsonValue() === true) {
                await page.$eval('input[name="wm"]', check => check.checked = false);
            }
            await page.click('input[type="submit"]');

            await page.waitForSelector('.results');
            console.log(await page.evaluate(() => location.href));

            let links = await page.evaluate(() => {
                let elements = Array.from(document.querySelectorAll('body > div.pagecont > div.ed > div.results > div > div.items > div > div.ii > strong.L2 a'));
                return elements.map(element => {
                    return element.getAttribute('href');
                })
            });

            let texts = await page.evaluate(() => {
                let elements = Array.from(document.querySelectorAll('body > div.pagecont > div.ed > div.results > div > div.items > div > div.ii'));
                return elements.map(element => {
                    return element.textContent;
                })
            });

            if (typeof texts === 'undefined' || typeof links === 'undefined' || links.length === 0 || texts.length === 0) {
                report.in_progress = 0;
                report.error = errors.dataNotReceived;
                console.log(report.error);
                await Scheduler.updateReport(reportId, report);
                process.exit();
            }

            for (let i = 0; i < texts.length; i++) {
                if (savedPosts === false || await comparePost(account.id, savedPosts, links[i].trim())) {
                    let result = {
                        link: links[i].trim(),
                        text: texts[i].trim(),
                        work_sphere: account.work_sphere,
                        account_id: account.id,
                    }
                    await Database.savePost(result);
                }
            }
        }
        console.log(" - Finished successfully! - ");
        report.in_progress = 0;
        report.success = 1;
        await Scheduler.updateReport(reportId, report);
        await browser.close();
        await Database.closeDatabaseConnection();
        process.exit();
    } catch (e) {
        console.log("Error: " + e.message);
        report.in_progress = 0;
        report.error = e.message;
        await Scheduler.updateReport(reportId, report);
        process.exit();
    }
}

let report = {
    script: 'postsParser',
    success: 0,
    error: '',
    account_id: 0,
    queue_id: 0,
    in_progress: 1
};
const url = 'https://www.techmeme.com/';
let Database = new DBManager();
let Scheduler = new SchedulerClass();
let reportId = 0;
getData(url);
