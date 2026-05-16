import {config} from 'dotenv'
config() // Ð´Ð¾Ð±Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ Ð¿ÐµÑ€ÐµÐ¼ÐµÐ½Ð½Ñ‹Ñ… Ð¸Ð· Ñ„Ð°Ð¹Ð»Ð° .env Ð² process.env

export const SETTINGS = {
    // Ð²ÑÐµ Ñ…Ð°Ñ€Ð´ÐºÐ¾Ð´Ð½Ñ‹Ðµ Ð·Ð½Ð°Ñ‡ÐµÐ½Ð¸Ñ Ð´Ð¾Ð»Ð¶Ð½Ñ‹ Ð±Ñ‹Ñ‚ÑŒ Ð·Ð´ÐµÑÑŒ, Ð´Ð»Ñ ÑƒÐ´Ð¾Ð±ÑÑ‚Ð²Ð° Ð¸Ñ… Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ
    PORT: process.env.PORT || 5000,
    PATH: {
        BLOGS: '/blogs',
        POSTS: '/posts',
        TESTS: '/testing/all-data',
        AUTH: '/auth',
        SECURITY: '/security',
        USERS: '/users',
        COMMENTS: '/comments',
        RAQUESTS: '/requests',
        SESSIONS: '/sessions'
    },
    MONGO_URL: process.env.MONGO_URL || "mongodb://0.0.0.0:27017",
    DB_NAME: process.env.DB_NAME || "test",
    JWT_SECRET: process.env.JWT_SECRET || "123",
    RATE_LIMIT_MAX_REQUESTS: 5,
    RATE_LIMIT_WINDOW_MS: 10_000,
    DEFAULT_DEVICE_TITLE: "Unknown device",
}

// const x = SETTINGS.PATH.VIDEO
