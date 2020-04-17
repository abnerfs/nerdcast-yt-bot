
import Ffmpeg from 'fluent-ffmpeg';
import { PodcastExtra } from '../models';

const renderVideo = async (podcast : PodcastExtra) => {
    console.log(podcast.audioPath);
    console.log(podcast.imagePath);
    console.log(podcast.podcast.duration);
    console.log(podcast.resultVideoPath);

    await new Promise((resolve, reject) => {
        Ffmpeg()
            .input(podcast.audioPath)
            .input(podcast.imagePath)
            .inputFPS(1)
            .loop(podcast.podcast.duration)
            .outputFPS(1)
            .audioCodec('libmp3lame')
            .videoCodec('libx264')
            .size('1280x720')
            .on('progress', function (progress: { percent: number }) {
                console.log('Rendering video: ' + progress.percent.toFixed(2) + '% done');
            })
            .on('error', function (err) {
                console.log('Error rendering: ' + err.message);
                reject(err);
            })
            .on('end', function () {
                console.log('Render finished !');
                resolve();
            })
            .save(podcast.resultVideoPath);
    });
}

export const botRenderer = {
    renderVideo
}
