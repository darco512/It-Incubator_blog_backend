import {postCollection} from "../db/mongo-db";
import {
    CommentDBType,
    InputCommentType,
} from "../input-output-types/types";
import {ObjectId} from "mongodb";



export const commentRepository = {
    async findComments(postId: ObjectId) : Promise<CommentDBType[]> {
        const postComments = await postCollection.find(
            { _id: postId },
            { projection: { comments: 1 } }
        ).toArray();

        return postComments[0].comments || []
    },


    async findComment(_id: ObjectId) {

        const result = await postCollection.aggregate([
            { $unwind: "$comments" },
            { $match: { "comments._id": _id } },
            { $limit: 1},
            { $replaceRoot: {newRoot: "$comments"} }
        ]).toArray()

        return  result[0] || null
    },

    async createComment(postId: ObjectId, newComment: CommentDBType) {



        const res = await postCollection.updateOne({_id: postId}, {$push: {comments: newComment}});

        return newComment._id
    },


    async updateComment(_id: ObjectId, body: InputCommentType) {

        const res = await postCollection.updateOne(
            { "comments._id": _id },
            { $set: { "comments.$[elem].content": body.content } },
            { arrayFilters: [{ "elem._id": _id }] }
        )
        return res.matchedCount === 1;
    },

    async deleteBlog(_id: ObjectId) {


        const result = await postCollection.updateOne(
            { "comments._id": _id },
            { $pull: { comments: { _id: _id } } }
        );
        return result.modifiedCount > 0
    }

}