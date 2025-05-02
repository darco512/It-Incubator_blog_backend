import {req} from './test-helpers'
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/utils";
import {InputBlogType, OutputBlogType} from "../src/input-output-types/types";
import {ADMIN_PASSWORD, ADMIN_USERNAME} from "../src/middlewares/auth-middleware";
import {blogCollection, runDB} from "../src/db/mongo-db";

describe('/blogs', () => {

    const base64Credentials = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await runDB(SETTINGS.MONGO_URL)
        await blogCollection.deleteMany()
    })

    it('should get empty array', async () => {

        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200) // проверяем наличие эндпоинта

        const expected = {
            items: expect.any(Array),
            page: expect.any(Number),
            pageSize: expect.any(Number),
            pagesCount: expect.any(Number),
            totalCount: expect.any(Number),
        };

        expect(res.body).toEqual(expected) // проверяем ответ эндпоинта
    })

    const newBlog :InputBlogType = {
        name: 'new blog name',
        description: 'new blog description',
        websiteUrl: 'https://newblog.com',
    }

    let createdBlog = {
        id: '',
        name: '',
        description: '',
        websiteUrl: '',
        createdAt: '',
        isMembership: ''
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


    it('should find blog posts', async () => {

        const res = await req
            .get(`${SETTINGS.PATH.BLOGS}/${createdBlog.id}/posts`)
            .expect(200)
        console.log(res.body)

        const expected = {
            items: expect.any(Array),
            page: expect.any(Number),
            pageSize: expect.any(Number),
            pagesCount: expect.any(Number),
            totalCount: expect.any(Number),
        };

        expect(res.body).toEqual(expected)
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
            .expect(HTTP_STATUSES.NO_CONTENT_204)



    })
})