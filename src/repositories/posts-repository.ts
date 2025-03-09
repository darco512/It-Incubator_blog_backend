import {db} from "../db/db";


export const postsRepository = {
    findPosts() {
            return db.posts
    },

    createPost(title: string, shortDescription: string, content: string, blogId: string, blogName: string) {

        const newPost  = {
            id: new Date().toString(),
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId: blogId,
            blogName: blogName
        }
        db.posts.push(newPost);

        return newPost;
    },

    findPostById(id: string) {
        return db.posts.find((x) => x.id === id);
    },


    updatePost(id: string, title: string, shortDescription: string, content: string, blogId: string, blogName: string) {
        let post = db.posts.find((x) => x.id === id);
        if (post){
            post.title = title
            post.shortDescription = shortDescription
            post.content = content
            post.blogId = blogId
            post.blogName = blogName
            return true;
        } else {
            return false;
        }
    },

    deletePost(id: string) {
        for (let i= 0; i < db.posts.length; i++) {
            if (db.posts[i].id === id) {
                db.posts.splice(i, 1);
                return true;
            }
        }
        return false;
    }

 }