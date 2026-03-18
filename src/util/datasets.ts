export interface DatasetImage {
    url: string;
    thumbnail?: string;
}

export interface Dataset {
    id: string;
    nameKey: string; // Translation key for the name
    descriptionKey: string; // Translation key for the description
    images: DatasetImage[];
    categoryKey: string; // Translation key for the category
}

export let DATASETS: Dataset[] = [];

export const REMOTE_DATASETS_URL = 'https://store.gen-ai.fi/tm/datasets/datasets.json';

export async function fetchAndCacheDatasets(url: string = REMOTE_DATASETS_URL): Promise<Dataset[]> {
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Failed to fetch datasets: ${resp.status}`);
        const json = (await resp.json()) as Dataset[];
        if (Array.isArray(json)) {
            DATASETS = json;
            return DATASETS;
        }
        throw new Error('Invalid datasets format from server');
    } catch (err) {
        console.error('Error fetching datasets:', err);
        return DATASETS;
    }
}
