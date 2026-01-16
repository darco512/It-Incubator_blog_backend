import {req, users} from './test-helpers'
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/utils";
import {
    UserInputType,
    UserViewModel
} from "../src/input-output-types/types";
import {ADMIN_PASSWORD, ADMIN_USERNAME} from "../src/middlewares/auth-middleware";
import {userCollection, runDB, closeDB} from "../src/db/mongo-db";

describe('/users', () => {

    const base64Credentials = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await runDB(SETTINGS.MONGO_URL)
        await userCollection.deleteMany()
    })

    afterAll(async () => {
        // Close database connection to prevent Jest from hanging
        await closeDB()
    })

    it('should get empty array', async () => {

        const res = await req
            .get(SETTINGS.PATH.USERS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .expect(HTTP_STATUSES.OK_200) // проверяем наличие эндпоинта

        const expected = {
            items: expect.any(Array),
            page: expect.any(Number),
            pageSize: expect.any(Number),
            pagesCount: expect.any(Number),
            totalCount: expect.any(Number),
        };

        expect(res.body).toEqual(expected) // проверяем ответ эндпоинта
    })

    const user :UserInputType = {
        login: 'admin',
        password: 'qwerty',
        email: 'example@gmail.com',
    }

    let createdUser: UserViewModel = {
        id: '',
        login: '',
        email: '',
        createdAt: ''
    }


    it('should create user', async () => {

        const res = await req
            .post(SETTINGS.PATH.USERS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(user) // отправка данных
            .expect(HTTP_STATUSES.CREATED_201)

        console.log(res.body)

        createdUser = res.body
    })





    it('should login', async () => {
        const authData = {
            loginOrEmail: user.email,
            password: user.password,
        }
        const res = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(authData)
            .expect(HTTP_STATUSES.OK_200)

        console.log(res.body)
    });


    it('shouldn\'t find', async () => {

        const res = await req
            .get(SETTINGS.PATH.USERS + '/1')
            .expect(HTTP_STATUSES.NOT_FOUND_404) // проверка на ошибку

        console.log(res.body)
    })


    it ('shouldn\'t delete user', async () => {
        await req
            .delete(SETTINGS.PATH.USERS + '/1')
            .set('Authorization', `Basic ${base64Credentials}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should delete user', async () => {

        await req
            .delete(`${SETTINGS.PATH.USERS}/${createdUser.id}`)
            .set('Authorization', `Basic ${base64Credentials}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('should create users', async () => {

        // Use Promise.all to wait for all requests to complete
        await Promise.all(users.map(async (user) => {
            await req
                .post(SETTINGS.PATH.USERS)
                .set('Authorization', `Basic ${base64Credentials}`)
                .send(user)
                .expect(201)
        }));
    });

    it('should found users', async () => {

        const res = await req
            .get(SETTINGS.PATH.USERS + '?pageSize=15&pageNumber=1&searchLoginTerm=seR&searchEmailTerm=.com&sortDirection=asc&sortBy=login')
            .set('Authorization', `Basic ${base64Credentials}`)
            .expect(HTTP_STATUSES.OK_200) // проверяем наличие эндпоинта

        const expected = {
            items: expect.any(Array),
            page: expect.any(Number),
            pageSize: expect.any(Number),
            pagesCount: expect.any(Number),
            totalCount: expect.any(Number),
        };

        expect(res.body).toEqual(expected) // проверяем ответ эндпоинта
    });

})