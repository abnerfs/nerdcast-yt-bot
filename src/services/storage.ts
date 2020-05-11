import sqlite3 from 'sqlite3';
import { Podcast } from '../models/podcast';

export const createTables = async (db: sqlite3.Database) => {
    const scripts = [
        `CREATE TABLE IF NOT EXISTS Podcasts (id INT PRIMARY KEY, title TEXT, description TEXT, duration_seconds INT, json TEXT NOT NULL, podcast_type VARCHAR(10), uploaded INT, upload_date DATETIME, publish_date DATETIME, insert_date DATETIME)`
    ]

    for(const script of scripts) {
        await execQuery(db, script);
    }
}


export const insertPodcast = (db: sqlite3.Database, podcast: Podcast) => {
    return execQuery(
        db,
        `INSERT INTO Podcasts(id, title, description, duration_seconds, json, podcast_type, uploaded, upload_date, publish_date, insert_date) VALUES(?, ?, ?, ?, ?, ?, 0, null, ?, date('now'))`,
        [podcast.id, podcast.title, podcast.description, podcast.duration_seconds, podcast.json, podcast.podcast_type, podcast.publish_date]
    )
}



export const getResults = (db: sqlite3.Database, query:string, params?: any[]) =>
    new Promise((resolve, reject) => {
        db.all(query, params, (err, rows: Array<any>) => {
            if(err)
                reject(err);
            else{
                resolve(rows);
            }
        })
    });

export const execQuery = (db: sqlite3.Database, query: string, params?: any[]) => 
    new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    })

export const openDB = () : Promise<sqlite3.Database> =>
    new Promise((resolve, reject) => {
        const dbPath = process.env.DB_PATH;
        if (!dbPath)
            reject(`Variable DB_PATH not specified`);
        else {
            const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
                if (err)
                    reject(`Error while trying to connecto to: ${dbPath}, ${err.message}`);
                else
                    resolve(db);
            })
        }
    })


export const setUploaded = (db: sqlite3.Database, id: number) => {
    const query = `UPDATE podcasts SET Uploaded = 1, upload_date = date('now') WHERE id = ? `;
    return execQuery(db, query, [id]);
}

export const getNotUploaded = async (db: sqlite3.Database, id?: number) => {
    const query = `SELECT * FROM podcasts WHERE Uploaded = 0 ${id ? 'AND id = ?' : ''}  ORDER BY publish_date DESC, insert_date DESC LIMIT 1`
    return ((await getResults(db, query, [id])) as [Podcast | undefined])[0]
}