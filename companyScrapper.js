const credentials = require('./credentials.js')
const constants = require('./constants.js')
const errors = require('./errorList.js')
const LinkedIn = require('./LinkedInScraper')
const DBManager = require('./DBManager')
const SchedulerClass = require('./Scheduler');


let LinkedInScraper = new LinkedIn();
let Database = new DBManager();
let Scheduler = new SchedulerClass();

async function buildSearchUrl(companySalesNavId, salesNavSearchSession, ntbToken = '') {
    return "https://www.linkedin.com/sales/search/people?logHistory=true&query=(filters%3AList((type%3ACURRENT_COMPANY%2Cvalues%3AList" +
    "((id%3A" + companySalesNavId + "%2CselectionType%3AINCLUDED)))))" +
    "&sessionId=" + salesNavSearchSession;
}

async function buildSearchUrlWithIndustries(companySalesNavId, workSphere, salesNavSearchSession, industryId, ntbToken = '') {
    "https://www.linkedin.com/sales/search/people?logHistory=true&query=(recentSearchParam%3A(id%3A1337649913%2CdoLogHistory%3Atrue)" +
    "%2Cfilters%3AList((type%3ACURRENT_COMPANY%2Cvalues%3AList((id%3A3650502%2Ctext%3AFigma%2CselectionType%3AINCLUDED)))" +
    "%2C(type%3AINDUSTRY%2Cvalues%3AList((id%3A4%2Ctext%3AComputer%2520Software%2CselectionType%3AINCLUDED)))))&sessionId=FeLxjv3GTIaQuRAA5GhP3w%3D%3D"
    let industry = await Database.getIndustryById(industryId);
    return 'https://www.linkedin.com/sales/search/people/list/employees-for-account/'
        + companySalesNavId
        //+ '?_ntb=' + ntbToken
        + '?doFetchHeroCard=false&logHistory=true&searchSessionId=' + salesNavSearchSession
        + '&industryIncluded=' + industry.linkedin_id +
        +'&titleIncluded=' + workSphere
        + '&titleTimeScope=CURRENT';
}

///////////////////////////

async function processNewQuery(account, company) {
    let query = {};
    if (company.employees < 2500) {
        query = {
            industry_id: 0,
            company_id: company.id,
            link: '',
            account_id: account.id,
            is_scraped: 0
        };
        try {
            query.link = await buildSearchUrl(company.company_sales_nav_id, account.sales_nav_search_session_id);
            await Database.createCompanyQuery(company.company_name, query.link, company.company_name, account.id, company.id, query.industry_id);
            return query;
        } catch (e) {
            console.log("Failed to save data to database, please check data and MYSQL connection :")
            console.log(e);
            process.exit(1);
        }
    } else {
        /// Finish industry adding feature
        let lastQuery = await Database.getLastSalesNavCompanyParserQuery();
        if (lastQuery === false) {
            query = {
                industry_id: 1,
                company_id: company.id,
                link: '',
                account_id: account.id,
                is_scraped: 0
            };
        } else {
            let newQuery = {
                industry_id: 1,
                company_id: company.id,
                link: '',
                account_id: account.id,
                is_scraped: 0
            }

            let newIndustry = await Database.getIndustryById(lastQuery.industry_id + 1);
            if (newIndustry === false) {
                newQuery.industry_id = 1;
                query = newQuery;
            } else {
                newQuery.industry_id = newIndustry.id;
                query = newQuery;
            }
        }
        try {
            query.link = await buildSearchUrlWithIndustries(query.function_id, query.industry_id, query.geography_id, account.sales_nav_search_session_id);
            await Database.createNewSalesNavQuery(query);
            return query;
        } catch (e) {
            console.log("Failed to save data to database, please check data and MYSQL connection :")
            console.log(e);
            process.exit(1);
        }
    }
}

async function startSearch() {
//module.exports.startSearch = async function (accountId) {
    let accountsArray = await Database.getAccountsWithSalesNav();
    for (let account of accountsArray) {
        let results = false;
        do {
            let companyQuery = await Database.getNotParsedCompanyQueryByAccountId(account.id);
            let company = await Database.getNotParsedCompany();
            if (companyQuery === false) {
                companyQuery = await processNewQuery(account, company);
            }
            console.log(companyQuery);
            let containerId = await LinkedInScraper.startSalesNavCompanyEmployeesParser(companyQuery.link, company.company_name + "_test2", account.session_token);
            results = await LinkedInScraper.getResults(containerId, credentials.salesNavSearchCompanyExtractor);
            if (results.error) {
                console.log(results.error);
                continue;
            }
            console.log(results);
            if (results !== false) {
                for (let employee of results) {
                    if (!employee.error) {
                        await Database.createEmployee(employee, companyQuery.company_id, companyQuery.industry_id);
                    }
                }
            } else {
                results = false;
                await Database.updateCompanyQuery(companyQuery.id);
            }
        } while (results === false)
    }
    await Database.closeDatabaseConnection();
}

startSearch();