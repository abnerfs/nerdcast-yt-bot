export interface NerdCast {
    id: number;
    url: string;
    published_at: Date;
    pub_date: Date;
    modified_at: Date;
    duration: number;
    title: string;
    slug: string;
    episode: string;
    product: string;
    product_name: string;
    friendly_post_type: string;
    friendly_post_type_slug: string;
    friendly_post_time: string;
    friendly_post_date: string;
    subject: string;
    image: string;
    image_alt: null;
    thumbnails: Thumbnails;
    audio_high: string;
    audio_medium: string;
    audio_low: string;
    audio_zip: string;
    insertions: Insertion[];
    description: string;
    "jump-to-time": JumpToTime;
    guests: string;
    post_type_class: string;
    uploaded: boolean;
}

export interface PodcastExtra {
    podcast: NerdCast;
    audioPath: string;
    imagePath: string;
    resultVideoPath: string;
}

export interface ImageAssetDownload {
    url: string;
    duration: number;
    thumb: boolean;
}

export interface ImageAsset {
    path: string;
    duration: number;
    thumb: boolean;
}

export interface PodcastAssetsDownload {
    audioUrl: string;
    images: ImageAssetDownload[];
    duration: number;
}

export interface PodcastAssets {
    audioPath: string;
    images: ImageAsset[];
    resultPath: string;
    duration: number;
    filetxt: string;
}

export interface PodcastVideo {
    resultVideoPath: string;
    title: string;
    description: string;
    tags: string[];
    privacy: 'public' | 'private' | 'unlisted';
}

export interface Insertion {
    id: number;
    title: string;
    image: string;
    link: string;
    "button-title": string;
    "start-time": number;
    "end-time": number;
    sound: boolean;
}

export interface JumpToTime {
    test: string;
    "start-time": number;
    "end-time": number;
}

export interface Thumbnails {
    "img-4x3-355x266": string;
    "img-16x9-1210x544": string;
    "img-16x9-760x428": string;
    "img-4x6-448x644": string;
    "img-1x1-3000x3000": string;
}

export interface APIAuth {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    refresh_token: string;
}
