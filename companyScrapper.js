const credentials = require('./credentials.js')
const errors = require('./errorList.js')
const LinkedIn = require('./LinkedInScraper')
const DBManager = require('./DBManager')
const SchedulerClass = require('./Scheduler');


let LinkedInScraper = new LinkedIn();
let Database = new DBManager();
let Scheduler = new SchedulerClass();

async function buildSearchUrl(companySalesNavId, workSphere, salesNavSearchSession, ntbToken = '') {
    return 'https://www.linkedin.com/sales/search/people/list/employees-for-account/'
        + companySalesNavId
        //+ '?_ntb=' + ntbToken
        + '?doFetchHeroCard=false&logHistory=true&searchSessionId=' + salesNavSearchSession
        + '&titleIncluded=' + workSphere
        + '&titleTimeScope=CURRENT';
}

async function startSearch() {
//module.exports.startSearch = async function (accountId) {
    let results = false;
    let report = {
        script: 'companyParser',
        success: 0,
        error: '',
        account_id: 0,
        queue_id: 0,
        in_progress: 1
    };
    reportId = await Scheduler.makeReport(report);
    console.time("companyParser");
    let accountsArray = await Database.getAccountsWithSalesNav();
    if (accountsArray === false) {
        await Scheduler.formReport(report, errors.noActiveAccountsWithSalesNav)
        process.exit();
    }
    for (let account of accountsArray) {
        report.account_id = account.id;
        // do {
        let companyQuery = await Database.getNotParsedCompanyQuery();
        if (companyQuery === false) {
            let accountsArray = await Database.getAccountsWithSalesNav();
            let company = await Database.getNotParsedCompany();
            let workSpheres = await Database.getWorkSpheres();
            if (company === false) {
                report.error = errors.allCompaniesParsed
            } else if (workSpheres === false) {
                report.error = errors.noWorkSpheresFound
            } else if (accountsArray === false) {
                report.error = errors.noActiveAccounts
            }
            if (report.error !== '') {
                await Scheduler.formReport(report, report.error)
                continue;
            } else {
                // TO SEPARATE FUNCTION ?
                let accountIndex = 0;
                let link = '';
                let resultFile = '';

                for (let workSphere of workSpheres) {
                    resultFile = company.company_name + '_' + workSphere.name;
                    //resultFile = company.company_name; // UNCOMMENT FOR 'REMOVE DUPLICATES' OPTION

                    link = await buildSearchUrl(company.company_sales_nav_id, workSphere.name, accountsArray[accountIndex].sales_nav_search_session_id /**, accountsArray[accountIndex].ntb_token**/)
                    await Database.createCompanyQuery(company.company_name, workSphere.name, link, resultFile, accountsArray[accountIndex].id, company.id, workSphere.id);

                    if (accountIndex + 1 === accountsArray.length) {
                        accountIndex -= accountsArray.length - 1;
                    } else {
                        accountIndex++;
                    }
                }
            }
            companyQuery = await Database.getNotParsedCompanyQuery();
        }
        console.log(companyQuery);
        let containerId = await LinkedInScraper.startSalesNavCompanyEmployeesParser(companyQuery.link, companyQuery.result_file, await Database.getAccountSessionByID(companyQuery.account_id));
        results = await LinkedInScraper.getResults(containerId, credentials.salesNavSearchExtractor);
        if (results.error) {
            await Scheduler.formReport(report, results.error)
            continue;
        }
        console.log(results);
        if (results !== false) {
            for (let employee of results) {
                if (!employee.error) {
                    await Database.createEmployee(employee, companyQuery.company_id, companyQuery.work_sphere_id);
                }
            }
        } else {
            await Database.updateCompanyQuery(companyQuery.id);
        }
        if (report.error) {
            await Scheduler.formReport(report, results.error);
        } else {
            await Scheduler.formReport(report);
        }
        // } while (results === false)
    }

    console.log('Finished!');
    //await Database.closeDatabaseConnection();
    console.timeEnd("companyParser");
    // return new Promise((resolve, reject) => {
    //     resolve(true);
    // });
    process.exit();
}

startSearch();