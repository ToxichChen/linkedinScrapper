const google = require('./google.js');
const credentials = require('./credentials.js')
const LinkedIn = require('./LinkedInScraper')

async function startScraper(query) {
    let containerId = await LinkedInScraper.startLinkedInSearchForPeople(query, resultFileName)
    let result = await LinkedInScraper.getResults(containerId, credentials.searchScrapperId);
    let array = await shuffle(result);
    for (const user of array) {
        if (!user.error) {
            await LinkedInScraper.saveUserToDatabase(user.url, user.firstName, user.lastName)
        }
    }
    await LinkedInScraper.closeDatabaseConnection();
}

let LinkedInScraper = new LinkedIn();

startScraper(query)