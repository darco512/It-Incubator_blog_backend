import {db} from "../db/db";



export const blogsRepository = {
    findBlogs() {
            return db.blogs
    },

    createBlog(name: string, description: string, websiteUrl: string) {
        const newBlog = {
            id: new Date().toString(),
            name: name,
            description: description,
            websiteUrl: websiteUrl,
        }
        db.blogs.push(newBlog);

        return newBlog;
    },

    findBlogById(id: string) {
        return db.blogs.find((x) => x.id === id);
    },


    updateBlog(id: string, name: string, description: string, websiteUrl: string) {
        let blog = db.blogs.find((x) => x.id === id);
        if (blog){
            blog.name = name
            blog.description = description
            blog.websiteUrl = websiteUrl;
            return true;
        } else {
            return false;
        }
    },

    deleteBlog(id: string) {
        for (let i= 0; i < db.blogs.length; i++) {
            if (db.blogs[i].id === id) {
                db.blogs.splice(i, 1);
                return true;
            }
        }
        return false;
    }

 }