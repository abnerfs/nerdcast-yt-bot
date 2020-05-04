export type Podcast = {
    id: number;
    title: string;
    description: string;
    duration_seconds: number;
    json: string;
    uploaded: boolean;
    podcast_type: 'Nerdcast'
    publish_date: Date;
}

export interface PodcastAssetLink {
    type: 'audio' | 'image',
    url: string;
    thumb: boolean;
    start: number;
    end: number;
}


export interface PodcastAssetPath {
    type: 'audio' | 'image',
    thumb: boolean;
    path: string;
    start: number;
    end: number;
}

export interface PodcastAssetsRender {
    audio_path: string;
    filetxt: string;
    result_path: string;
}

export interface ImageAsset {
    path: string;
    duration: number;
    thumb: boolean;
}


export interface APIAuth {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    refresh_token: string;
}


export interface PodcastVideo {
    resultVideoPath: string;
    title: string;
    description: string;
    tags: string[];
    privacy: 'public' | 'private' | 'unlisted';
}
