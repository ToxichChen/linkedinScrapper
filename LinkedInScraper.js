const credentials = require('./credentials.js')
const axios = require("axios")
const mysql = require('mysql');
const fetch = require('node-fetch');

class LinkedInScraper {
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
     * Running search process on PhantomBuster
     *
     * @param query
     * @param resultFileName
     * @returns {Promise<string>}
     */

    async startLinkedInSearchForPeople(query, resultFileName) {
        return await new Promise((resolve, reject) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id":credentials.searchScrapperId,
                        "argument":
                            {"firstCircle": true,
                                "secondCircle":true,
                                "thirdCircle":true,
                                "category":"People",
                                "numberOfLinesPerLaunch":10,
                                "sessionCookie": credentials.sessionCookie,
                                "search": query,
                                "numberOfResultsPerLaunch":30,
                                "numberOfResultsPerSearch":60,
                                "removeDuplicateProfiles":true,
                                "csvName":resultFileName
                            },

                // {
                        //     "id": credentials.searchScrapperId,
                        //     "argument": {
                        //         "circles": {"first": false, "second": true, "third": true},
                        //         "category": "People",
                        //         "numberOfPage": 5,
                        //         "numberOfLinesPerLaunch": 10,
                        //         "queryColumn": true,
                        //         "sessionCookie": credentials.sessionCookie,
                        //         "search": query
                        //     }
                    },
                    credentials.initOptions,
                )
                .then((res) => resolve(res.data.containerId))
                .catch((error) => console.error("Something went wrong :(", error))
        })
    }

    /**
     * Wait for container's work finish and get results from PhantomBuster's containers
     *
     * @param containerId
     * @param scrapperId
     * @returns {Promise<any>}
     */

    async getResults(containerId, scrapperId) {
        let url = 'https://api.phantombuster.com/api/v1/agent/' + scrapperId + '/output';
        console.log('Container ID: ' + containerId)
        let options = {
            method: 'GET',
            qs: {containerId: containerId, withoutResultObject: 'false'},
            headers: {
                Accept: 'application/json',
                'X-Phantombuster-Key': credentials.phantomBusterApiKey
            }
        };
        let status = '';
        let result = '';
        // Receiving status, if finished than go on.
        do {
            status = await this.checkStatus(scrapperId);
            console.log(status)
        } while (status !== 'finished')

        let response = await fetch(url, options)
        if (response.ok) {
            result = await response.json();
            console.log(result)
            if (result.data.resultObject) {
                return await JSON.parse(result.data.resultObject)
            } else {
                console.log(result.data.output);
            }
        }
    }

    /**
     * Check status of working agent: running/finished
     *
     * @param agentId
     * @returns {Promise<string>}
     */

    async checkStatus(agentId) {
        let url = 'https://api.phantombuster.com/api/v2/agents/fetch-output?id=' + agentId;
        let result = '';
        let options = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'X-Phantombuster-Key': credentials.phantomBusterApiKey
            }
        };

        let response = await fetch(url, options)
        if (response.ok) {
            result = await response.json();
            return result.status;
        }
    }

    /**
     * Start parsing Activities of user
     *
     * @param userLinkedInUrl
     * @returns {Promise<void>}
     */

    async parseActivities(userLinkedInUrl) {
        return await new Promise((resolve) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.activitiesScrapperId,
                        "argument": {
                            "sessionCookie": credentials.sessionCookie,
                            "spreadsheetUrl": userLinkedInUrl,
                            "numberOfLinesPerLaunch": 10,
                            "numberMaxOfPosts": 20,
                            "csvName": "result",
                            "onlyScrapePosts": true,
                            "reprocessAll": false
                        }
                    },
                    credentials.initOptions,
                )
                .then((res) => resolve(res.data.containerId))
                .catch((error) => console.error("Something went wrong :(", error))
        });
    }

    /**
     * Run Phantombuster's Auto Liker agent
     *
     * @param documentLink
     * @returns {Promise<void>}
     */
    async runAutoLiker(documentLink) {
        return await new Promise((resolve, reject) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.autoLikerId,
                        "argument":
                            {
                                "sessionCookie": credentials.sessionCookie,
                                "spreadsheetUrl": documentLink,
                                "articleType": "posts"
                            }
                    },
                    credentials.initOptions,
                )
                .then((res) => resolve(res.data.containerId))
                .catch((error) => console.error("Something went wrong :(", error))
        });
    }

    /**
     *  Run Phantombuster's Auto Commenter agent
     *
     * @param documentLink
     * @returns {Promise<void>}
     */
    async runAutoCommenter(documentLink) {
        return await new Promise((resolve, reject) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.autoCommenterId,
                        "argument":
                            {
                                "sessionCookie": credentials.sessionCookie,
                                "spreadsheetUrl": documentLink,
                                "columnName": "column A",
                                "columnNameMessage": "column B",
                                "randomComments": false
                            }
                    },
                    credentials.initOptions,
                )
                .then((res) => resolve(res.data.containerId))
                .catch((error) => console.error("Something went wrong :(", error))
        });
    }

    /**
     * Run Phantombuster's Auto Connect agent
     *
     * @param documentUrl
     * @returns {Promise<void>}
     */

    async runAutoConnect(documentUrl) {
        return await new Promise((resolve, reject) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.autoConnectAgentId,
                        "argument":
                            {
                                "numberOfAddsPerLaunch": 10,
                                "onlySecondCircle": false,
                                "waitDuration": 30,
                                "skipProfiles": true,
                                "sessionCookie": credentials.sessionCookie,
                                "dwellTime": true,
                                "spreadsheetUrl": documentUrl
                            }
                    },
                    credentials.initOptions,
                )
                .then((res) => resolve(res.data.containerId))
                .catch((error) => console.error("Something went wrong :(", error))
        });
    }

    /**
     *  Form data for Auto Connect
     *
     * @returns {Promise<array>}
     */

    async prepareAutoConnector() {
        let urls = await getUsersArray();
        let formattedData = []
        return await new Promise((resolve, reject) => {
            for (const value of urls) {
                formattedData.push({
                    link: value,
                })
                urlsArray.push(value);
            }
            resolve(formattedData);
        })
    }

    /**
     * Prepare and form data for Auto Commenter
     *
     * @param activities
     * @returns {Promise<activities and comments array>}
     */

    async prepareAutoCommenter(activities) {
        let comments = await this.getCommentsArray();
        let formattedData = []
        return await new Promise((resolve, reject) => {
            for (const value of activities) {
                let commentsIndex = Math.floor(Math.random() * Math.floor(comments.length));
                formattedData.push({
                    link: value.postUrl,
                    comment: comments[commentsIndex],
                });
            }
            resolve(formattedData);
        })
    }

    /**
     * Fetch clients urls from database
     *
     * @returns {Promise<array>}
     */

    async getUsersArray() {
        let sql = ('SELECT `linkedinUrl` FROM `clients` WHERE `connectSent` = 0');
        return await new Promise((resolve, reject) => {
            let urls = [];
            con.query(sql, async function (err, result) {
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
        let sql = ('INSERT INTO clients (`linkedinUrl`, `name`, `lastName`) VALUES (' + ' \' ' + url + ' \' ' + ' ,  ' + ' \' ' + name + ' \' ' + ' ,  ' + ' \' ' + lastName + ' \' ' + ' ) ');
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, async function (err, result) {
                resolve(result);
            });
        });
    }

    async checkSearchQueryIfExists(query) {
        let sql = ('SELECT * FROM `search_queries` WHERE `query` = "' + query + '" AND `is_searched` = 0');
        let results;
        return await new Promise((resolve, reject) => {
            this.connection.query(sql, async function (err, result) {
                if (err){
                    throw err;
                }
                resolve(result);
            });
        });
    }

    async saveSearchQueryToDatabase(query) {
        let sql = ('INSERT INTO search_queries (`query`) VALUES (' + '\'' + query + '\'' + ' ) ');
        let result = await this.checkSearchQueryIfExists(query);
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

}

module.exports = LinkedInScraper;