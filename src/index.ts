import {app} from './app'
import {SETTINGS} from './settings'
import {runDB} from './db/mongo-db'


const startApp = async () => {
    const res = await runDB(SETTINGS.MONGO_URL);
    if(!res)process.exit(1)

    app.listen(SETTINGS.PORT, () => {
        console.log('...server started in port ' + SETTINGS.PORT)
    })
}

startApp()

