// import { databaseBot } from "./bots/database";
import dotenv from 'dotenv';
dotenv.config();

import { databaseBot } from "./bots/database";
import { downloaderBot } from "./bots/downloader";
import { rendererBot } from "./bots/renderer";
import { uploaderBot } from './bots/uploader';
import { infoBot } from './bots/info';

const start = async () => {
    console.log('App inicializado');
    // await uploaderBot.startLoginServer();
    
    const podcast = databaseBot.getPodcast(395054);
    if(podcast) {
        const info = await infoBot.getPodcastInfo(podcast);
        const assets = await downloaderBot.downloadAssets(info);
        await rendererBot.renderVideo(assets);

    }
    // await databaseBot.updateDatabase();
}

start()
    .then(() => {
        console.log('App ended');
    })
    .catch((err: Error ) => {
        console.log(`App Error: ${err.message}, ${err.stack}`);
    })
