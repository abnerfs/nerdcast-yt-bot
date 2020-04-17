import { PodcastVideo } from "../models";


const getVideoInfo = (resultVideoPath: string, rawTitle: string, rawDescription: string) : PodcastVideo => {

    const description = 
           rawDescription
            .replace(/<[^>]*>?/gm, '')
            .split('\\n')
            .join('\r\n')
            + `\r\nCanal de games:  https://www.youtube.com/user/AbNeRZicaMaster\r\nCanal de programação: https://www.youtube.com/channel/UCgJY9EgxDscvVGbXzftiMBg\r\n`;

        

    const title = rawTitle;


    return {
        description,
        title,
        resultVideoPath,
        privacy: 'public',
        tags: ['nerdcast', 'bot', 'nerdbot', 'podcast', 'brasil', 'Jovem Nerd', 'Allotoni', 'Alexandre Ottoni', 'Deive Pazos', 'Azhagal', 'imagens', 'app jovem nerd']
    }
}

export const videoInfoBot = {
    getVideoInfo
}