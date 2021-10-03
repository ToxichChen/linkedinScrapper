// -------- Environment
module.exports.env = 'development';

// -------- PhantomBuster's credentials

module.exports.autoConnectAgentId = '609253735464129';
module.exports.searchScrapperId = '8232898481534091';
//module.exports.profileScrapperId = '5209556773930741';
module.exports.activitiesScrapperId = '7422671219971695';
module.exports.autoLikerId = '5589231724643415';
module.exports.autoCommenterId = '6599370476695509';
module.exports.autoPosterId = '2224415501361762';
// ------- ApiKeys:
module.exports.rocketSearchApiKey = '8cd41kb002500ac227ce845e7e889ac9d40265';
module.exports.phantomBusterApiKey = 'T4CLwxsXjU5fhOoyAUpz5JADIrGIp1pTViuavE2ZQkI';
// ------- Session token:
module.exports.sessionCookie = 'AQEDATUY_a4D1Vg-AAABeXrYOoUAAAF5nuS-hVYAQNAhSlp3Ca8iV4fMdGVMNjmhf07zrF4DGPkjRllxLMBUg0qK3QWIVf1m-sWWxFh9PyNAzUyCflond2vLHhXxhNTfdrPjdUPpio85smieXRzJKlQu';
module.exports.initOptions = {
    headers: {
        "x-phantombuster-key": this.phantomBusterApiKey,
        "Content-Type": "application/json",
    },
}

// --------- Database Credentials ------------

module.exports.dbHost = 'mysql';
module.exports.dbUser = 'root';
module.exports.dbPassword = 'root';
module.exports.database = 'linkedin';

// --------- Google API credentials ----------

module.exports.commentsFolderId = '18zI4KZYGjzMNoL2sPQjxlKNxYtm4UnQP';
module.exports.usersFolderId = '1UhWYt3oiWd_j8U5wNMu3aduP5HDtzvp_';
module.exports.postsFolderId = '1PBStcQloJBMiyLrJy4FZzLLClc93CPeU';
module.exports.commentsCsvName = '-linkedinComments.csv';
module.exports.usersCsvName = '-linkedinUsers.csv';
module.exports.postsCsvName = '-linkedinPosts.csv';

// If modifying these scopes, delete token.json.
module.exports.SCOPES = ['https://www.googleapis.com/auth/spreadsheets', "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"];
// Path to file token.json
module.exports.TOKEN_PATH = 'token.json';

// Slack WebHook
module.exports.slackWebHook = 'https://hooks.slack.com/services/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'; // PUT YOUR WEBHOOK URL HERE