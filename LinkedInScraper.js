const credentials = require('./credentials.js')
const axios = require("axios")
const fetch = require('node-fetch');
const DBManager = require('./DBManager')

class LinkedInScraper {
    constructor() {
        this.DBManager = new DBManager();
    }

    /**
     * Running search process on PhantomBuster
     *
     * @param query
     * @param resultFileName
     * @returns {Promise<string>}
     */

    async startLinkedInSearchForPeople(query) {
        return await new Promise((resolve, reject) => {
            axios
                .post(
                    "https://api.phantombuster.com/api/v2/agents/launch",
                    {
                        "id": credentials.searchScrapperId,
                        "argument":
                            {
                                "firstCircle": true,
                                "seoudpdCircle": true,
                                "thirdCircle": true,
                                "category": "People",
                                "numberOfLinesPerLaunch": 10,
                                "sessionCookie": credentials.sessionCookie,
                                "search": query,
                                "numberOfResultsPerLaunch": 30,
                                "numberOfResultsPerSearch": 120,
                                "removeDuplicateProfiles": true,
                                "csvName": query
                            },
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
            } else if(result.data.output.split('Error:')[1]) {
                return {
                    error: result.data.output.split('Error:')[1]
                }
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
        let urls = await this.DBManager.getUsersArray();
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
        let comments = await this.DBManager.getCommentsArray();
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

}

module.exports = LinkedInScraper;