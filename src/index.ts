import dotenv from 'dotenv';
dotenv.config();

import { renderVideo } from "./bots/renderer";
import { createTables, openDB, getNotUploaded, setUploaded } from './services/storage';
import { updatePodcasts } from './services/podcasts';
import { PodcastAssetLink } from './models/podcast';
import { getAssetsNerdcast } from './services/nerdcast';
import { downloadAssets } from './bots/downloader';
import { getVideoInfo } from './bots/videoinfo';
import { uploadVideo, startLoginServer } from './bots/uploader';

const start = async () => {
    console.log('App inicializado');
    const auth = await startLoginServer();
    console.log(auth);

    const db = await openDB();
    try {
        await createTables(db);
        await updatePodcasts(db);

        while (true) {
            const podcast = await getNotUploaded(db);
            if (!podcast)
                break;

            console.log(podcast.title);

            let assetLinks: PodcastAssetLink[] = [];
            if (podcast.podcast_type === 'Nerdcast')
                assetLinks = await getAssetsNerdcast(podcast);

            const assetFiles = await downloadAssets(assetLinks);
            const resultPath = await renderVideo(podcast, assetFiles);
            const info = getVideoInfo(resultPath, podcast.title, podcast.description);

            await uploadVideo(auth, info);

            await setUploaded(db, podcast.id);
        }

    }
    finally {
        db.close();
    }
}

start()
    .then(() => {
        console.log('App ended');
    })