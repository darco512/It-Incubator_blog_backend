import {app} from './app'
import {SETTINGS} from './settings'
import {runDB} from './db/mongo-db'

// For Vercel serverless, export the app
export default app

// For local development, start the server
if (!process.env.VERCEL) {
    const startApp = async () => {
        const res = await runDB(SETTINGS.MONGO_URL);
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

