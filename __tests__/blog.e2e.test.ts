import {req} from './test-helpers'
import {dataset1} from './datasets'
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/utils";
import {setDB} from "../src/db/db";
import {InputBlogType, OutputBlogType} from "../src/input-output-types/types";
import {ADMIN_PASSWORD, ADMIN_USERNAME} from "../src/middlewares/auth-middleware";

describe('/blogs', () => {

    const base64Credentials = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await req
            .delete(SETTINGS.PATH.TESTS)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('should get empty array', async () => {

        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200) // проверяем наличие эндпоинта

        expect(res.body.length).toBe(0) // проверяем ответ эндпоинта
    })
    it('should get not empty array', async () => {
         setDB(dataset1) // заполнение базы данных начальными данными если нужно

        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body).toEqual(dataset1.blogs)
    })

    const newBlog :InputBlogType = {
        name: 'new blog name',
        description: 'new blog description',
        websiteUrl: 'https://newblog.com',
    }

    let createdBlog: OutputBlogType = {
        id: '',
        name: '',
        description: '',
        websiteUrl: '',
    };



    it('should create blog', async () => {

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(newBlog) // отправка данных
            .expect(201)

        console.log(res.body)

        createdBlog = res.body
    })

    it('should find blog', async () => {

        const res = await req
            .get(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}`)
            .expect(200)
        console.log(res.body)
    })


    it('shouldn\'t find', async () => {

        const res = await req
            .get(SETTINGS.PATH.BLOGS + '/1')
            .expect(404) // проверка на ошибку

        console.log(res.body)
    })

    it ('shouldn\'t delete blog', async () => {
        await req
            .delete(SETTINGS.PATH.BLOGS + '/1')
            .set('Authorization', `Basic ${base64Credentials}`)
            .expect(404)
    })

    it('should delete post', async () => {

        const secondBlog: InputBlogType = {
            name: 'random name',
            description: 'second blog description',
            websiteUrl: 'https://random.com',
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(secondBlog)
            .expect(201)

        const id = res.body.id;

        await req
            .delete(`${SETTINGS.PATH.BLOGS}/${id}`)
            .set('Authorization', `Basic ${base64Credentials}`)
            .expect(204)
    })

    it('shouldn\'t update', async () => {

        const secondBlog: InputBlogType = {
            name: 'random name',
            description: 'second blog description',
            websiteUrl: 'https://random.com',
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(secondBlog)
            .expect(201)

        const id = res.body.id;


        const updatedPost: InputBlogType = {
            name: 'name is toooooooooooooooooooooooooooooooooooooooooooooooooo long',
            description: '',
            websiteUrl: '123',
        }

        await req
            .put(`${SETTINGS.PATH.BLOGS}/${id}`)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(updatedPost)
            .expect(400)
        console.log(res.body)
    })

    it('should update', async () => {
        const secondBlog: InputBlogType = {
            name: 'random name',
            description: 'second blog description',
            websiteUrl: 'https://random.com',
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(secondBlog)
            .expect(201)

        const id = res.body.id;

        const updatedBlog: InputBlogType = {
            name: 'updated name',
            description: 'updated blog description',
            websiteUrl: 'https://updated.com',
        }

        const blog = await req
            .put(`${SETTINGS.PATH.BLOGS}/${id}`)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(updatedBlog)
            .expect(200)

        expect(blog.body.name).toBe(updatedBlog.name);
        expect(blog.body.description).toBe(updatedBlog.description);
        expect(blog.body.websiteUrl).toBe(updatedBlog.websiteUrl);


    })
})