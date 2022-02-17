const credentials = require('./credentials.js')
const axios = require("axios")
const fetch = require('node-fetch');
const DBManager = require('./DBManager')
const fs = require('fs');

class LinkedInScraper {
    constructor() {
        this.DBManager = new DBManager();
    }

    /**
     * Running search process on PhantomBuster
     *
     * @param query
     * @param fileName
     * @param sessionToken
     * @returns {Promise<string>}
     */

    async startLinkedInSearchForPeople(query, fileName, sessionToken) {
        return await new Promise((resolve) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.searchScrapperId,
                        "argument":
                            {
                                "firstCircle": false,
                                "secondCircle": true,
                                "thirdCircle": true,
                                "category": "People",
                                "numberOfLinesPerLaunch": 10,
                                "sessionCookie": sessionToken,
                                "search": query,
                                "numberOfResultsPerLaunch": 30,
                                "numberOfResultsPerSearch": 120,
                                "removeDuplicateProfiles": true,
                                "csvName": fileName
                            },
                    },
                    credentials.initOptions,
                )
                .then((res) => resolve(res.data.containerId))
                .catch((error) => console.error("Something went wrong :(", error))
        })
    }

    /**
     * Running search process on PhantomBuster
     *
     * @param query
     * @param fileName
     * @param sessionToken
     * @returns {Promise<string>}
     */

    async startSalesNavCompanyEmployeesParser(query, fileName, sessionToken) {
        return await new Promise((resolve) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.salesNavSearchExtractor,
                        "argument":
                            {
                                "numberOfProfiles": 10,
                                "extractDefaultUrl": true,
                                "removeDuplicateProfiles": true,
                                "accountSearch": false,
                                "sessionCookie": sessionToken,
                                "searches": query,
                                "numberOfResultsPerSearch": 2500,
                                "csvName": fileName
                            }
                    },
                    credentials.initOptions,
                )
                .then((res) => resolve(res.data.containerId))
                .catch((error) => console.error("Something went wrong :(", error))
        })
    }

    async runSalesNavSearchParser(query, sessionCookie, fileName) {
        return await new Promise((resolve) => {
            axios.post(
                "https://api.phantombuster.com/api/v2/agents/launch",
                {
                    "id": credentials.salesNavSearchExtractor,
                    "argument":
                        {
                            "numberOfProfiles": 100,
                            "extractDefaultUrl": true,
                            "removeDuplicateProfiles": true,
                            "accountSearch": false,
                            "sessionCookie": sessionCookie,
                            "searches": query,
                            "numberOfResultsPerSearch": 2500,
                            "csvName": fileName
                        },
                },
                credentials.initOptions,
            )
                .then((res) => resolve(res.data.containerId))
                .catch((error) => console.error("Something went wrong :(", error))
        });
    }


    /**
     * Wait for container's work finish and get results from PhantomBuster's containers
     *
     * @param containerId
     * @param scrapperId
     * @returns {Promise<object|boolean>}
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
            fs.appendFile('log.txt', '\n' + status, function (err) {
            });
        } while (status !== 'finished')
        let response = await fetch(url, options)
        if (response.ok) {
            result = await response.json();
            console.log(result)
            if (result.data.resultObject && result.data.resultObject.includes("No activity")) {
                return {
                    notice: "No activity"
                }
            } else if (result.data.output.split('Error:')[1]) {
                return {
                    error: result.data.output.split('Error:')[1]
                }
            } else if (result.data.output.includes("Can't connect to LinkedIn with this session cookie.")) {
                return {
                    error: "Can't connect to LinkedIn with this session cookie."
                }
            } else if (result.data.resultObject) {
                return await JSON.parse(result.data.resultObject)
            } else {
                return false;
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
     * @param sessionToken
     * @returns {Promise<void>}
     */

    async parseActivities(userLinkedInUrl, sessionToken) {
        return await new Promise((resolve) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.activitiesScrapperId,
                        "argument": {
                            "sessionCookie": sessionToken,
                            "spreadsheetUrl": userLinkedInUrl,
                            "numberOfLinesPerLaunch": 10,
                            "numberMaxOfPosts": 2,
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

    async runAutoPoster(documentLink, sessionToken) {
        return await new Promise((resolve) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.autoPosterId,
                        "argument": {
                            "numberTweetsPerLaunch": 1,
                            "visibility": "anyone",
                            "sessionCookie": sessionToken,
                            "spreadsheetUrl": documentLink,
                            "columnName": "content"
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
     * @param sessionToken
     * @returns {Promise<void>}
     */
    async runAutoLiker(documentLink, sessionToken) {
        return await new Promise((resolve) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.autoLikerId,
                        "argument":
                            {
                                "sessionCookie": sessionToken,
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
     * @param sessionToken
     * @returns {Promise<void>}
     */
    async runAutoCommenter(documentLink, sessionToken) {
        return await new Promise((resolve) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.autoCommenterId,
                        "argument":
                            {
                                "sessionCookie": sessionToken,
                                "spreadsheetUrl": documentLink,
                                "columnNameMessage": "comment",
                                "columnName": "link",
                                "randomComments": false,
                                "numberOfLinesPerLaunch": 2
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
     * @param sessionToken
     * @returns {Promise<void>}
     */

    async runAutoConnect(documentUrl, sessionToken) {
        return await new Promise((resolve) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.autoConnectAgentId,
                        "argument":
                            {
                                "numberOfAddsPerLaunch": 3,
                                "onlySecondCircle": false,
                                "waitDuration": 30,
                                "skipProfiles": true,
                                "sessionCookie": sessionToken,
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

    async prepareAutoConnector(queueId) {
        let urls = await this.DBManager.getNotConnectedUsersArray(queueId);
        let formattedData = [];
        return await new Promise((resolve) => {
            if (urls === false) {
                resolve(false);
            }
            for (const value of urls) {
                fs.appendFile('log.txt', '\n ' + value.linkedinUrl, function (err) {
                });
                formattedData.push({
                    link: value.linkedinUrl,
                });
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
        let comments = await this.shuffleComments(await this.DBManager.getCommentsArray());
        console.log(comments)
        let formattedData = []
        return await new Promise((resolve) => {
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

    async shuffleComments(array) {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }

}

module.exports = LinkedInScraper;