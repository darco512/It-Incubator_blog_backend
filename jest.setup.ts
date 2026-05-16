import {requestCollection, runDB} from './src/db/mongo-db';
import {SETTINGS} from './src/settings';

beforeAll(async () => {
    const connected = await runDB(SETTINGS.MONGO_URL);
    if (!connected) {
        throw new Error('Database connection failed');
    }
});

beforeEach(async () => {
    await requestCollection.deleteMany({});
});
