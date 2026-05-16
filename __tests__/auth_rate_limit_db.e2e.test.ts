import {req} from './test-helpers'
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/utils";
import {requestCollection, runDB} from "../src/db/mongo-db";

describe('/auth rate limit', () => {
    const auth = SETTINGS.PATH.AUTH;

    beforeAll(async () => {
        const connected = await runDB(SETTINGS.MONGO_URL);
        expect(connected).toBe(true);
    });;

    beforeEach(async () => {
        await requestCollection.deleteMany({});
    });

    async function expectEndpointRateLimited(
        path: string,
        body: Record<string, unknown> = {},
    ) {
        const responses = [];
        for (let i = 0; i < 10; i++) {
            const res = await req.post(`${auth}${path}`).send(body);
            responses.push(res);
            if (res.status === HTTP_STATUSES.RATE_LIMIT) {
                break;
            }
        }

        expect(responses[0].status).not.toBe(HTTP_STATUSES.RATE_LIMIT);
        expect(responses.some((r) => r.status === HTTP_STATUSES.RATE_LIMIT)).toBe(true);
    }

    it('should rate limit POST /login', async () => {
        await expectEndpointRateLimited('/login', {
            loginOrEmail: 'unknown@mail.com',
            password: 'wrongpass',
        });
    });

    it('should rate limit POST /registration', async () => {
        await expectEndpointRateLimited('/registration', {
            login: 'rluser01',
            password: 'qwerty12',
            email: 'rluser01@test.com',
        });
    });

    it('should rate limit POST /registration-confirmation', async () => {
        await expectEndpointRateLimited('/registration-confirmation', {
            code: '00000000-0000-0000-0000-000000000000',
        });
    });

    it('should rate limit POST /registration-email-resending', async () => {
        await expectEndpointRateLimited('/registration-email-resending', {
            email: 'nobody@test.com',
        });
    });
});
