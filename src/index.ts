// import { databaseBot } from "./bots/database";
import dotenv from 'dotenv';
dotenv.config();

import { databaseBot } from "./bots/database";
import { downloaderBot } from "./bots/downloader";
import { botRenderer } from "./bots/renderer";
import { uploaderBot } from './bots/uploader';

const start = async () => {
    console.log('App inicializado');
    // await uploaderBot.startLoginServer();
    
    const episode = databaseBot.getEpisode(395408);
    if(episode) {
        const episodeExtra = await downloaderBot.downloadAssets(episode);
        await botRenderer.renderVideo(episodeExtra);
        await uploaderBot.uploadVideo({
            
        }, episodeExtra);
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
