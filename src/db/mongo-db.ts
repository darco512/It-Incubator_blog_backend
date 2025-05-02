import { Collection, MongoClient } from 'mongodb';
import {BlogDBType, CommentDBType, PostDBType, UserDBType} from "../input-output-types/types";
import {SETTINGS} from "../settings";
import * as dotenv from "dotenv";
dotenv.config();



export let blogCollection: Collection<BlogDBType>
export let postCollection: Collection<PostDBType>
export let userCollection: Collection<UserDBType>
export let commentCollection: Collection<CommentDBType>

export async function runDB(url: string): Promise<boolean> {
    let client = new MongoClient(url)
    let db = client.db(SETTINGS.DB_NAME)

    blogCollection = db.collection<BlogDBType>(SETTINGS.PATH.BLOGS)
    postCollection = db.collection<PostDBType>(SETTINGS.PATH.POSTS)
    userCollection = db.collection<UserDBType>(SETTINGS.PATH.USERS)

    try {
        await client.connect()
        await db.command({ping: 1});
        console.log("Database Connected");
        return true;
    }
    catch (e) {
        console.log(e);
        await client.close();
        return false;
    }
}

