
import {CommentType, InputCommentType, UserDBType} from "../input-output-types/types";
import {ObjectId} from "mongodb";
import {commentRepository} from "../repositories/comments-repository";


export const commentsService = {
    async findComments(postId: ObjectId) : Promise<CommentType[]> {
        const comments =  await commentRepository.findComments(postId)
        return comments.map(comment => ({
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin,
            },
            createdAt: comment.createdAt,
        }));
    },


    async findComment(_id: ObjectId) {
        const comment =  await commentRepository.findComment(_id)
        if (comment) {
            return {
                id: comment._id.toString(), // Convert ObjectId to string and rename to "id"
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin,
                },
                createdAt: comment.createdAt,
            }
        } else {
            return null; // Return null if no comment is found
        }
    },

    async createComment(postId: ObjectId, body: InputCommentType, user: UserDBType) {
        const newComment = {
            _id: new ObjectId(),
            content: body.content,
            commentatorInfo: {
                userId: user._id.toString(),
                userLogin: user.login,
            },
            createdAt: new Date().toISOString(),
        }

        return await commentRepository.createComment(postId, newComment);


    },

    async updateComment(_id: ObjectId, body: InputCommentType) {
        return await commentRepository.updateComment(_id, body)
    },

    async deleteComment(_id: ObjectId) {
        return await commentRepository.deleteBlog(_id);
    }

}