import express from 'express'
import {SETTINGS} from './settings'
import {blogsRouter} from "./routers/blogs-router";
import bodyParser from "body-parser";
import {postsRouter} from "./routers/posts-router";
import {testingRouter} from "./routers/testing-router";
import {authRouter} from "./routers/auth-router";
import {usersRouter} from "./routers/users-router";
import {commentsRouter} from "./routers/comments-router";

export const app = express() // создать приложение
app.use(express.json()) // создание свойств-объектов body во всех реквестах

app.get('/', (req, res) => {
    // эндпоинт, который будет показывать на верселе какая версия бэкэнда сейчас залита
    res.status(200).json({version: '6.5'})
})
const parserMiddleware = bodyParser.urlencoded({ extended: true })

app.use(parserMiddleware)


app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter)
app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.TESTS, testingRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);


