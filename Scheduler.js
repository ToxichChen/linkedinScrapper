const DBManager = require('./DBManager')
const https = require('https');
const errorsList = require('./errorList.js');
const credentials = require('./credentials.js')

class Scheduler {
    constructor() {
        this.DBManager = new DBManager();
    }

    async makeReport(result) {
        return await this.DBManager.saveReportToDatabase(result);
    }

    async updateReport(reportId, result) {
        await this.DBManager.updateReport(reportId, result)
    }

    async formReport(report, error = '', previousError = '') {
        console.log(error);
        report.error = error;
        report.in_progress = 0;
        if (error !== '' && report.success === 0) {
            if (previousError === '' || previousError !== error) {
                await this.sendErrorNotification(report.error, report.script, await this.DBManager.getAccountFullNameByID(report.account_id));
            }
        } else if (error === '') {
            report.success = 1;
        }
        await this.updateReport(report.report_id, report);
    }

    async sendErrorNotification(errorMessage, scriptName, accountName = '') {
        if (!credentials.slackWebHook) {
            return false;
        }

        console.log('Sending slack message');
        try {
            const slackResponse = await this.sendSlackMessage(credentials.slackWebHook, await errorsList.slackMessageNotification(errorMessage, credentials.env, scriptName, accountName));
            console.log('Message response', slackResponse);
        } catch (e) {
            console.error('There was a error with the request', e);
        }
    }

    async sendSlackMessage(webhookURL, messageBody) {
        // make sure the incoming message body can be parsed into valid JSON
        try {
            messageBody = JSON.stringify(messageBody);
        } catch (e) {
            throw new Error('Failed to stringify messageBody', e);
        }

        // Promisify the https.request
        return new Promise((resolve, reject) => {
            // general request options, we defined that it's a POST request and content is JSON
            const requestOptions = {
                method: 'POST',
                header: {
                    'Content-Type': 'application/json'
                }
            };

            // actual request
            const req = https.request(webhookURL, requestOptions, (res) => {
                let response = '';

                res.on('data', (d) => {
                    response += d;
                });

                // response finished, resolve the promise with data
                res.on('end', () => {
                    resolve(response);
                })
            });

            // there was an error, reject the promise
            req.on('error', (e) => {
                reject(e);
            });

            // send our message body (was parsed to JSON beforehand)
            req.write(messageBody);
            req.end();
        });
    }

}


module.exports = Scheduler;