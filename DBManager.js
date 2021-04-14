const credentials = require('./credentials.js')
const mysql = require('mysql');

class DBManager {
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

    async getNotLikedUsersArray() {
        let sql = ('SELECT `linkedinUrl` FROM `clients` WHERE `liked` = 0 AND `commented` = 0 LIMIT 3');
        return await new Promise((resolve, reject) => {
            let urls = [];
            this.connection.query(sql, async function (err, result) {
                await result.forEach(function (value) {
                    urls.push(value.linkedinUrl);
                });
                resolve(urls);
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
     * Save Linkedin Users urls to database `clients`
     *
     * @param url
     * @param name
     * @param lastName
     * @returns {Promise<unknown>}
     */

    async saveUserToDatabase(url, name, lastName) {
        let sql = ('INSERT INTO clients (`linkedinUrl`, `name`, `lastName`) VALUES (' + '\'' + url + '\'' + ' ,  ' + '\'' + name + '\'' + ' ,  ' + '\'' + lastName + '\'' + ' ) ');
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

    async updateUsersLikedAndCommented(url) {
        let sql = ('UPDATE clients SET `liked` = 1, `commented` = 1 WHERE `linkedinUrl` = "' + url + '" AND `liked` = 0');
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
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
        let sql = ('UPDATE search_queries SET `is_searched` = 1 WHERE `query` = "' + query + '" AND `is_searched` = 0');
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, async function (err, result) {
                if (err) {
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async saveSearchQueryToDatabase(query, fileName) {
        let sql = ('INSERT INTO search_queries (`query`, `file_name`) VALUES (' + '\'' + query + '\'' + ' ,  ' + '\'' + fileName + '\'' + ' ) ');
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

    async saveReportToDatabase(result) {
        let sql = ('INSERT INTO jobsLaunches (`script`, `success`, `error_massage`) VALUES (' + ' \' ' + result.script + ' \' ' + ' ,  ' + ' ' + result.success + ' ' + ' ,  ' + ' \' ' + result.error + ' \' ' + ' ) ');
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
    }
}

module.exports = DBManager;