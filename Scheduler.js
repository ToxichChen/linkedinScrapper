const DBManager = require('./DBManager')

class Scheduler {
    constructor() {
        this.DBManager = new DBManager();
    }

    async makeReport (result) {
        await this.DBManager.saveReportToDatabase(result)
    }

}


module.exports = Scheduler;