// (A) LOAD MODULES
// npm install mysql xlsx
// https://www.npmjs.com/package/mysql
// https://www.npmjs.com/package/xlsx
const mysql = require("mysql"),
    xlsx = require("xlsx");

// (B) CONNECT TO DATABASE - CHANGE SETTINGS TO YOUR OWN!
const db = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "root",
    database: "linkedin"
});
db.connect();

// (C) EXPORT TO EXCEL
db.query("SELECT * FROM `employees` WHERE company_id = 5", (error, results) => {
    // (C1) EXTRACT DATA FROM DATABASE
    if (error) throw error;
    var data = [];
    results.forEach((row) => {
        console.log(row['name']);
        data.push([row["id"], row["full_name"], row["linkedin_url"], row['title'], row['company_name'], row['location'], row['duration'], row['past_role'], row['past_company'], row['sales_nav_url']]);
    });

    // (C2) WRITE TO EXCEL FILE
    var worksheet = xlsx.utils.aoa_to_sheet(data),
        workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "employees");
    xlsx.writeFile(workbook, "parsed_data.xlsx");
});

// (D) DONE - CLOSE DB CONNECTION
db.end();
