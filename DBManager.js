const credentials = require('./credentials.js')
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
        let sql = ('SELECT * FROM `clients` WHERE `liked` = 0 AND `commented` = 0 AND queue_id = ' + queueId + ' LIMIT 3');
        console.log(sql)
        return await new Promise((resolve, reject) => {
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
     * @returns {Promise<comments>}+
     */
    async getCommentsArray() {
        let sql = ('SELECT `comment` FROM `comments`');
        return await new Promise((resolve, reject) => {
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
        let sql = ('SELECT `linkedinUrl` FROM `clients` WHERE `connectSent` = 0 AND `queue_id` = ' + queueId + ' LIMIT 3');
        return await new Promise((resolve, reject) => {
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
     * @returns {Promise<unknown>}
     */

    async saveUserToDatabase(url, name, lastName, accountId, queueId) {
        let sql = ('INSERT INTO clients (`linkedinUrl`, `name`, `lastName`, `account_id`, `queue_id`) VALUES (' + '\'' + url + '\'' + ' ,  ' + '\'' + name + '\'' + ' ,  ' + '\'' + lastName + '\'' + ' ,  ' + '\'' + accountId + '\'' + ' ,  ' + '\'' + queueId + '\'' + ' ) ');
        // let sql = (`INSERT INTO clients (linkedinUrl, name, lastName) VALUES ('${url}', '${name}', '${lastName}')`);
        let result = await this.checkUserIfExists(url);
        if (!result.length >= 1) {
            return await new Promise((resolve, reject) => {
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
        let sql = ('UPDATE clients SET `liked` = 1, `commented` = 1 WHERE `id` = ' + id + ' AND `liked` = 0');
        return await new Promise((resolve, reject) => {
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
        return await new Promise((resolve, reject) => {
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
        let sql = ('SELECT * FROM `accounts`');
        return await new Promise((resolve, reject) => {
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
        let sql = ('SELECT `session_token` FROM `accounts` WHERE id = ' + accountId);
        return await new Promise((resolve, reject) => {
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

    async createQueue (accountId, searchQueryId) {
        let sql = ('INSERT INTO queues (`account_id`, `search_query_id`) VALUES (' + accountId + ' ,  ' + searchQueryId +' ) ');

        return await new Promise((resolve, reject) => {
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

    async getNotLikedQueue() {
        let sql = ('SELECT * FROM `queues` WHERE `is_liked_and_commented` = 0 LIMIT 1');
        return await new Promise((resolve, reject) => {
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

    async getNotConnectedQueue() {
        let sql = ('SELECT * FROM `queues` WHERE `is_connected` = 0 LIMIT 1');
        return await new Promise((resolve, reject) => {
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

    async updateLikedQueue(id) {
        let sql = ('UPDATE queues SET `is_liked_and_commented` = 1 WHERE `id` = ' + id);
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, async function (err, result) {
                resolve(result);
            });
        });
    }

    async updateConnectedQueue(id) {
        let sql = ('UPDATE queues SET `is_connected` = 1 WHERE `id` = ' + id);
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, async function (err, result) {
                resolve(result);
            });
        });
    }

    async checkUserIfExists(linkedinUrl) {
        let sql = ('SELECT * FROM `clients` WHERE `linkedinUrl` = "' + linkedinUrl + '"');
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async checkSearchQueryIfExists(query) {
        let sql = ('SELECT * FROM `search_queries` WHERE `query` = "' + query + '" AND `is_searched` = 0');
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async checkSearchFileNameIfExists(fileName) {
        let sql = ('SELECT * FROM `search_queries` WHERE `file_name` = "' + fileName + '"');
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async updateSearchQuery(query) {
        let sql = ('UPDATE search_queries SET `is_searched` = 1 WHERE `query` = "' + query.query + '" AND `is_searched` = 0');
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async saveSearchQueryToDatabase(query, fileName, accountId) {
        let sql = ('INSERT INTO search_queries (`query`, `file_name`, `account_id`) VALUES (' + '\'' + query + '\'' + ' ,  ' + '\'' + fileName + '\'' + ' ,  ' + '\'' + accountId + '\'' + ' ) ');
        let result = await this.checkSearchQueryIfExists(query);
        let nameResult = await this.checkSearchFileNameIfExists(fileName);
        if (!result.length >= 1) {
            if (!nameResult.length >= 1) {
                return await new Promise((resolve, reject) => {
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
        let sql = 'UPDATE `clients` SET `connectSent` = 1 WHERE `linkedinUrl` = "' + link +'"';
        return await new Promise((resolve, reject) => {
            console.log(sql)
            this.connection.query(sql, function (err, result) {
                console.log(link + ' - connection sent')
                resolve(link);
            });
        })
    }

    async saveReportToDatabase(result) {
        let sql = ('INSERT INTO jobsLaunches (`script`, `success`, `error_massage`) VALUES (' + '\'' + result.script + '\'' + ', ' + '' + result.success + '' + ' ,  ' + ' \' ' + result.error + ' \' ' + ' ) ');
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    console.log("Report saved!")
                }
                resolve(result);
            });
        });
    }
}

module.exports = DBManager;