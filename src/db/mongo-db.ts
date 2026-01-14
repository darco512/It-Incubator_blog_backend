import { Collection, MongoClient } from 'mongodb';
import {BlogDBType, CommentDBType, PostDBType, UserDBType} from "../input-output-types/types";
import {SETTINGS} from "../settings";
import * as dotenv from "dotenv";
dotenv.config();

let client: MongoClient | null = null;
export let blogCollection: Collection<BlogDBType> | undefined
export let postCollection: Collection<PostDBType> | undefined
export let userCollection: Collection<UserDBType> | undefined
export let commentCollection: Collection<CommentDBType> | undefined

export async function runDB(url: string): Promise<boolean> {
    try {
        // Reuse existing client if available (for serverless)
        if (!client) {
            client = new MongoClient(url)
            await client.connect()
        } else {
            // Test if connection is still alive
            try {
                await client.db('admin').command({ ping: 1 });
            } catch {
                // Connection lost, reconnect
                await client.connect();
            }
        }
        
        const db = client.db(SETTINGS.DB_NAME)
        await db.command({ping: 1});

        blogCollection = db.collection<BlogDBType>(SETTINGS.PATH.BLOGS)
        postCollection = db.collection<PostDBType>(SETTINGS.PATH.POSTS)
        userCollection = db.collection<UserDBType>(SETTINGS.PATH.USERS)
        commentCollection = db.collection<CommentDBType>(SETTINGS.PATH.COMMENTS)

        console.log("Database Connected");
        return true;
    }
    catch (e) {
        console.log("Database connection error:", e);
        if (client) {
            await client.close().catch(() => {});
            client = null;
        }
        return false;
    }
}

