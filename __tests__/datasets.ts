export const blog1 = {
    id: Date.now() + Math.random(),
    name: 'some name',
    description: 'this is the blog',
    websiteUrl: 'https://random.com',
}

export const post1 = {
    id: Date.now() + Math.random(),
    title: 'some title',
    shortDescription: "This is the post",
    content: 'Lorem Ipsum',
    blogId: blog1.id,
    blogName: blog1.name,
}

export const dataset1 = {
    blogs: [blog1],
    posts: [post1]
}