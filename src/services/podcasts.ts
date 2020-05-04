import { updateNerdcasts } from "./nerdcast"
import sqlite3 from "sqlite3";

export const updatePodcasts = async (db: sqlite3.Database) => {
    await updateNerdcasts(db);
}
