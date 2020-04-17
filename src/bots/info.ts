import { PodcastAssetsDownload, NerdCast, ImageAssetDownload } from "../models";


const getPodcastInfo = (podcast: NerdCast) => {
    const duration = podcast.duration;
    console.log('Duration: ' + podcast.duration)
    const audioUrl = podcast.audio_high;
    const thumbNail = podcast.thumbnails["img-16x9-1210x544"];

    let lastSecond = 0;
    let images: ImageAssetDownload[] = [];
    for (const image of podcast.insertions) {
        let diff = image["start-time"] - lastSecond;
        if (diff > 0) {
            images.push({
                url: thumbNail,
                duration: diff,
                thumb: true
            })
        }

        images.push({
            url: image.image,
            duration: image["end-time"] - image["start-time"],
            thumb: false
        })

        lastSecond = image["end-time"];
    }

    let diffDuration = duration - lastSecond;
    if (diffDuration > 0)
        images.push({
            url: thumbNail,
            duration: diffDuration,
            thumb: true
        })

    let imagesDuration = images
        .map(x => x.duration)
        .reduce((a, b) => a + b);

    console.log('imagesDuration: ' + imagesDuration)

    const obj: PodcastAssetsDownload = {
        images,
        audioUrl,
        duration
    }
    return obj;
}

export const infoBot = {
    getPodcastInfo
}