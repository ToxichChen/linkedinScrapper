const credentials = require('../credentials.js')
const constants = require('../constants/constants.js')
const errors = require('../constants/errorList.js')
const LinkedIn = require('../classes/LinkedInScraper')
const DBManager = require('../classes/DBManager')
const SchedulerClass = require('../classes/Scheduler');


let LinkedInScraper = new LinkedIn();
let Database = new DBManager();
let Scheduler = new SchedulerClass();

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
            query.link = await constants.buildSearchUrlForPastEmployees(company.company_sales_nav_id, account.sales_nav_search_session_id);
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
            let containerId = await LinkedInScraper.startSalesNavCompanyEmployeesParser(companyQuery.link, company.company_name + "_test_past1", account.session_token);
            results = await LinkedInScraper.getResults(containerId, credentials.salesNavSearchCompanyExtractor);
            if (results.error) {
                console.log(results.error);
                continue;
            } else if (results == "finished") {
                // Set company as parsed
            }
            console.log(results);
            if (results !== false) {
                for (let employee of results) {
                    // Maybe add counter for parsing limits ??
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
