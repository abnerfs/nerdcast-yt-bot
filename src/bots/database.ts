const fetch = require('node-fetch');
import fs from 'fs';
import path from 'path';
import { NerdCast } from '../models';

const PODCASTS_PAGE = 10;

const folderPath = path.join(__dirname, "../../data/");
const filePath = path.join(folderPath, 'podcasts.json');

const loadPodcasts = () => {
    try{
        const podcasts = JSON.parse(fs.readFileSync(filePath, 'utf8')) as NerdCast[];
        return podcasts || [];
    }
    catch(err) {
        return [];
    }
}

const getPodcast = (id: number) => {
    const episodes = loadPodcasts();
    return episodes.find(x => x.id === id);
}

const updateDatabase = async () => {

    if(!fs.existsSync(folderPath))
        fs.mkdirSync(folderPath);

    const savedPodcasts = await loadPodcasts();
    console.log('Loaded ' + savedPodcasts.length + ' podcasts from disk');

    const lastPodcast = savedPodcasts[0] || undefined;


    async function getPodcastPage(page: number) {
        return fetch(`https://jovemnerd.com.br/wp-json/jovemnerd/v1/nerdcasts/?per_page=${PODCASTS_PAGE}&page=${page}`)
            .then((res : Response) => res.json())
            .then((x : any) => x as NerdCast[]);
    }
    
    async function getEveryPodcast() {
        let page = 1;
        let podcastsOffset : NerdCast[] = [];
        let podcasts : NerdCast[] = [];

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
    getPodcast,
    updateDatabase
}

