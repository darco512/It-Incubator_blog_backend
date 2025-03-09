import {Router} from "express";
import {setDB} from "../db/db";
import {HTTP_STATUSES} from "../utils";

export const testingRouter = Router();

testingRouter.delete('/', (req, res) => {
    setDB();
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})