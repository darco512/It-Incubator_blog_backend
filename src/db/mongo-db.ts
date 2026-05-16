import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import {BlogDBType, CommentDBType, PostDBType, RequestsDBType, SessionDBType, UserDBType} from "../input-output-types/types";
import {SETTINGS} from "../settings";
import mongoose from 'mongoose'

let client: MongoClient | null = null;
let isDbReady = false;

function getMongoClientOptions(url: string): MongoClientOptions {
    const options: MongoClientOptions = {
        serverSelectionTimeoutMS: 10_000,
    };
    if (url.startsWith("mongodb+srv://")) {
        options.tlsAllowInvalidCertificates = true;
    }
    return options;
}

function initCollections(db: ReturnType<MongoClient['db']>): void {
    blogCollection = db.collection<BlogDBType>(SETTINGS.PATH.BLOGS)
    postCollection = db.collection<PostDBType>(SETTINGS.PATH.POSTS)
    userCollection = db.collection<UserDBType>(SETTINGS.PATH.USERS)
    commentCollection = db.collection<CommentDBType>(SETTINGS.PATH.COMMENTS)
    requestCollection = db.collection<RequestsDBType>(SETTINGS.PATH.RAQUESTS)
    sessionsCollection = db.collection<SessionDBType>(SETTINGS.PATH.SESSIONS)
}

export let blogCollection!: Collection<BlogDBType>;
export let postCollection!: Collection<PostDBType>;
export let userCollection!: Collection<UserDBType>;
export let commentCollection!: Collection<CommentDBType>;
export let requestCollection!: Collection<RequestsDBType>;
export let sessionsCollection!: Collection<SessionDBType>;

export async function runDB(url: string): Promise<boolean> {
    try {
        if (!client) {
            client = new MongoClient(url, getMongoClientOptions(url))
            await client.connect()
            isDbReady = false
        } else {
            try {
                await client.db('admin').command({ ping: 1 });
            } catch {
                await client.connect();
                isDbReady = false
            }
        }

        if (isDbReady) {
            return true;
        }

        const db = client.db(SETTINGS.DB_NAME)
        await db.command({ping: 1});
        initCollections(db);
        isDbReady = true;
        return true;
    }
    catch (e) {
        console.log("Database connection error:", e);
        if (client) {
            await client.close().catch(() => {});
            client = null;
        }
        isDbReady = false;
        return false;
    }
}

export function initCollectionsFromMongoose(mongooseConnection: typeof mongoose.connection): void {
    const db = mongooseConnection.db;
    if (!db) {
        throw new Error("Mongoose database not available");
    }
    
    blogCollection = db.collection<BlogDBType>(SETTINGS.PATH.BLOGS) as any as Collection<BlogDBType>;
    postCollection = db.collection<PostDBType>(SETTINGS.PATH.POSTS) as any as Collection<PostDBType>;
    userCollection = db.collection<UserDBType>(SETTINGS.PATH.USERS) as any as Collection<UserDBType>;
    commentCollection = db.collection<CommentDBType>(SETTINGS.PATH.COMMENTS) as any as Collection<CommentDBType>;
    requestCollection = db.collection<RequestsDBType>(SETTINGS.PATH.RAQUESTS) as any as Collection<RequestsDBType>;
    sessionsCollection = db.collection<SessionDBType>(SETTINGS.PATH.SESSIONS) as any as Collection<SessionDBType>;
}

export async function closeDB(): Promise<void> {
    if (client) {
        await client.close();
        client = null;
    }
    isDbReady = false;
}
