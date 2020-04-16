// import { databaseBot } from "./bots/database";

import { databaseBot } from "./bots/database";
import { downloaderBot } from "./bots/downloader";
import { botRenderer } from "./bots/renderer";

const start = async () => {
    console.log('App inicializado');
    const episode = databaseBot.getEpisode(400964);
    if(episode) {
        const episodePaths = await downloaderBot.downloadAssets(episode);
        await botRenderer.renderVideo(episodePaths);
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
