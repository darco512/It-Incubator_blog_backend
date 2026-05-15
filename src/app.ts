import express from 'express'
import {SETTINGS} from './settings'
import {blogsRouter} from "./routers/blogs-router";
import bodyParser from "body-parser";
import {postsRouter} from "./routers/posts-router";
import {testingRouter} from "./routers/testing-router";
import {authRouter} from "./routers/auth-router";
import {usersRouter} from "./routers/users-router";
import {commentsRouter} from "./routers/comments-router";
import cookieParser from "cookie-parser";
import {rateLimitMiddleware} from "./middlewares/rate-limit-middleware";

export const app = express() // ÑÐ¾Ð·Ð´Ð°Ñ‚ÑŒ Ð¿Ñ€Ð¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ
app.use(express.json()) // ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ðµ ÑÐ²Ð¾Ð¹ÑÑ‚Ð²-Ð¾Ð±ÑŠÐµÐºÑ‚Ð¾Ð² body Ð²Ð¾ Ð²ÑÐµÑ… Ñ€ÐµÐºÐ²ÐµÑÑ‚Ð°Ñ…
app.use(cookieParser())
app.use(rateLimitMiddleware)

app.get('/', (req, res) => {
    // ÑÐ½Ð´Ð¿Ð¾Ð¸Ð½Ñ‚, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ð¹ Ð±ÑƒÐ´ÐµÑ‚ Ð¿Ð¾ÐºÐ°Ð·Ñ‹Ð²Ð°Ñ‚ÑŒ Ð½Ð° Ð²ÐµÑ€ÑÐµÐ»Ðµ ÐºÐ°ÐºÐ°Ñ Ð²ÐµÑ€ÑÐ¸Ñ Ð±ÑÐºÑÐ½Ð´Ð° ÑÐµÐ¹Ñ‡Ð°Ñ Ð·Ð°Ð»Ð¸Ñ‚Ð°
    res.status(200).json({version: '8.3'})
})
const parserMiddleware = bodyParser.urlencoded({ extended: true })

app.use(parserMiddleware)

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter)
app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.TESTS, testingRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);
