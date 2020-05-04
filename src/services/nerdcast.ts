import { getResults, insertPodcast } from "./storage";
import { Database } from "sqlite3";
import { NerdCast } from "../models/nerdcast";
import { Podcast, PodcastAssetLink } from "../models/podcast";
import { JSDOM } from 'jsdom';

const fetch = require('node-fetch');

const PODCASTS_PAGE = 10;

function getPodcastPage(page: number) {
    return fetch(`https://jovemnerd.com.br/wp-json/jovemnerd/v1/nerdcasts/?per_page=${PODCASTS_PAGE}&page=${page}`)
        .then((res : Response) => res.json())
        .then((x : any) => x as NerdCast[])
        .then((nerdcasts: NerdCast[] )=> nerdcasts.map(x =>  {
            x.pub_date = new Date(x.pub_date);
            return x;
        }))
}

const listNew = async (lastPodcast?: NerdCast) => {
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

const nerdCastToPodcast = (nerdcast: NerdCast) : Podcast => {
    const title = `${nerdcast.product_name} ${nerdcast.episode} - ${nerdcast.title}` + (nerdcast.insertions.length ? ' (Com imagens)' : '');
    const dom = new JSDOM(nerdcast.description);
    const description = dom.window.document.querySelector('p')?.textContent || "";

    return {
        title,
        description,
        duration_seconds: nerdcast.duration,
        id: nerdcast.id,
        json: JSON.stringify(nerdcast),
        podcast_type: 'Nerdcast',
        uploaded: false,
        publish_date: nerdcast.pub_date
    }
}

const insertNerdCast = (db: Database, nerdcast: NerdCast) => {
    const podcast = nerdCastToPodcast(nerdcast);
    return insertPodcast(db, podcast);
}


export const getAssetsNerdcast = async(podcast: Podcast) : Promise<PodcastAssetLink[]> => {
    const nerdcast = JSON.parse(podcast.json) as NerdCast;

    const audio : PodcastAssetLink = {
        type: "audio",
        url: nerdcast.audio_high,
        thumb: false,
        start: 0,
        end: nerdcast.duration
    };

    const thumb : PodcastAssetLink = {
        type: 'image',
        url: nerdcast.thumbnails["img-16x9-1210x544"],
        thumb: true,
        start: 0,
        end: 0
    }

    const images : Array<PodcastAssetLink> = nerdcast.insertions.map(insertion => {
        return {
            url: insertion.image,
            thumb: false,
            type: 'image',
            start: insertion["start-time"],
            end: insertion["end-time"]
        }
    })
    return [audio, thumb, ...images];
}

export const updateNerdcasts = async (db: Database) => {
    const tmpLast = ((await getResults(db, "SELECT * FROM Podcasts ORDER BY insert_date DESC LIMIT 1")) as [{ id: number, json: string } | undefined])[0];
    const last = tmpLast ? JSON.parse(tmpLast.json) as NerdCast : undefined;

    const newPodcasts = await listNew(last);
    for(const podcast of newPodcasts) {
        console.log(`Inserting ${podcast.title}`)
        await insertNerdCast(db, podcast);
    }
}