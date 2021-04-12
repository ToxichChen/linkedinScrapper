// -------- PhantomBuster's credentials

module.exports.autoConnectAgentId = '8525843697444923';
module.exports.searchScrapperId = '3859887893193578';
module.exports.profileScrapperId = '7534201859802850';
module.exports.activitiesScrapperId = '3448454239584850';
module.exports.autoLikerId = '4296243235330911';
module.exports.autoCommenterId = '1076926651247403';
module.exports.rocketSearchApiKey = '8cd41kb002500ac227ce845e7e889ac9d40265';
module.exports.phantomBusterApiKey = 'EyFgiCi6NdgRhjv9dBtqncWTVyw3ssyMDeTmwShRToY';
module.exports.sessionCookie = 'AQEDATUY_a4BbooAAAABeLXcsBoAAAF42ek0Gk4Aio4rTm324eNYQuFeVX5YazhTKQrocVxj082mFl7KPaZUOhAoe0gnGmiG5EjGZGHK0Qrf0Kxa1IcjHdSzMiBoLW_YEGrWxqpiOKOsDyh6poRIrg2p\n';
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
module.exports.commentsCsvName = '-linkedinComments.csv';
module.exports.usersCsvName = '-linkedinUsers.csv';

// If modifying these scopes, delete token.json.
module.exports.SCOPES = ['https://www.googleapis.com/auth/spreadsheets', "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"];
// Path to file token.json
module.exports.TOKEN_PATH = 'token.json';