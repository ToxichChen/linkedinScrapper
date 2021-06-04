const DBManager = require('./DBManager');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
let query = '';
let file = '';

async function dialogue () {
    rl.question('What do you want to find? \n', async (queryResponse) => {
        query = queryResponse.trim();
        rl.question('How do you want to name your result file? \n', async (fileResponse) => {
            file = fileResponse.trim();
            let Database = new DBManager();
            let accounts = await Database.getAccounts();
            await accounts.forEach(function (account) {
                    console.log('ID: ' + account.id + ', Name: ' + account.name + ', Last name: ' + account.last_name + ', Location: ' + account.location + ', Company: ' + account.company + ', Job: ' + account.job)
                }
            )
            rl.question('Please, choose account from the list \n', async (accountId) => {
                await Database.saveSearchQueryToDatabase(query, file, accountId.trim());
                await rl.close();
            });
        });
    });
}
dialogue();