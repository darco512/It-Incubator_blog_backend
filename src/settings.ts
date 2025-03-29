
import {config} from 'dotenv'
config() // добавление переменных из файла .env в process.env



export const SETTINGS = {
    // все хардкодные значения должны быть здесь, для удобства их изменения
    PORT: process.env.PORT || 5000,
    PATH: {
        BLOGS: '/blogs',
        POSTS: '/posts',
        TESTS: '/testing/all-data',
        AUTH: '/auth',
        USERS: '/users',
    },
    MONGO_URL: process.env.MONGO_URL || "mongodb://0.0.0.0:27017",
    DB_NAME: process.env.DB_NAME || "test"
}

// const x = SETTINGS.PATH.VIDEO
