const mysql = require('mysql');
const Airtable = require('airtable');
const credentials = require('../credentials.js')

let connection = mysql.createConnection({
    host: credentials.dbHost,
    user: credentials.dbUser,
    password: credentials.dbPassword,
    database: credentials.database
});

let base = new Airtable({apiKey: 'keytvFhqneWKMyPnX'}).base('appzJ0hfvu6z2s5Fc');

base('tbl0XENq0nILbadRU').select({
    view: "Grid view"
}).eachPage(function page(records, fetchNextPage) {

    records.forEach(function(record) {
        let sql = (`INSERT INTO crypto_companies (fund_raising_round, date, amount, investors, website, founder, category, subcategories, description, stages, valuation, project, announcement)
                    VALUES ("${record.get('Fundraising Round')}", "${record.get('Date')}", "${record.get('Amount') || ''}", "${record.get('Investors')  || ''}", "${record.get('Website')}", "${record.get('Founder')}", "${record.get('Category')}", "${record.get('Sub-categories')}", "${record.get('Description')}", "${record.get('Stages')}", "${(record.get('Valuation') || '')}", "${record.get('Project')}", "${record.get('Announcement') || ''}") `);
        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            } else {
                console.log("Successfully saved!")
            }
        });
        console.log('Retrieved', record.get('Investors'));
    });

    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); connection.end(); }
    connection.end();
});
