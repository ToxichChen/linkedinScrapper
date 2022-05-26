const credentials = require('../credentials.js')
const mysql = require('mysql');
const fs = require('fs')

class DBManager {

    /**
     * Connecting to database
     *
     */

    constructor() {
        this.connection = this.connectToDatabase();
    }

    /**
     * Open database connection
     *
     * @returns {Promise<Connection>}
     */

    connectToDatabase() {
        return mysql.createConnection({
            host: credentials.dbHost,
            user: credentials.dbUser,
            password: credentials.dbPassword,
            database: credentials.database
        });
    }

    /**
     * Closing database connection when finishing work with database
     *
     * @returns {Promise<void>}
     */

    async closeDatabaseConnection() {
        this.connection.end();
    }

    /**
     * Fetch clients urls from database
     *
     * @returns {Promise<array>}
     */

    async getNotLikedUsersArray(queueId) {
        let sql = (`SELECT * FROM clients WHERE liked = 0 AND commented = 0 AND queue_id = ${queueId} LIMIT 3`);
        console.log(sql)
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result)
                } else {
                    resolve(false);
                }
            });
        });
    }

    /**
     * Fetch comments from database
     *
     * @returns {Promise<comments>}
     */
    async getCommentsArray() {
        let sql = ('SELECT `comment` FROM `comments`');
        return await new Promise((resolve) => {
            let comments = [];
            this.connection.query(sql, async function (err, result) {
                await result.forEach(function (value) {
                    comments.push(value.comment);
                });
                resolve(comments);
            });
        });
    }

    /**
     * Fetch clients urls from database
     *
     * @returns {Promise<array>}
     */

    async getNotConnectedUsersArray(queueId) {
        let sql = (`SELECT linkedinUrl FROM clients WHERE connectSent = 0 AND queue_id = ${queueId} LIMIT 3`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result)
                } else {
                    resolve(false);
                }
            });
        });
    }

    /**
     * Save Linkedin Users urls to database `clients`
     *
     * @param url
     * @param name
     * @param lastName
     * @param accountId
     * @param queueId
     * @returns {Promise<array>}
     */

    async saveUserToDatabase(url, name, lastName, accountId, queueId) {
        let sql = (`INSERT INTO clients (linkedinUrl, name, lastName, account_id, queue_id) VALUES ("${url}" , "${name}",  "${lastName}" , ${accountId} , ${queueId} ) `);
        let result = await this.checkUserIfExists(url);
        if (!result.length >= 1) {
            return await new Promise((resolve) => {
                this.connection.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    } else {
                        console.log("Successfully saved!")
                    }
                    resolve(result);
                });
            });
        } else {
            console.log("\n This result has been saved already!! \n")
        }
    }

    async updateUsersLikedAndCommented(id) {
        let sql = (`UPDATE clients SET liked = 1, commented = 1 WHERE id = ${id} AND liked = 0`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                // if (err) {
                //     throw err;
                // } catch
                resolve(result);
            });
        });
    }

    async getSearchQuery() {
        let sql = ('SELECT * FROM `search_queries` WHERE `is_searched` = 0 LIMIT 1');
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getSearchQueryByAccountId(accountId) {
        let sql = (`SELECT * FROM search_queries WHERE is_searched = 0 AND account_id = ${accountId} LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getAccounts() {
        let sql = (`SELECT *
                    FROM accounts
                    WHERE active = 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result)
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getAccountsWithSalesNav() {
        let sql = (`SELECT *
                    FROM accounts
                    WHERE active = 1 AND has_sales_nav = 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result)
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getJobsLaunchesByAccount(accountId) {
        let sql = (`SELECT * FROM jobsLaunches WHERE account_id = ${accountId} AND date IN (SELECT max(date) FROM jobsLaunches WHERE account_id = ${accountId} AND script = 'search')
                                                  or account_id = ${accountId} AND date IN (SELECT max(date) FROM jobsLaunches WHERE account_id = ${accountId} AND script = 'autoConnect')
                                                  or account_id = ${accountId} AND date IN (SELECT max(date) FROM jobsLaunches WHERE account_id = ${accountId} AND script = 'autoLikerCommenter') LIMIT 3`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result)
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getAccountSessionByID(accountId) {
        let sql = (`SELECT session_token FROM accounts WHERE id = ${accountId}`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0].session_token)
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getAccountFullNameByID(accountId) {
        let sql = (`SELECT name, last_name FROM accounts WHERE id = ${accountId}`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0].name + ' ' + result[0].last_name)
                } else {
                    resolve(false);
                }
            });
        });
    }

    async createQueue(accountId, searchQueryId) {
        let sql = (`INSERT INTO queues (account_id, search_query_id) VALUES (${accountId} ,  ${searchQueryId} ) `);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Successfully saved!")
                }
                resolve(result.insertId);
            });
        });
    }

    async getNotLikedQueueByAccountId(accountId) {
        let sql = (`SELECT * FROM queues WHERE is_liked_and_commented = 0 AND account_id = ${accountId} LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    // async getNotLikedQueue() {
    //     let sql = ('SELECT * FROM `queues` WHERE `is_liked_and_commented` = 0 LIMIT 1');
    //     return await new Promise((resolve) => {
    //         this.connection.query(sql, async function (err, result) {
    //             if (err) {
    //                 throw err;
    //             }
    //             if (result.length >= 1) {
    //                 resolve(result[0])
    //             } else {
    //                 resolve(false);
    //             }
    //         });
    //     });
    // }

    async getNotConnectedQueueByAccountId(accountId) {
        let sql = (`SELECT * FROM queues WHERE is_connected = 0 AND account_id = ${accountId} LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    // async getNotConnectedQueue() {
    //     let sql = ('SELECT * FROM `queues` WHERE `is_connected` = 0 LIMIT 1');
    //     return await new Promise((resolve) => {
    //         this.connection.query(sql, async function (err, result) {
    //             if (err) {
    //                 throw err;
    //             }
    //             if (result.length >= 1) {
    //                 resolve(result[0])
    //             } else {
    //                 resolve(false);
    //             }
    //         });
    //     });
    // }

    async updateLikedQueue(id) {
        let sql = (`UPDATE queues SET is_liked_and_commented = 1 WHERE id = ${id}`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                resolve(result);
            });
        });
    }

    async updateConnectedQueue(id) {
        let sql = (`UPDATE queues SET is_connected = 1 WHERE id = ${id}`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                resolve(result);
            });
        });
    }

    async checkUserIfExists(linkedinUrl) {
        let sql = (`SELECT * FROM clients WHERE linkedinUrl = "${linkedinUrl}"`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async checkSearchQueryIfExists(query) {
        let sql = (`SELECT * FROM search_queries WHERE query = "${query}" AND is_searched = 0`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async checkSearchFileNameIfExists(fileName) {
        let sql = (`SELECT * FROM search_queries WHERE file_name = "${fileName}"`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async updateSearchQuery(query) {
        let sql = (`UPDATE search_queries SET is_searched = 1 WHERE query = "${query.query}" AND is_searched = 0`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async saveSearchQueryToDatabase(query, fileName, accountId) {
        let sql = (`INSERT INTO search_queries (query, file_name, account_id) VALUES ( "${query}", "${fileName}", ${accountId}  ) `);
        let result = await this.checkSearchQueryIfExists(query);
        let nameResult = await this.checkSearchFileNameIfExists(fileName);
        if (!result.length >= 1) {
            if (!nameResult.length >= 1) {
                return await new Promise((resolve) => {
                    this.connection.query(sql, function (err, result) {
                        if (err) {
                            throw err;
                        } else {
                            console.log("Successfully saved!")
                        }
                        resolve(result);
                    });
                    this.closeDatabaseConnection();
                });
            } else {
                console.log("\n This file name is already taken!! \n")
                await this.closeDatabaseConnection();
            }
        } else {
            console.log("\n This result has been saved already!! \n")
            await this.closeDatabaseConnection();
        }
    }

    /**
     *  Set client's `connectSent` if client has already received connection proposal
     *
     * @returns {Promise<boolean>}
     */

    async setConnected(link) {
        let sql = `UPDATE clients SET connectSent = 1 WHERE linkedinUrl = "${link}"`;
        return await new Promise((resolve) => {
            console.log(sql)
            this.connection.query(sql, function (err, result) {
                console.log(link + ' - connection sent')
                resolve(link);
            });
        })
    }

    async saveReportToDatabase(result) {
        let sql = (`INSERT INTO jobsLaunches (script, success, error_message, account_id, queue_id, in_progress)
                    VALUES ("${result.script}", ${result.success} , "${result.error}" , ${result.account_id}, ${result.queue_id}, ${result.in_progress}) `);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Report saved!")
                    resolve(result.insertId);
                }
            });
        });
    }

    async getIdOfLastWorkingReport(accountId, script) {
        let sql = (` SELECT * FROM jobsLaunches WHERE account_id = ${accountId} AND in_progress = 1 AND script = '${script}' ORDER BY id DESC LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0].id)
                } else {
                    resolve(false);
                }
            });
        });
    }

    async updateReport(reportId, result) {
        let sql = (`UPDATE jobsLaunches SET in_progress = ${result.in_progress}, error_message = "${result.error}", queue_id = ${result.queue_id}, success = ${result.success} WHERE id = ${reportId}`);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Report updated!")
                }
                resolve(result);
            });
        });
    }

    async getAllPosts() {
        let sql = (` SELECT *
                     FROM posts`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result)
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getNotPostedPostsByAccountId(accountId) {
        let sql = (` SELECT * FROM posts WHERE account_id = ${accountId} AND is_posted = 0`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result)
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getPostsByAccountId(accountId) {
        let sql = (` SELECT * FROM posts WHERE account_id = ${accountId}`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result)
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getNotPostedPostByAccountId(accountId) {
        let sql = (`SELECT * FROM posts WHERE account_id = ${accountId} AND is_posted = 0 LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    async savePost(result) {
        let sql = (`INSERT INTO posts (link, text, work_sphere, account_id)
                    VALUES ("${result.link}", "${result.text}", "${result.work_sphere}" , ${result.account_id})`);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Post saved!")
                    resolve(result.insertId);
                }
            });
        });
    }

    async getNotParsedCompanyQueryByAccountId(accountId) {
        let sql = (`SELECT * FROM company_queries WHERE account_id = ${accountId} AND is_parsed = 0 LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getNotParsedCompany() {
        let sql = (`SELECT * FROM companies WHERE is_parsed = 0 LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getWorkSpheres() {
        let sql = (`SELECT * FROM work_spheres`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result)
                } else {
                    resolve(false);
                }
            });
        });
    }

    async createCompanyQuery(companyName, link, resultFile, accountId, companyId, industryId) {
        let sql = (`INSERT INTO company_queries (company, link, result_file, account_id, company_id, industry_id)
                    VALUES ("${companyName}", "${link}", "${resultFile}" , ${accountId}, ${companyId}, ${industryId} ) `);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Company query saved!")
                    resolve(result.insertId);
                }
            });
        });
    }

    async createEmployee(result, companyId, industryId) {
        let sql = (`INSERT INTO employees (name, last_name, full_name, linkedin_url, company_id, title, industry_id, location, duration, past_role, past_company, past_company_url, sales_nav_url, is_active_employee, past_experience_date)
                    VALUES ("
                                ${result.firstName}",
                                "${result.lastName}",
                                "${result.fullName}",
                                "${result.defaultProfileUrl}",
                                ${companyId},
                                "${result.title}",
                                ${industryId},
                                "${result.location}",
                                "${result.duration}",
                                "${result.pastRole}",
                                "${result.pastCompany}",
                                "${result.pastCompanyUrl}",
                                "${result.profileUrl}",
                                0,
                                "${result.pastExperienceDuration}"
                    ) `);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Employee saved!")
                    resolve(result.insertId);
                }
            });
        });
    }

    async updateCompanyQuery(companyQueryId) {
        let sql = (`UPDATE company_queries SET is_parsed = 1 WHERE id = "${companyQueryId}" AND is_parsed = 0`);
        return await new Promise((resolve) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async getSalesNavSearchQueryByAccountId(accountId) {
        let sql = (`SELECT *
                FROM sales_nav_search_queries
                WHERE account_id = ${accountId} AND is_scraped = 0 LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getLastSalesNavSearchQuery() {
        let sql = (`SELECT *
                FROM sales_nav_search_queries
                ORDER BY id DESC
                LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getIndustryById(id) {
        let sql = (`SELECT *
                FROM industries
                WHERE id = ${id} LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getGeographyById(id) {
        let sql = (`SELECT *
                FROM geography
                WHERE id = ${id} LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    async getFunctionById(id) {
        let sql = (`SELECT *
                FROM functions
                WHERE id = ${id} LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

    async createIndustry(name, linkedInId) {
        let sql = (`INSERT INTO industries (name, linkedin_id) VALUES ('${name}' ,  '${linkedInId}' ) `);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Successfully saved!")
                }
                resolve(result.insertId);
            });
        });
    }

    async createFunction(name, linkedInId) {
        let sql = (`INSERT INTO functions (name, linkedin_id) VALUES ('${name}' ,  '${linkedInId}' ) `);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Successfully saved!")
                }
                resolve(result.insertId);
            });
        });
    }

    async createGeography(name, linkedInId) {
        let sql = (`INSERT INTO geography (name, linkedin_id) VALUES ('${name}' ,  '${linkedInId}' ) `);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Successfully saved!")
                }
                resolve(result.insertId);
            });
        });
    }

    async createNewSalesNavQuery(query) {
        let sql = (`INSERT INTO sales_nav_search_queries (geography_id, function_id, industry_id, search_url, account_id, is_scraped) VALUES (${query.geography_id} , ${query.function_id} , ${query.industry_id} ,  '${query.search_url}', ${query.account_id}, ${query.is_scraped} ) `);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Successfully saved!")
                }
                resolve(result.insertId);
            });
        });
    }

    async createCryptoWorker(result, industryId, functionId) {
        let sql = (`INSERT INTO crypto_workers (name, last_name, full_name, linkedin_url, industry_id, title, function_id, location, duration, past_role, past_company, past_company_url, sales_nav_url, current_company_name, current_company_url, current_company_id)
                    VALUES ("${result.firstName}", "${result.lastName}", "${result.fullName}", "${result.defaultProfileUrl}", ${industryId}, "${result.title}", ${functionId}, "${result.location}", "${result.duration}","${result.pastRole}","${result.pastCompany}","${result.pastCompanyUrl}","${result.profileUrl}","${result.companyName}","${result.companyUrl}","${result.companyId}" ) `);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Profile saved!")
                    resolve(result.insertId);
                }
            });
        });
    }

    async updateSalesNavSearchQuery(searchQueryId) {
        let sql = (`UPDATE sales_nav_search_queries SET is_scraped = 1 WHERE id = "${searchQueryId}"`);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async getCreatedQuery() {
        let sql = (`SELECT *
                FROM created_queries
                WHERE is_parsed != 1 LIMIT 1`);
        return await new Promise((resolve) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length >= 1) {
                    resolve(result[0])
                } else {
                    resolve(false);
                }
            });
        });
    }

}

module.exports = DBManager;
