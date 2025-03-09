export type OutputBlogType = {
    id: string
    name: string
    description: string
    websiteUrl: string
}

export type OutputPostType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
}

export type InputBlogType = {
    name: string
    description: string
    websiteUrl: string
}

export type InputPostType = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}
