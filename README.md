# BeenAcquired
# Required server technologies:
1. php8.1 and higher
2. composer v2+
3. npm v8.5+ and nodejs v16+

## To install project:
1. run - *composer install*
2. run - *npm install*
3. fill '.env' file by template of '.env.example'
4. fill '/node_scripts/credentials.js' by template of 'credentials_example.js'
5. run - *php artisan migrate* (previously create database)

# Preparing for work
1. fill in 'accounts' database table information about your LinkedIn account (session token - is 'li-at' cookie data on LinkedIn).
2. fill all credentials from Phantombuster into 'credentials.js' file.
3. to make background process - fill in your crontab file with calling any of available scripts.

# List of available scripts
1. 'node airtableParser.js' - is used for parsing airtable's crypto_companies data and saving to database
2. autoConnect.js, autoLikerCommenter.js and searchScript.js. They all are connected between each other, in order to use:
 - run 'node initSearch.js', fill in required data about account that will be used and search query.
 - add 'node scheduleLaunches.js' to your crontab.
 - 'scheduleLaunches.js' will run all of 3 scripts one after another, in that way it'll search for accounts in sphere, that you entered as seach query, and then will like, comment all available posts, and send connection proposal.
 3. 'companyScrapper.js' - is used for scraping employees, of entered company. To set it up, use site: add company and then create company query. To make script work in a background - launch it via adding 'node companyScrapper.js' to your crontab.
 4. 'profileParser.js' - parses more data about employees, collected by 'companyScrapper.js'. To make script work in a background - launch it via adding 'node profileParser.js' to your crontab.
 5. 'postsParser.js' - collects news information from 'https://www.techmeme.com/' or any other site, then 'autoPoster.js' uses parsed info for creating posts on accounts.
 6. 'autoPoster.js' - makes posts on accounts.

 *** all scripts could be launched via - 'node *scriptName.js*' ***
 
 # Site
 Site's functionality is used for monitoring of parsing processes, managing data and creating new search queries.
