import {req, users} from './test-helpers'
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/utils";
import {
    UserInputType,
    UserViewModel
} from "../src/input-output-types/types";
import {ADMIN_PASSWORD, ADMIN_USERNAME} from "../src/middlewares/auth-middleware";
import {userCollection, runDB, closeDB} from "../src/db/mongo-db";

describe('/auth', () => {

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

    const user2 :UserInputType = {
        login: 'ad',
        password: 'length_21-weqweqweqwq',
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
            .post(SETTINGS.PATH.AUTH + "/registration")
            .send(user) // отправка данных
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        console.log(res.body)

        createdUser = res.body
    })

    it('should create user by test', async () => {

        const res = await req
            .post(SETTINGS.PATH.AUTH + "/registration")
            .send({"password":"qwerty1","email":"vantreytest1+mkzxdfoxb03r@yandex.com","login":"ulogin"}) // отправка данных
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        console.log(res.body)

        createdUser = res.body
    })


    it('shouldnt create user', async () => {
        const res = await req
            .post(SETTINGS.PATH.AUTH + "/registration")
            .send(user2)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(res.body.errorsMessages).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ field: "login", message: expect.any(String) }),
                expect.objectContaining({ field: "password", message: expect.any(String) })
            ])
        );
    });



    // it('should login', async () => {
    //     const authData = {
    //         loginOrEmail: user.email,
    //         password: user.password,
    //     }
    //     const res = await req
    //         .post(SETTINGS.PATH.AUTH + '/login')
    //         .send(authData)
    //         .expect(HTTP_STATUSES.OK_200)
    //
    //     console.log(res.body)
    // });

})