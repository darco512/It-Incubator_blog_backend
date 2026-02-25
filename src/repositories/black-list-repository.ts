import { BlackListDBType, BlackListType} from '../input-output-types/types'
import {ObjectId} from "mongodb";
import {blackListCollection} from "../db/mongo-db";

export const blackListRepository = {

    async create(entry: BlackListType) {
        const result = await blackListCollection.insertOne(entry as BlackListDBType);
        return result.insertedId
    },
    async findById(_id: ObjectId): Promise<BlackListDBType | null> {
        let token = await blackListCollection.findOne({_id})
        if (token) {
            return token
        } else {
            return null
        }
    },

    async findByToken(token: string): Promise<BlackListDBType | null> {
        return blackListCollection.findOne({ token });
    },
}
