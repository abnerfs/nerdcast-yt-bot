
import { PodcastAssets } from '../models';
import { spawn } from 'child_process';

const videoshow = require('videoshow');

const renderVideo = async (assets: PodcastAssets) => {

    await new Promise(async (resolve, reject) => {
        console.log('Start rendering...');


        const ffmpeg = spawn('ffmpeg', ["-f", "concat", "-safe", "0", "-i", assets.filetxt, "-i", assets.audioPath, "-acodec", "libmp3lame", "-vcodec", "libx264", "-filter:v", "scale=w=1280:h=720", assets.resultPath]);
   
            ffmpeg.stderr.on('data', (data) => {
                console.log('grep stderr: ' + data);
            })

            ffmpeg.on('exit', function () {
                console.log('Render finished !');
                resolve();
            })
    });
}

export const rendererBot = {
    renderVideo
}


//ffmpeg -f concat -i D:\Abner\nerdcast-yt-bot\tmp\files.txt -i D:\Abner\nerdcast-yt-bot\tmp\nerdcast_716_velho.mp3 -acodec libmp3lame -vcodec libx264 -filter:v scale=w=1280:h=720 D:\Abner\nerdcast-yt-bot\tmp\nerdcast_716_velho.mp4

//ffmpeg -f concat -safe 0 -i D:\Abner\nerdcast-yt-bot\tmp\files.txt -i D:\Abner\nerdcast-yt-bot\tmp\nerdcast_716_velho.mp3 -acodec libmp3lame -vcodec libx264 -filter:v scale=w=1280:h=720 D:\Abner\nerdcast-yt-bot\tmp\nerdcast_716_velho.mp4