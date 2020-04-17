
import Ffmpeg from 'fluent-ffmpeg';
import { PodcastAssets } from '../models';
import Sharp from 'sharp';
import path from 'path';
import { lookup } from 'dns';
import { writeFileSync } from 'fs';
import { exec, ExecException } from 'child_process';

const videoshow = require('videoshow');

const renderVideo = async (assets : PodcastAssets) => {

    await new Promise( async (resolve, reject) => {
        console.log('Start rendering...');

        let commandFfmpeg = `ffmpeg -f concat -safe 0 -i ${assets.filetxt} -i ${assets.audioPath} -acodec libmp3lame -vcodec libx264 -filter:v scale=w=1280:h=720 ${assets.resultPath} -y`;
        console.log(commandFfmpeg);

        exec(commandFfmpeg,(error, stdout, stderr) => {
            if(error)
                reject(error);
        })
        .on('start', function(commandLine: string) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('progress', function (progress: any) {
            console.log('Rendering video: ' + progress + '% done');
        })
        .on('error', function (err: Error) {
            console.log('Error rendering: ' + err.message);
            reject(err);
        })
        .on('end', function () {
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