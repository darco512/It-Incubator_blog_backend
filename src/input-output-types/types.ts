import {ObjectId} from "mongodb";

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


export type BlogDBType = {
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type PostDBType = {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}