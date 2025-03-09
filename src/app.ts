import express from 'express'
import {SETTINGS} from './settings'
import {blogsRouter} from "./routers/blogs-router";
import bodyParser from "body-parser";
import {postsRouter} from "./routers/posts-router";
import {testingRouter} from "./routers/testing-router";

export const app = express() // создать приложение
app.use(express.json()) // создание свойств-объектов body во всех реквестах

app.get('/', (req, res) => {
    // эндпоинт, который будет показывать на верселе какая версия бэкэнда сейчас залита
    res.status(200).json({version: '1.0'})
})
const parserMiddleware = bodyParser({});

app.use(parserMiddleware)


app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter)
app.use(SETTINGS.PATH.TESTS, testingRouter);
