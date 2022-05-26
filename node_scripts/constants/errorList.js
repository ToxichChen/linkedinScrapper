//General errors:
module.exports.noActiveAccounts = 'No active accounts found!'

// Queues errors:
module.exports.allQueriesSearched = 'All queries have been already searched!';
module.exports.allQueuesProcessed = 'All queues have been already processed!';

// AutoLikerCommenter errors:
module.exports.allAccountsLiked = 'Accounts from this queue were liked!';
module.exports.allConnected = 'All connections for this search were already sent!';

// Posts parser errors:
module.exports.dataNotReceived = 'Parsing error - data not received';

// Companies parser errors:
module.exports.allCompaniesParsed = 'All companies have been already parsed!';
module.exports.noWorkSpheresFound = 'No available work spheres were found!';
module.exports.noActiveAccountsWithSalesNav = 'No active accounts with Sales Navigator found!';


// Slack message notification
module.exports.slackMessageNotification = async function (errorMessage, environment, script, accountName = '') {
    return {
        'username': 'Error notifier', // This will appear as user name who posts the message
        'text': errorMessage, // text
        'icon_emoji': ':bangbang:', // User icon, you can also use custom icons here
        'attachments': [{ // this defines the attachment block, allows for better layout usage
            'color': '#eed140', // color of the attachments sidebar.
            'fields': [ // actual fields
                {
                    'title': 'Environment', // Custom field
                    'value': environment, // Custom value
                    'short': true // long fields will be full width
                },
                {
                    'title': 'Script',
                    'value': script,
                    'short': true
                },
                {
                    'title': 'Account',
                    'value': accountName,
                    'short': true
                }
            ]
        }]
    };
};
