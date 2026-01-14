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

export type InputCommentType = {
    content: string
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



export type BlogDBInputType = {
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type BlogDBType = { _id: ObjectId} & BlogDBInputType;

export type PostDBInputType = {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

export type PostDBType = {
    _id: ObjectId
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    comments: CommentDBType[]
}

export type UserDBType = {
    _id: ObjectId
    login: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    createdAt: string;
    emailConfirmation : EmailConfirmationType;
}

export type InputUserType = {
    login: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    createdAt: string;
    emailConfirmation : EmailConfirmationType;
}

export type UserViewModel = {
    id: string
    login: string
    email: string
    createdAt: string
}

export type EmailConfirmationType = {
    isConfirmed: boolean
    confirmationCode: string
    expirationDate: Date
}

export type CommentType = {
    id: string
    content: string
    commentatorInfo: {
        userId: string,
        userLogin: string
    }
    createdAt: string
}


export type CommentDBInputType = {
    content: string
    commentatorInfo: {
        userId: string,
        userLogin: string
    }
    createdAt: string
}

export type CommentDBType = {
    _id: ObjectId
    content: string
    commentatorInfo: {
        userId: string,
        userLogin: string
    }
    createdAt: string
}