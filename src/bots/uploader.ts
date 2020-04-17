const { CLIENT_ID, CLIENT_SECRET, SCOPES, SERVER_URI } = process.env;

const PORT = process.env.PORT || 1122;

import fetch from 'node-fetch';
import express from 'express';
import { APIAuth, PodcastExtra } from '../models';
import open from 'open';
const Youtube = require('youtube-api');
import fs from 'fs';

const google = require('googleapis').google
const youtube = google.youtube({ version: 'v3'})

if(!SERVER_URI)
    throw new Error("INVALID SERVER_URI");

const REDIRECT_URI = SERVER_URI + '/callback';

import queryString from 'query-string';


const startLoginServer = () => 
    new Promise((resolve, reject) => {
    const app = express();

    app.get('/login', (req: express.Request, res: express.Response) => {
        const query = {
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: SCOPES,
            access_type: 'offline',
            prompt: 'select_account'
        }
        res.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + queryString.stringify(query));
    });

    app.get('/callback', (req: express.Request, res: express.Response) => {
        const { code } = req.query;
        console.log(code);

        const body = queryString.stringify({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        });

        fetch('https://accounts.google.com/o/oauth2/token', {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(ret => ret.json())
            .then((auth: APIAuth) => {
                resolve(auth)
                res.json(auth)
            })
            .catch((err: Error) => {
                res.status(400)
                    .json({
                        err: err.message
                    })
                reject(err);
            })

    });


    app.listen(PORT, () => {
        console.log('Uploader listening at port: ' + PORT);
        open(SERVER_URI + '/login');
    });
});

const uploadVideo = async (auth: APIAuth, podcastExtra: PodcastExtra) => {
    Youtube.authenticate({
        type: 'oauth',
        token: auth.access_token
    });

    return new Promise((resolve, reject) => {
        // const videoFileSize = fs.statSync(podcastExtra.resultVideoPath).size;
        const videoTitle = `${podcastExtra.podcast.product_name} ${podcastExtra.podcast.episode} - ${podcastExtra.podcast.title}`;
        const description = podcastExtra.podcast.description
            .replace(/<[^>]*>?/gm, '')
            .split('\\n')
            .join('\n');

        Youtube.videos.insert({
            "resource": {
                // Video title and description
                "snippet": {
                    "title": videoTitle,
                    "description": description,
                },
                "status": {
                    "privacyStatus": "private"
                }
            }, 
            "part": "snippet,status,id", 
            "media": {
                "body": fs.createReadStream(podcastExtra.resultVideoPath)
            }
        }, function (err : Error, data: any) {
            if(err)
                reject(err);
            else {
                console.log("Video uploaded: ");
                console.log(data);
                resolve(data);
            }
        });
    });
}

export const uploaderBot = {
    startLoginServer,
    uploadVideo
}





