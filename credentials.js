// -------- PhantomBuster's credentials

module.exports.autoConnectAgentId = '8525843697444923';
module.exports.searchScrapperId = '5974841702255973';
module.exports.profileScrapperId = '7534201859802850';
module.exports.activitiesScrapperId = '5463089645197190';
module.exports.autoLikerId = '6672629543491496';
module.exports.autoCommenterId = '8677201355780542';
module.exports.rocketSearchApiKey = '8cd41kb002500ac227ce845e7e889ac9d40265';
module.exports.phantomBusterApiKey = 'N8VZ7EZnLrft2YA8c91ylnOZ1hbRrHhaVGbFAJUMK9E';
module.exports.sessionCookie = 'AQEDATUY_a4ElpFkAAABeMrexMgAAAF47utIyE4AyzYTorNn5fSelblJ1PwYwbKT0svxtZjrRBKgyVVNBfgS39zPfxZ7aOq2r9xwPMsmFX4njf-BHxzPbg0gD7qiZEj0EySB1fms9ddCtHgXI8zdFt4w';
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