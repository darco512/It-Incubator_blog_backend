import {UserDBType} from '../input-output-types/types'
import {ObjectId} from "mongodb";
import jwt from 'jsonwebtoken'
import {SETTINGS} from '../settings'


export const jwtService = {
    async createAccessJWT(user: UserDBType) {
        return jwt.sign({userId: user._id}, SETTINGS.JWT_SECRET, {expiresIn: '10s'})
    },

    async createRefreshJWT(user: UserDBType) {
        return jwt.sign({userId: user._id}, SETTINGS.JWT_SECRET, {expiresIn: '20s'})
    },
    async getUserByToken(token: string) {
        try {
            const result: any = jwt.verify(token, SETTINGS.JWT_SECRET)
            return new ObjectId(result.userId)
        } catch (error) {
            return null
        }    
    }, 

    async getRefreshTokenPayload(token: string) {
        try {
            const payload = jwt.verify(token, SETTINGS.JWT_SECRET)
            if (typeof payload === 'object' && payload !== null && 'userId' in payload && typeof (payload as { exp?: number }).exp === 'number') {
                return {
                    userId: new ObjectId((payload as { userId: string }).userId),
                    exp: (payload as { exp: number }).exp
                }
            }
            return null
        } catch {
            return null
        }
    }
}


