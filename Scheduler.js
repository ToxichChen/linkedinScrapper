const DBManager = require('./DBManager')

class Scheduler {
    constructor() {
        this.DBManager = new DBManager();
    }

    async makeReport (result) {
        return await this.DBManager.saveReportToDatabase(result);
    }

    async updateReport (reportId, result) {
        await this.DBManager.updateReport(reportId, result)
    }

}


module.exports = Scheduler;