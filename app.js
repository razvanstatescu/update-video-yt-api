const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const fs = require('fs');
let oauth2Client;

// Load refresh token from youtube-tokens.json
fs.readFile('./credentials/youtube-tokens.json', (err, tokenContent) => {
    if (err) {
        console.log(err);
        return;
    }
    const oauthToken = JSON.parse(tokenContent);
    // Load OAuth credentials from client_secret.json
    fs.readFile('./client_secret.json', (err, oauthContent) => {
        if (err) {
            console.log(err);
            return;
        }
        const oAuthData = JSON.parse(oauthContent);
        const clientSecret = oAuthData.installed.client_secret;
        const clientId = oAuthData.installed.client_id;
        const redirectUrl = oAuthData.installed.redirect_uris[0];
        oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

        oauth2Client.setCredentials({refresh_token: oauthToken.refresh_token});

        const yt = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });

        const videoId = '1q58Lxbh-4o';

        // Get video data
        getVideoData(yt, videoId).then(videoData => {
            // Update video title
            updateVideoTitle(yt, videoId, videoData);
        })
    })
});

async function getVideoData(yt, videoId) {
    const videoData = await yt.videos.list(
        {
            part: 'statistics,snippet',
            id: videoId
        }
    );
    return videoData.data.items[0];
}

async function updateVideoTitle(yt, videoId, videoData) {
    return yt.videos.update(
        {
            part: 'snippet',
            requestBody: {
                id: videoId,
                snippet: {
                    title: 'The time is ' + new Date().toISOString(),
                    categoryId: videoData.snippet.categoryId
                }
            }
        }
    );
}
