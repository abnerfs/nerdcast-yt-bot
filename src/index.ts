// import { databaseBot } from "./bots/database";
import dotenv from 'dotenv';
dotenv.config();

import { databaseBot } from "./bots/database";
import { downloaderBot } from "./bots/downloader";
import { rendererBot } from "./bots/renderer";
import { uploaderBot } from './bots/uploader';
import { infoBot } from './bots/info';
import { videoInfoBot } from './bots/videoinfo';

const start = async () => {
    console.log('App inicializado');
    // await uploaderBot.startLoginServer();
    // return;

    await databaseBot.updateDatabase();

    for (const podcast of databaseBot.listPodcastsNotUploaded()) {
        if (podcast) {
            console.log(podcast.title);
            const info = await infoBot.getPodcastInfo(podcast);
            const assets = await downloaderBot.downloadAssets(info);
            await rendererBot.renderVideo(assets);
            const videoinfo = videoInfoBot.getVideoInfo(
                assets.resultPath,
                `${podcast.product_name} ${podcast.episode} - ${podcast.title} (Com imagens)`,
                podcast.description
                +'\r\nProduzido por Jovem Nerd, todos os direitos reservados: ' + podcast.url);

            console.log(videoinfo);
            await uploaderBot.uploadVideo({
               
                }, videoinfo);

            await databaseBot.setUploaded(podcast);
        }
    }
}

start()
    .then(() => {
        console.log('App ended');
    })
    .catch((err: Error) => {
        console.log(`App Error: ${err.message}, ${err.stack}`);
    })
