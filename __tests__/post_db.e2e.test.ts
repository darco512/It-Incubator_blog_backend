import {req} from './test-helpers'
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/utils";
import {InputBlogType, InputPostType, OutputBlogType} from "../src/input-output-types/types";
import {ADMIN_PASSWORD, ADMIN_USERNAME} from "../src/middlewares/auth-middleware";
import {blogCollection, postCollection, runDB} from "../src/db/mongo-db";

describe('/posts', () => {

    const base64Credentials = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');
    let token: string;
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await runDB(SETTINGS.MONGO_URL)
        await blogCollection.deleteMany()
        await postCollection.deleteMany()

        const authResponse = await req
            .post(`${SETTINGS.PATH.AUTH}/login`)
            .send({ loginOrEmail: ADMIN_USERNAME, password: ADMIN_PASSWORD });

        token = authResponse.body.accessToken ;
        if (!token) throw new Error("Login failed in beforeAll");
    })

    
    it('should get empty array', async () => {

        const res = await req
            .get(SETTINGS.PATH.POSTS)
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

  let postId: string

    it('should create post', async () => {
        const newBlogPost :InputPostType = {
            title: 'title',
            shortDescription: 'First new blog post description',
            content: 'Lorem Ipsum',
            blogId: createdBlog.id,
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(newBlogPost) // отправка данных

        postId = res.body.id
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
            .get(SETTINGS.PATH.POSTS + '/1')
            .expect(404) // проверка на ошибку

        console.log(res.body)
    })

    it ('shouldn\'t delete post', async () => {
        await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set('Authorization', `Basic ${base64Credentials}`)
            .expect(404)
    })

    it('should delete post', async () => {

        const secondPost: InputPostType = {
            title: '1234564788',
            shortDescription: 'asdfdsghdjklhjhgfd',
            content: 'fdsgshjdsgshjhg',
            blogId: createdBlog.id
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(secondPost)
            .expect(201)

        const id = res.body.id;
        console.log(res.body)

        await req
            .delete(`${SETTINGS.PATH.POSTS}/${id}`)
            .set('Authorization', `Basic ${base64Credentials}`)
            .expect(204)
    })

    it('shouldn\'t update', async () => {

        const secondPost: InputPostType = {
            title: '1234564788',
            shortDescription: 'asdfdsghdjklhjhgfd',
            content: 'fdsgshjdsgshjhg',
            blogId: createdBlog.id
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(secondPost)
            .expect(201)

        const id = res.body.id;


        const updatedPost: InputPostType = {
            title: 'This title is toooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo long',
            shortDescription: '',
            content: '',
            blogId: '1'
        }

        await req
            .put(`${SETTINGS.PATH.POSTS}/${id}`)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(updatedPost)
            .expect(400)
    })

    it('should update', async () => {
        const secondPost: InputPostType = {
            title: '1234564788',
            shortDescription: 'asdfdsghdjklhjhgfd',
            content: 'fdsgshjdsgshjhg',
            blogId: createdBlog.id
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(secondPost)
            .expect(201)

        const id = res.body.id;

        const updatedPost: InputPostType = {
            title: 'new title',
            shortDescription: 'new description',
            content: 'new content',
            blogId: createdBlog.id
        }

        await req
            .put(`${SETTINGS.PATH.POSTS}/${id}`)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(updatedPost)
            .expect(204)
    })

    let commentId: string

    it('should create comment', async () => {

        const res = await req
            .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({content: "first comment asdasd asd asd asd asd asd asdasd"}) // отправка данных
            .expect(201)
        commentId = res.body.id
        console.log(res.body)

    })

    it('should get comment', async () => {

        const res = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .expect(200)
        console.log(res.body)

    })

    it('should get comments of the post', async () => {

        const res = await req
            .get(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
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

    it('should update comment', async () => {

        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({content: "asdddddddddddddddddddddddddddddddddddddddddddddd"})
            .expect(204)

    })

    it('shouldn\'t update comment', async () => {

        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE2YWUxNGM4OTE2M2ZjODgxMjJlNmIiLCJpYXQiOjE3NDYzMTY4MzIsImV4cCI6MTc0NjMyMDQzMn0.Hape_gRqFsZMoJIjtdkH2-ZrbWoAvGkM7cBwusIBYwg`)
            .send({content: "asdddddddddddddddddddddddddddddddddddddddddddddd"})
            .expect(403)

    })

    it('should delete comment', async () => {

        await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

    })


})