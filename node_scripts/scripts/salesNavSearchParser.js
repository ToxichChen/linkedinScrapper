const credentials = require('../credentials.js')
const constants = require('../constants/constants.js')
const DBManager = require('../classes/DBManager')
const errors = require('../constants/errorList.js')
const LinkedIn = require('../classes/LinkedInScraper')
const SchedulerClass = require('../classes/Scheduler');

const salesNavSearchExportId = credentials.salesNavSearchExtractor;
let LinkedInScraper = new LinkedIn();
let Database = new DBManager();
let Scheduler = new SchedulerClass();

async function buildSearchUrl(functionId, industryId, geographyId, companyTypeId, salesNavSearchSession) {
    let geography = await Database.getGeographyById(geographyId);
    let industry = await Database.getIndustryById(industryId);
    let functionObj = await Database.getFunctionById(functionId);
    let companyType = await Database.getCompanyTypeById(companyTypeId);
    return constants.buildSearchUrlWithIndustriesFunctionAndCompanyType(
        geography.linkedin_id,
        industry.linkedin_id,
        functionObj.linkedin_id,
        companyType.linkedin_id,
        salesNavSearchSession
    )
}

async function processNewQuery(account) {
    let query = {};
    let lastQuery = await Database.getLastSalesNavSearchQuery();
    if (lastQuery === false) {
        query = {
            geography_id: 1,
            function_id: 1,
            industry_id: 1,
            company_type_id: 1,
            search_url: '',
            account_id: account.id,
            is_scraped: 0
        };
    } else {
        let newQuery = {
            geography_id: 0,
            function_id: 0,
            industry_id: 0,
            company_type_id: 0,
            search_url: '',
            account_id: account.id,
            is_scraped: 0
        }

        let newIndustry = await Database.getIndustryById(lastQuery.industry_id + 1);
        if (newIndustry === false) {
            let newFunction = await Database.getFunctionById(lastQuery.function_id + 1);
            if (newFunction === false) {
                let newCompanyType = await Database.getCompanyTypeById(lastQuery.company_type_id + 1);
                if (newCompanyType === false) {
                    let newGeography = await Database.getGeographyById(lastQuery.geography_id + 1);
                    if (newGeography === false) {
                        process.exit(1);
                    }
                    newQuery.geography_id = newGeography.id;
                    newQuery.function_id = 1;
                    newQuery.industry_id = 1;
                    newQuery.company_type_id = 1;
                    query = newQuery;
                } else {
                    newQuery.company_type_id = newCompanyType.id;
                    newQuery.function_id = 1;
                    newQuery.industry_id = 1;
                    newQuery.geography_id = lastQuery.geography_id;
                    query = newQuery;
                }
            } else {
                newQuery.function_id = newFunction.id;
                newQuery.industry_id = 1;
                newQuery.geography_id = lastQuery.geography_id;
                newQuery.company_type_id = lastQuery.company_type_id;
                query = newQuery;
            }
        } else {
            newQuery.function_id = lastQuery.function_id;
            newQuery.industry_id = newIndustry.id;
            newQuery.geography_id = lastQuery.geography_id;
            newQuery.company_type_id = lastQuery.company_type_id;
            query = newQuery;
        }
    }
    try {
        query.search_url = await buildSearchUrl(
            query.function_id,
            query.industry_id,
            query.geography_id,
            query.company_type_id,
            account.sales_nav_search_session_id
        );
        await Database.createNewSalesNavQuery(query);
        return query;
    } catch (e) {
        console.log("Failed to save data to database, please check data and MYSQL connection :")
        console.log(e);
        process.exit(1);
    }
}

async function startSearch() {
//module.exports.startSearch = async function (accountId) {
    if (await Database.getIndustryById(1) === false) {
        let industriesArray = constants.industries.elements;
        for (let industry of industriesArray) {
            await Database.createIndustry(industry.displayValue, industry.id);
        }
    }
    if (await Database.getFunctionById(1) === false) {
        let functionsArray = constants.functionsData.elements;
        for (let functionObj of functionsArray) {
            await Database.createFunction(functionObj.displayValue, functionObj.id);
        }
    }
    if (await Database.getGeographyById(1) === false) {
        let geographyArray = constants.geographyData.elements;
        for (let geographyObj of geographyArray) {
            await Database.createGeography(geographyObj.displayValue, geographyObj.id);
        }
    }
    if (await Database.getCompanyTypeById(1) === false) {
        let companyTypesArray = constants.companyTypes.elements;
        for (let companyTypesObj of companyTypesArray) {
            await Database.createCompanyType(companyTypesObj.displayValue, companyTypesObj.id);
        }
    }
    let accountsArray = await Database.getAccountsWithSalesNav();
    for (let account of accountsArray) {
        let results = false;
        do {
            let searchQuery = await Database.getSalesNavSearchQueryByAccountId(account.id);
            if (searchQuery === false) {
                searchQuery = await processNewQuery(account);
            }
            console.log(searchQuery);
            let containerId = await LinkedInScraper.runSalesNavSearchParser(searchQuery.search_url, account.session_token, "test2");
            results = await LinkedInScraper.getResults(containerId, salesNavSearchExportId);
            if (results.error) {
                console.log(results.error);
                continue;
            }
            console.log(results);
            if (results !== false) {
                for (let worker of results) {
                    if (!worker.error) {
                        await Database.createCryptoWorker(worker, searchQuery.industry_id, searchQuery.function_id);
                    }
                }
            } else {
                results = false;
                await Database.updateSalesNavSearchQuery(searchQuery.id);
            }
        } while (results === false)
    }
    await Database.closeDatabaseConnection();
}

startSearch();
