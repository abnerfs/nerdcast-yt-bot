import * as fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import Sharp from 'sharp';
import { PodcastAssetPath, PodcastAssetLink } from '../models/podcast';


function encodefileNameURL(url: string) {
    let pathurl = url.split('/');
    let fileName = pathurl.pop() || '';
    const newUrl = pathurl.join('/') + '/' + encodeURIComponent(fileName);
    return newUrl;
}


function downloadFile(url: string, dest: string) {
    const urlParsed = encodefileNameURL(url);

    return fetch.default(urlParsed)
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

const prepareImage = async (imagePath: string, thumb: boolean): Promise<string> => {
    const newPath = path.join(path.dirname(imagePath), path.basename(imagePath).split('.').slice(0, -1).join('.') + '_new.jpg');
    if (!fs.existsSync(newPath)) {
        await Sharp(imagePath)
            .resize({
                width: 1280,
                height: 720,
                fit: thumb ? 'cover' : 'contain',
            })
            .toFile(newPath)
    }
    return newPath;
}

export const DOWNLOAD_FOLDER = path.join(__dirname, '../../tmp');


const getDownloadFolderAndEnsureExists = () => {
    if (!fs.existsSync(DOWNLOAD_FOLDER))
        fs.mkdirSync(DOWNLOAD_FOLDER);
    else
        cleanDir(DOWNLOAD_FOLDER);

    console.log(`Download folder: ${DOWNLOAD_FOLDER}`);
    return DOWNLOAD_FOLDER;
}


export const downloadAssets = async (assets: PodcastAssetLink[]): Promise<PodcastAssetPath[]> => {
    const downloadFolder = getDownloadFolderAndEnsureExists();

    let assetPaths: Array<PodcastAssetPath> = [];

    for (const asset of assets) {
        let assetPath = path.join(downloadFolder, path.basename(asset.url));
        await downloadFile(asset.url, assetPath);

        if (asset.type === 'image')
            assetPath = await prepareImage(assetPath, asset.thumb);

        assetPaths.push({
            thumb: asset.thumb,
            type: asset.type,
            path: assetPath,
            start: asset.start,
            end: asset.end
        })
    }

    return assetPaths;
}



