import {Router} from "express";
import {HTTP_STATUSES} from "../utils";
import {blogCollection, postCollection, userCollection} from "../db/mongo-db";

export const testingRouter = Router();

testingRouter.delete('/', async (req, res) => {
    await blogCollection.deleteMany({})
    await postCollection.deleteMany({})
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})