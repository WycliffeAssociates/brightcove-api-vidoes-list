const axios = require('axios').default;
const fs = require('fs');
require('dotenv').config();


const generateJSON = (token) => {
    let videos = [];

    // Gest the total count of videos to know when to stop paging
    axios.request({
        url: "https://cms.api.brightcove.com/v1/accounts/6314154063001/counts/videos",
        method: "get",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(async (res) => {
        let numVideos = res.data.count

        let offset = 0;
        let limit = 25;

        // Performs paging
        while(offset <= numVideos)
        {
            await axios.request({
                url: `https://cms.api.brightcove.com/v1/accounts/${process.env.ACCOUNT_ID}/videos?limit=${limit}&offset=${offset}`,
                method: "get",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then((res => {
                if(res.data.length >= 0) {
                    videos = videos.concat(res.data);
                }
            }))
            offset += limit;
        }
        
    })
    .then(() => {
        // generate JSON file here using videos array
        videosJSON = JSON.stringify(videos);

        fs.writeFile("videos_data.json", videosJSON, function(err, result) {
            if(err) console.log('error', err);
        });
    })
}


axios.request({
    url: "https://oauth.brightcove.com/v4/access_token?grant_type=client_credentials",
    method: "post",
    auth: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET
    },
})
.then((res) => {
    generateJSON(res.data.access_token);
})