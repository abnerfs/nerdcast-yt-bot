
import { spawn } from 'child_process';
import { PodcastAssetPath, Podcast, ImageAsset } from '../models/podcast';
import { changeExt } from '../services/util';
import { writeFileSync } from 'fs';
import { DOWNLOAD_FOLDER } from './downloader';
import path from 'path';

const getPodcastInputList = (images: PodcastAssetPath[], duration: number) => {
    let inputs : Array<ImageAsset> = [];

    const thumbNail = images.find(x => x.thumb);
    if(!thumbNail)
        throw new Error('Thumbnail not found');

    let lastSecond = 0;
    for (const image of images.filter(x => !x.thumb)) {
        let diff = image.start - lastSecond;
        if (diff > 0) {
            inputs.push({
                path: thumbNail.path,
                duration: diff,
                thumb: true
            })
        }

        inputs.push({
            path: image.path,
            duration: image.end - image.start,
            thumb: false
        })

        lastSecond = image.end;
    }

    let diffDuration = duration - lastSecond;
    if (diffDuration > 0)
        inputs.push({
            path: thumbNail.path,
            duration: diffDuration,
            thumb: true
        })

    let imagesDuration = inputs
        .map(x => x.duration)
        .reduce((a, b) => a + b);

    console.log('duration ' + duration);
    console.log('imagesDuration: ' + imagesDuration)
    return inputs;
}

const generateInputTxt = (assets: PodcastAssetPath[], duration: number) => {
    const images = assets.filter(x => x.type === 'image');

    const inputs = getPodcastInputList(images, duration);

    const content = inputs.map((x, index) => {
        const fName = `${x.path.split('\\').join('\\\\')}`;
        let str = `file ${fName}\r\n` + `duration ${Math.round(x.duration)}`;
        if(index < inputs.length -1)
            return str;

        str += '\r\n file ' + fName;
        return str;
    })
        .join('\r\n');

    

    const fileTxt = path.join(DOWNLOAD_FOLDER, '\\files.txt');
    console.log("File txt " + fileTxt);
    writeFileSync(fileTxt, content, 'utf8');
    return fileTxt;
}


export const renderVideo = async (podcast: Podcast, assets: PodcastAssetPath[]) => {
    const fileTxt = generateInputTxt(assets, podcast.duration_seconds);
    const audio = assets.find(x => x.type === 'audio');
    if(!audio)
        throw new Error("Invalid audio");

    const result_path = changeExt(audio.path, '.mp4');

    await new Promise(async (resolve, reject) => {
        console.log('Start rendering...');

        const ffmpeg = spawn('ffmpeg', ["-f", "concat", "-safe", "0", "-i", fileTxt, "-i", audio.path, "-acodec", "libmp3lame", "-vcodec", "libx264", "-preset", "medium", "-crf", "18", "-movflags",  "+faststart", "-filter:v", "scale=w=1280:h=720", result_path]);

            ffmpeg.stderr.on('data', (data) => {
                console.log('grep stderr: ' + data);
            })

            ffmpeg.on('exit', function () {
                console.log('Render finished !');
                resolve();
            })
    });
    return result_path;
}
