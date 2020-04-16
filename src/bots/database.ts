const fetch = require('node-fetch');
import fs from 'fs';
import path from 'path';
import { Podcast } from '../models';

const PODCASTS_PAGE = 10;

const folderPath = path.join(__dirname, "../../data/");
const filePath = path.join(folderPath, 'podcasts.json');

const loadEpisodes = () => {
    try{
        const podcasts = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Podcast[];
        return podcasts || [];
    }
    catch(err) {
        return [];
    }
}

const getEpisode = (id: number) => {
    const episodes = loadEpisodes();
    return episodes.find(x => x.id === id);
}

const updateDatabase = async () => {

    if(!fs.existsSync(folderPath))
        fs.mkdirSync(folderPath);

    const savedPodcasts = await loadEpisodes();
    console.log('Loaded ' + savedPodcasts.length + ' podcasts from disk');

    const lastPodcast = savedPodcasts[0] || undefined;


    async function getPodcastPage(page: number) {
        return fetch(`https://jovemnerd.com.br/wp-json/jovemnerd/v1/nerdcasts/?per_page=${PODCASTS_PAGE}&page=${page}`)
            .then((res : Response) => res.json())
            .then((x : any) => x as Podcast[]);
    }
    
    async function getEveryPodcast() {
        let page = 1;
        let podcastsOffset : Podcast[] = [];
        let podcasts : Podcast[] = [];

        do {
            console.log(`Page: ${page}`);
            podcastsOffset = await getPodcastPage(page++);
            if(lastPodcast) {
                let indexLast = podcastsOffset.findIndex(x => x.id === lastPodcast.id);
                if(indexLast > -1){
                    podcastsOffset = podcastsOffset.slice(0, indexLast);
                    console.log("Last podcast found, nothing new from here...");
                }
            }

            podcasts = podcasts.concat(podcastsOffset);
            console.log(`New episodes length: ${podcasts.length}`);
        }
        while(podcastsOffset.length == PODCASTS_PAGE)

        return podcasts;
    }
    
    const podcasts = (await getEveryPodcast()).concat(savedPodcasts);
    fs.writeFileSync(__dirname + '/../../data/podcasts.json', JSON.stringify(podcasts), 'utf8');
    return podcasts;
}

export const databaseBot = {
    getEpisode,
    updateDatabase
}

