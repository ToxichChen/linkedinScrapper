// -------- PhantomBuster's credentials

module.exports.autoConnectAgentId = '4089482434250646';
module.exports.searchScrapperId = '2935457086220465';
//module.exports.profileScrapperId = '5209556773930741';
module.exports.activitiesScrapperId = '3747522391192821';
module.exports.autoLikerId = '5338656193591117';
module.exports.autoCommenterId = '1331432976655506';
module.exports.rocketSearchApiKey = '8cd41kb002500ac227ce845e7e889ac9d40265';
module.exports.phantomBusterApiKey = 'RNd56SGPhGpAdokkNE47jnaNREfdndDVEIm4JA0pXg4';
module.exports.sessionCookie = 'AQEDATUY_a4D1Vg-AAABeXrYOoUAAAF5nuS-hVYAQNAhSlp3Ca8iV4fMdGVMNjmhf07zrF4DGPkjRllxLMBUg0qK3QWIVf1m-sWWxFh9PyNAzUyCflond2vLHhXxhNTfdrPjdUPpio85smieXRzJKlQu';
module.exports.initOptions = {
    headers: {
        "x-phantombuster-key": this.phantomBusterApiKey,
        "Content-Type": "application/json",
    },
}

// --------- Database Credentials ------------

module.exports.dbHost = 'localhost';
module.exports.dbUser = 'dmitry';
module.exports.dbPassword = 'aqswdefr1';
module.exports.database = 'linkedin';

// --------- Google API credentials ----------

module.exports.commentsFolderId = '18zI4KZYGjzMNoL2sPQjxlKNxYtm4UnQP';
module.exports.usersFolderId = '1UhWYt3oiWd_j8U5wNMu3aduP5HDtzvp_';
module.exports.commentsCsvName = '-linkedinComments.csv';
module.exports.usersCsvName = '-linkedinUsers.csv';

// If modifying these scopes, delete token.json.
module.exports.SCOPES = ['https://www.googleapis.com/auth/spreadsheets', "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"];
// Path to file token.json
module.exports.TOKEN_PATH = 'token.json';