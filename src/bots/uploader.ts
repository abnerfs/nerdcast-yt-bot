const { CLIENT_ID, CLIENT_SECRET, SCOPES, SERVER_URI } = process.env;

const PORT = process.env.PORT || 1122;

import fetch from 'node-fetch';
import express from 'express';
import open from 'open';
const Youtube = require('youtube-api');
import fs from 'fs';

if(!SERVER_URI)
    throw new Error("INVALID SERVER_URI");

const REDIRECT_URI = SERVER_URI + '/callback';

import queryString from 'query-string';
import { APIAuth, PodcastVideo } from '../models/podcast';


export const startLoginServer = () => 
    new Promise<APIAuth>((resolve, reject) => {
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

export type videoUploadInfo = {
    title: string;
    description: string;
    tags: string;
    auth: APIAuth;
    privacy: 'public' | 'private';
    videoPath: string;
}

export const uploadVideo = async (auth: APIAuth, videoInfo: PodcastVideo) => {
    console.log('Uploading video...');
    Youtube.authenticate({
        type: 'oauth',
        token: auth.access_token
    });

    return new Promise((resolve, reject) => {
        Youtube.videos.insert({
            "resource": {
                "snippet": {
                    "title": videoInfo.title,
                    "description": videoInfo.description,
                    "tags" : videoInfo.tags.join(' ')
                },
                "status": {
                    "privacyStatus": videoInfo.privacy
                }
            }, 
            "part": "snippet,status,id", 
            "media": {
                "body": fs.createReadStream(videoInfo.resultVideoPath)
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

