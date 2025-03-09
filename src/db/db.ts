export type DBType = { // типизация базы данных (что мы будем в ней хранить)
    blogs: any[] // VideoDBType[]
    posts: any[]
}

export const db = {
    blogs: [
        {
            "id": "123123",
            "name": "Tony",
            "description": "My personal blog",
            "websiteUrl": "https://www.tony.org/",
        },
        {
            "id": "12321",
            "name": "Tor",
            "description": "asdasfasf",
            "websiteUrl": "https://www.tor.org/",
        },
    ],
    posts: [
        {
            "id": "1231231",
            "title": "First",
            "shortDescription": "about first",
            "content": "Lorem Ipsum",
            "blogId": "12321",
            "blogName": "Tor"
        },
        {
            "id": "12312312",
            "title": "Seccond",
            "shortDescription": "about seccond",
            "content": "afgdsfhdsfgdsf",
            "blogId": "123123",
            "blogName": "Tony"
        }
    ]
}

export const setDB = (dataset?: Partial<DBType>) => {
    if (!dataset) { // если в функцию ничего не передано - то очищаем базу данных
        db.blogs = []
        db.posts = []
        return
    }

    db.blogs = dataset.blogs || db.blogs
    db.posts = dataset.posts || db.posts
}