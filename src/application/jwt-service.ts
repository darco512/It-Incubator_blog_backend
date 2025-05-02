import {UserDBType} from '../input-output-types/types'
import {ObjectId} from "mongodb";
import jwt from 'jsonwebtoken'
import {SETTINGS} from '../settings'


export const jwtService = {
    async createJWT(user: UserDBType) {
        return jwt.sign({userId: user._id.toString()}, SETTINGS.JWT_SECRET, {expiresIn: '1h'})
    },

    async getUserByToken(token: string) {
        try {
            const result: any = jwt.verify(token, SETTINGS.JWT_SECRET)
            return new ObjectId(result.userId)
        } catch (error) {
            return null
        }
    }
}