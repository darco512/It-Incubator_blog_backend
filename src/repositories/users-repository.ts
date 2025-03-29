import {InputUserType, UserDBType} from '../input-output-types/types'
import {ObjectId} from "mongodb";
import {userCollection} from "../db/mongo-db";

export const usersRepository = {
    async getAllUsers(): Promise<UserDBType[]> {
        return userCollection
            .find()
            .sort( 'createdAt', -1)
            .toArray()
    },
    async createUser(user: any){
        const result = await userCollection.insertOne(user);
        return result.insertedId
    },
    async findUserById(id: ObjectId): Promise<UserDBType | null> {
        let product = await userCollection.findOne(id)
        if (product) {
            return product
        } else {
            return null
        }
    },
    async findByLoginOrEmail(loginOrEmail: string) {
        const user = await userCollection.findOne({$or: [{ email: loginOrEmail }, {userName: loginOrEmail } ] } )
        return user
    },

    async deleteUser(_id: ObjectId){
        const res = await userCollection.deleteOne({_id})
        return res.deletedCount === 1
    }
}
