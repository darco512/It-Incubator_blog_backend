import {app} from './app'
import {SETTINGS} from './settings'
import {runDB} from './db/mongo-db'

// Initialize database connection (for both local and serverless)
let dbInitPromise: Promise<boolean> | null = null;
const initDB = async () => {
    if (!dbInitPromise) {
        dbInitPromise = runDB(SETTINGS.MONGO_URL);
    }
    return dbInitPromise;
};

// Start DB connection immediately (non-blocking for serverless)
initDB().catch(err => console.error('DB init error:', err));

// For Vercel serverless, export the app
export default app

// For local development, start the server
if (!process.env.VERCEL) {
    const startApp = async () => {
        const res = await initDB();
        if (!res) {
            console.error('Failed to connect to database')
            process.exit(1)
        }

        app.listen(SETTINGS.PORT, () => {
            console.log('...server started in port ' + SETTINGS.PORT)
        })
    }
    startApp()
}

