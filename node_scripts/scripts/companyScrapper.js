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

async function processNewQuery(account, createdQuery) {
    let query = {};
    if (createdQuery.employees < 2500) {
        query = {
            industry_id: 0,
            created_query_id: createdQuery.id,
            link: '',
            account_id: account.id,
            is_scraped: 0,
            company_id: createdQuery.company_id
        };
        try {
            if (createdQuery.type === 'past') {
                query.link = await constants.buildSearchUrlForPastEmployees(createdQuery.company_sales_nav_id, account.sales_nav_search_session_id);
                await Database.createCompanyQuery(createdQuery.company_name, query.link, createdQuery.company_name, account.id, createdQuery.id, query.industry_id, createdQuery.company_id);
                return query;
            } else {
                query.link = await constants.buildSearchUrl(createdQuery.company_sales_nav_id, account.sales_nav_search_session_id);
                await Database.createCompanyQuery(createdQuery.company_name, query.link, createdQuery.company_name, account.id, createdQuery.id, query.industry_id, createdQuery.company_id);
                return query;
            }
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
    let accountsArray = await Database.getAccountsWithSalesNav();
    for (let account of accountsArray) {
        let results = false;
        do {
            let companyQuery = await Database.getNotParsedCompanyQueryByAccountId(account.id);
            let createdQuery = await Database.getNotParsedCreatedQuery();
            if (companyQuery === false) {
                companyQuery = await processNewQuery(account, createdQuery);
            }
            console.log(companyQuery);
            let containerId = await LinkedInScraper.startSalesNavCompanyEmployeesParser(companyQuery.link, createdQuery.company_name + "_new_test_2", account.session_token);
            results = await LinkedInScraper.getResults(containerId, credentials.salesNavSearchCompanyExtractor);
            if (results.error) {
                console.log(results.error);
                continue;
            } else if (results == "finished") {
                results = false;
            }
            console.log(results);
            if (results !== false) {
                for (let employee of results) {
                    console.log('FOREACH EMPLOYEES ENTERED');
                    // Maybe add counter for parsing limits ??
                    if (!employee.error) {
                        console.log('NO Employee ERROR')
                        if (await Database.checkEmployeeIfExists(employee.defaultProfileUrl) == false) {
                            console.log("EMPLOYE DOESN'T EXISTS, SAVING")
                            try {
                                await Database.createEmployee(employee, createdQuery.company_id, companyQuery.industry_id);
                            } catch (e) {
                                continue;
                            }
                        }
                    }
                }
            } else {
                console.log('RESULTS ARE FALSE')
                results = false;
                await Database.updateCompanyQuery(companyQuery.id);
            }
        } while (results === false)
    }
    await Database.closeDatabaseConnection();
}

startSearch();
