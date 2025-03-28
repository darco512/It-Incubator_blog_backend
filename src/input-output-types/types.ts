import {ObjectId} from "mongodb";

export type OutputBlogType = {
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type UpdatePostType = {
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

export type UserInputType = {
    login: string
    password: string
    email: string
}

export type BlogType = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type PostType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}


export type BlogDBType = {
    _id: ObjectId
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type PostDBType = {
    _id: ObjectId
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

export type UserDBType = {
    _id: ObjectId
    login: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    createdAt: string;
}

export type InputUserType = {
    login: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    createdAt: string;
}

export type UserViewModel = {
    id: string
    login: string
    email: string
    createdAt: string
}