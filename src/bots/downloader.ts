import { Podcast, PodcastExtra } from "../models"
import * as fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

function downloadFile(url: string, dest: string) {
    return fetch.default(url)
        .then((res) => {
            const fileStream = fs.createWriteStream(dest);
            return new Promise((resolve, reject) => {
                res.body.pipe(fileStream);

                res.body.on("error", (err) => {
                    fileStream.close();
                    reject(err);
                });

                fileStream.on("finish", function () {
                    fileStream.close();
                    resolve();
                });
            });
        })
}

function cleanDir(directory: string) {
    const files = fs.readdirSync(directory);
    for(const file of files) {
        fs.unlinkSync(path.join(directory, file))
    }
}

const downloadAssets = async (podcast: Podcast): Promise<PodcastExtra> => {
    const downloadFolder = path.join(__dirname, '../../tmp');
    console.log(`Download folder: ${downloadFolder}`);

    if (!fs.existsSync(downloadFolder))
        fs.mkdirSync(downloadFolder);
    else
        cleanDir(downloadFolder);

    const imgUrl = podcast.thumbnails["img-16x9-1210x544"];
    const imgPath = path.join(downloadFolder, path.basename(imgUrl))
    await downloadFile(imgUrl, imgPath);

    const audioUrl = podcast.audio_high;
    const audioPath = path.join(downloadFolder, path.basename(audioUrl));
    await downloadFile(audioUrl, audioPath);

    const resultVideoPath = audioPath.replace('.mp3', '.mp4');

    const returnObj : PodcastExtra = {
        podcast ,
        audioPath,
        imagePath: imgPath,
        resultVideoPath
    }

    return returnObj;
}



export const downloaderBot = {
    downloadAssets
}