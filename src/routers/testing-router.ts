import {Router} from "express";
import {HTTP_STATUSES} from "../utils";
import {blogCollection, postCollection, requestCollection, sessionsCollection, userCollection} from "../db/mongo-db";

export const testingRouter = Router();

testingRouter.delete('/', async (req, res) => {
    await blogCollection.deleteMany({})
    await postCollection.deleteMany({})
    await userCollection.deleteMany({})
    await requestCollection.deleteMany({})
    await sessionsCollection.deleteMany({})
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})
