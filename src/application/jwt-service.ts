import {UserDBType} from '../input-output-types/types'
import {ObjectId} from "mongodb";
import jwt from 'jsonwebtoken'
import {SETTINGS} from '../settings'


export const jwtService = {
    async createAccessJWT(user: UserDBType) {
        return jwt.sign({userId: user._id}, SETTINGS.JWT_SECRET, {expiresIn: '10s'})
    },

    async createRefreshJWT(user: UserDBType, deviceId: string) {
        return jwt.sign(
            {userId: user._id.toString(), deviceId},
            SETTINGS.JWT_SECRET,
            {expiresIn: '20s'},
        )
    },

    getJwtTimes(token: string): {iat: Date; exp: Date} | null {
        const d = jwt.decode(token) as {iat?: number; exp?: number} | null
        if (d?.iat === undefined || d?.exp === undefined) {
            return null
        }
        return {iat: new Date(d.iat * 1000), exp: new Date(d.exp * 1000)}
    },

    async getUserByToken(token: string) {
        try {
            const result: any = jwt.verify(token, SETTINGS.JWT_SECRET)
            return new ObjectId(result.userId)
        } catch (error) {
            return null
        }    
    }, 

    async getRefreshTokenPayload(token: string): Promise<{
        userId: ObjectId
        deviceId: string
        iat: number
        exp: number
    } | null> {
        try {
            const payload = jwt.verify(token, SETTINGS.JWT_SECRET)
            if (typeof payload !== 'object' || payload === null) {
                return null
            }
            const p = payload as {userId?: string; deviceId?: string; iat?: number; exp?: number}
            if (
                typeof p.userId !== 'string' ||
                typeof p.deviceId !== 'string' ||
                !p.deviceId.trim() ||
                typeof p.iat !== 'number' ||
                typeof p.exp !== 'number'
            ) {
                return null
            }
            return {
                userId: new ObjectId(p.userId),
                deviceId: p.deviceId.trim(),
                iat: p.iat,
                exp: p.exp,
            }
        } catch {
            return null
        }
    },
}


