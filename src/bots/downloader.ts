import { PodcastAssetsDownload, ImageAsset, PodcastAssets } from "../models"
import * as fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import Sharp from 'sharp';


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
    for (const file of files) {
        fs.unlinkSync(path.join(directory, file))
    }
}

const prepareImage = async (image: ImageAsset) => {
    const newPath = path.join(path.dirname(image.path), path.basename(image.path).split('.').slice(0, -1).join('.') + '_new.jpg');
    if (!fs.existsSync(newPath)) {
        await Sharp(image.path)
            .resize({
                width: 1280,
                height: 720,
                fit: image.thumb ? 'cover' : 'contain',
            })
            .toFile(newPath)
    }
    image.path = newPath;
    return image;
}

const generateFilesTxt = (downloadFolder: string, images: ImageAsset[]) => {
    const content = images.map(x => {
        return `file ${x.path.split('\\').join('\\\\')}\r\n` + `duration ${Math.round(x.duration)}`;
    })
        .join('\r\n');

    const fileTxt = path.join(downloadFolder, '\\files.txt');
    console.log("File txt " + fileTxt);
    fs.writeFileSync(fileTxt, content, 'utf8');
    return fileTxt;
}


const downloadAssets = async (info: PodcastAssetsDownload): Promise<PodcastAssets> => {
    const downloadFolder = path.join(__dirname, '../../tmp');
    console.log(`Download folder: ${downloadFolder}`);

    if (!fs.existsSync(downloadFolder))
        fs.mkdirSync(downloadFolder);
    else
        cleanDir(downloadFolder);

    let images: ImageAsset[] = [];
    let downloaded: string[] = [];
    for (const image of info.images) {
        const imgPath = path.join(downloadFolder, path.basename(image.url))
        if (!downloaded.find(x => x === imgPath)) {
            await downloadFile(image.url, imgPath);
            downloaded.push(imgPath);
        }

        let imgPush = await prepareImage({
            duration: image.duration,
            path: imgPath,
            thumb: image.thumb
        });

        images.push(imgPush);
    }

    const audioPath = path.join(downloadFolder, path.basename(info.audioUrl));
    await downloadFile(info.audioUrl, audioPath);

    const resultPath = audioPath.replace('.mp3', '.mp4');

    const filetxt = generateFilesTxt(downloadFolder, images);

    const returnObj: PodcastAssets = {
        audioPath,
        images,
        resultPath,
        duration: info.duration,
        filetxt
    }


    return returnObj;
}



export const downloaderBot = {
    downloadAssets
}