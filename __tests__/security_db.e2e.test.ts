import request, {Response} from 'supertest'
import {req} from './test-helpers'
import {app} from '../src/app'
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/utils";
import {UserInputType} from "../src/input-output-types/types";
import {ADMIN_PASSWORD, ADMIN_USERNAME} from "../src/middlewares/auth-middleware";
import {runDB, requestCollection} from "../src/db/mongo-db";
import {randomUUID} from "crypto";

function getRefreshTokenFromResponse(res: Response): string {
    const setCookie = res.headers['set-cookie'];
    if (!setCookie) {
        return '';
    }
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    const line = cookies.find((c) => c.startsWith('refreshToken='));
    if (!line) {
        return '';
    }
    return line.split(';')[0].replace('refreshToken=', '');
}

describe('/security', () => {
    const security = SETTINGS.PATH.SECURITY;
    const auth = SETTINGS.PATH.AUTH;
    const base64Credentials = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

    const user: UserInputType = {
        login: 'secuser',
        password: 'qwerty12',
        email: 'secuser@test.com',
    };

    const otherUser: UserInputType = {
        login: 'secother',
        password: 'qwerty12',
        email: 'secother@test.com',
    };

    beforeAll(async () => {
        const connected = await runDB(SETTINGS.MONGO_URL);
        expect(connected).toBe(true);
        await req.delete(SETTINGS.PATH.TESTS).expect(HTTP_STATUSES.NO_CONTENT_204);

        await req
            .post(SETTINGS.PATH.USERS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(user)
            .expect(HTTP_STATUSES.CREATED_201);

        await req
            .post(SETTINGS.PATH.USERS)
            .set('Authorization', `Basic ${base64Credentials}`)
            .send(otherUser)
            .expect(HTTP_STATUSES.CREATED_201);
    });

    beforeEach(async () => {
        await requestCollection.deleteMany({});
    });

    it('should return 401 without refreshToken cookie', async () => {
        await request(app)
            .get(`${security}/devices`)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it('should get devices for current user', async () => {
        const loginRes = await req
            .post(`${auth}/login`)
            .send({loginOrEmail: user.login, password: user.password})
            .expect(HTTP_STATUSES.OK_200);

        const deviceId = loginRes.body.deviceId;

        const res = await req
            .get(`${security}/devices`)
            .expect(HTTP_STATUSES.OK_200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body[0]).toEqual({
            ip: expect.any(String),
            title: expect.any(String),
            lastActiveDate: expect.any(String),
            deviceId: expect.any(String),
        });
        expect(res.body.some((s: {deviceId: string}) => s.deviceId === deviceId)).toBe(true);
    });

    it('should delete one device by deviceId', async () => {
        const oldDeviceId = randomUUID();
        const currentDeviceId = randomUUID();

        await req
            .post(`${auth}/login`)
            .send({loginOrEmail: user.login, password: user.password, deviceId: oldDeviceId})
            .expect(HTTP_STATUSES.OK_200);

        await req
            .post(`${auth}/login`)
            .send({loginOrEmail: user.login, password: user.password, deviceId: currentDeviceId})
            .expect(HTTP_STATUSES.OK_200);

        await req
            .delete(`${security}/devices/${oldDeviceId}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const res = await req
            .get(`${security}/devices`)
            .expect(HTTP_STATUSES.OK_200);

        expect(res.body.some((s: {deviceId: string}) => s.deviceId === oldDeviceId)).toBe(false);
        expect(res.body.some((s: {deviceId: string}) => s.deviceId === currentDeviceId)).toBe(true);
    });

    it('should return 404 when deleting unknown deviceId', async () => {
        await req
            .post(`${auth}/login`)
            .send({loginOrEmail: user.login, password: user.password})
            .expect(HTTP_STATUSES.OK_200);

        await req
            .delete(`${security}/devices/${randomUUID()}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('should return 403 when deleting another user device', async () => {
        const otherLoginRes = await req
            .post(`${auth}/login`)
            .send({loginOrEmail: otherUser.login, password: otherUser.password})
            .expect(HTTP_STATUSES.OK_200);

        const otherDeviceId = otherLoginRes.body.deviceId;

        await req
            .post(`${auth}/login`)
            .send({loginOrEmail: user.login, password: user.password})
            .expect(HTTP_STATUSES.OK_200);

        await req
            .delete(`${security}/devices/${otherDeviceId}`)
            .expect(HTTP_STATUSES.FORBIDDEN_403);
    });

    it('should delete all devices for current user', async () => {
        const oldDeviceId = randomUUID();
        const currentDeviceId = randomUUID();

        await req
            .post(`${auth}/login`)
            .send({loginOrEmail: otherUser.login, password: otherUser.password, deviceId: oldDeviceId})
            .expect(HTTP_STATUSES.OK_200);

        await req
            .post(`${auth}/login`)
            .send({loginOrEmail: otherUser.login, password: otherUser.password, deviceId: currentDeviceId})
            .expect(HTTP_STATUSES.OK_200);

        await req
            .delete(`${security}/devices`)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const res = await req
            .get(`${security}/devices`)
            .expect(HTTP_STATUSES.OK_200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].deviceId).toBe(currentDeviceId);
    });

    describe('refresh token lifecycle (incubator)', () => {
        it('should invalidate old refresh token after refresh-token', async () => {
            const deviceId = randomUUID();

            const loginRes = await req
                .post(`${auth}/login`)
                .send({loginOrEmail: user.login, password: user.password, deviceId})
                .expect(HTTP_STATUSES.OK_200);

            const oldRefreshToken = getRefreshTokenFromResponse(loginRes);

            await req
                .post(`${auth}/refresh-token`)
                .expect(HTTP_STATUSES.OK_200);

            await request(app)
                .post(`${auth}/refresh-token`)
                .set('Cookie', `refreshToken=${oldRefreshToken}`)
                .expect(HTTP_STATUSES.UNAUTHORIZED_401);

            await request(app)
                .post(`${auth}/logout`)
                .set('Cookie', `refreshToken=${oldRefreshToken}`)
                .expect(HTTP_STATUSES.UNAUTHORIZED_401);
        });

        it('should return devices after refresh-token with same deviceId and updated lastActiveDate', async () => {
            const deviceId = randomUUID();

            await req
                .post(`${auth}/login`)
                .send({loginOrEmail: user.login, password: user.password, deviceId})
                .expect(HTTP_STATUSES.OK_200);

            const beforeRefresh = await req
                .get(`${security}/devices`)
                .expect(HTTP_STATUSES.OK_200);

            const deviceBefore = beforeRefresh.body.find((s: {deviceId: string}) => s.deviceId === deviceId);
            expect(deviceBefore).toBeDefined();

            await req
                .post(`${auth}/refresh-token`)
                .expect(HTTP_STATUSES.OK_200);

            const afterRefresh = await req
                .get(`${security}/devices`)
                .expect(HTTP_STATUSES.OK_200);

            const deviceAfter = afterRefresh.body.find((s: {deviceId: string}) => s.deviceId === deviceId);
            expect(deviceAfter).toBeDefined();
            expect(deviceAfter.deviceId).toBe(deviceId);
            expect(deviceAfter.lastActiveDate).not.toBe(deviceBefore.lastActiveDate);
        });

        it('should return 401 on logout with old refresh token after DELETE /security/devices/:deviceId', async () => {
            const deviceId = randomUUID();

            const loginRes = await req
                .post(`${auth}/login`)
                .send({loginOrEmail: user.login, password: user.password, deviceId})
                .expect(HTTP_STATUSES.OK_200);

            const oldRefreshToken = getRefreshTokenFromResponse(loginRes);

            await req
                .delete(`${security}/devices/${deviceId}`)
                .expect(HTTP_STATUSES.NO_CONTENT_204);

            await request(app)
                .post(`${auth}/logout`)
                .set('Cookie', `refreshToken=${oldRefreshToken}`)
                .expect(HTTP_STATUSES.UNAUTHORIZED_401);
        });

        it('should return 401 on second logout with same refresh token', async () => {
            const loginRes = await req
                .post(`${auth}/login`)
                .send({loginOrEmail: user.login, password: user.password})
                .expect(HTTP_STATUSES.OK_200);

            const refreshToken = getRefreshTokenFromResponse(loginRes);

            await req
                .post(`${auth}/logout`)
                .expect(HTTP_STATUSES.NO_CONTENT_204);

            await request(app)
                .post(`${auth}/logout`)
                .set('Cookie', `refreshToken=${refreshToken}`)
                .expect(HTTP_STATUSES.UNAUTHORIZED_401);
        });

        it('should return 401 on logout with terminated device refresh token after DELETE /security/devices', async () => {
            const otherDeviceId = randomUUID();
            const currentDeviceId = randomUUID();

            const otherLoginRes = await req
                .post(`${auth}/login`)
                .send({loginOrEmail: user.login, password: user.password, deviceId: otherDeviceId})
                .expect(HTTP_STATUSES.OK_200);

            const otherRefreshToken = getRefreshTokenFromResponse(otherLoginRes);

            await req
                .post(`${auth}/login`)
                .send({loginOrEmail: user.login, password: user.password, deviceId: currentDeviceId})
                .expect(HTTP_STATUSES.OK_200);

            await req
                .delete(`${security}/devices`)
                .expect(HTTP_STATUSES.NO_CONTENT_204);

            await request(app)
                .post(`${auth}/logout`)
                .set('Cookie', `refreshToken=${otherRefreshToken}`)
                .expect(HTTP_STATUSES.UNAUTHORIZED_401);

            await req
                .get(`${security}/devices`)
                .expect(HTTP_STATUSES.OK_200);
        });

        it('should return device list without logged-out device after terminating another session', async () => {
            const terminatedDeviceId = randomUUID();
            const currentDeviceId = randomUUID();

            await req
                .post(`${auth}/login`)
                .send({loginOrEmail: user.login, password: user.password, deviceId: terminatedDeviceId})
                .expect(HTTP_STATUSES.OK_200);

            await req
                .post(`${auth}/login`)
                .send({loginOrEmail: user.login, password: user.password, deviceId: currentDeviceId})
                .expect(HTTP_STATUSES.OK_200);

            await req
                .delete(`${security}/devices/${terminatedDeviceId}`)
                .expect(HTTP_STATUSES.NO_CONTENT_204);

            const res = await req
                .get(`${security}/devices`)
                .expect(HTTP_STATUSES.OK_200);

            expect(res.body.some((s: {deviceId: string}) => s.deviceId === terminatedDeviceId)).toBe(false);
            expect(res.body.some((s: {deviceId: string}) => s.deviceId === currentDeviceId)).toBe(true);
        });
    });
});
