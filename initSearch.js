const DBManager = require('./DBManager');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.question('What do you want to find? \n', (query) => {
    rl.question('How do you want to name your result file? \n', (file) => {
        let database = new DBManager();
        database.saveSearchQueryToDatabase(query.trim(), file.trim());
        rl.close()
    });
});

