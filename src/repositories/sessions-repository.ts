import {ObjectId} from "mongodb";
import {sessionsCollection} from "../db/mongo-db";
import {SessionDBInputType, UserDeviceSessionViewType, SessionDBType} from "../input-output-types/types";

export const sessionsRepository = {
    async upsertByUserAndDevice(data: SessionDBInputType): Promise<void> {
        await sessionsCollection.updateOne(
            {userId: data.userId, deviceId: data.deviceId},
            {$set: data},
            {upsert: true},
        );
    },

    async findActiveSession(
        userId: ObjectId,
        deviceId: string,
        iatSeconds: number,
    ): Promise<SessionDBType | null> {
        const iatDate = new Date(iatSeconds * 1000);
        return sessionsCollection.findOne({userId, deviceId, iat: iatDate});
    },

    async findSessionsByUserId(userId: ObjectId): Promise<UserDeviceSessionViewType[]> {
        const docs = await sessionsCollection
            .find({userId}, {projection: {ip: 1, deviceName: 1, iat: 1, deviceId: 1, _id: 0}})
            .toArray();
        return docs.map((s) => ({
            ip: s.ip,
            title: s.deviceName,
            lastActiveDate: (s.iat instanceof Date ? s.iat : new Date(s.iat)).toISOString(),
            deviceId: s.deviceId,
        }));
    },

    async bumpSessionAfterRefresh(
        userId: ObjectId,
        deviceId: string,
        oldIatSeconds: number,
        ip: string,
        newIat: Date,
        newExp: Date,
    ): Promise<boolean> {
        const oldIatDate = new Date(oldIatSeconds * 1000);
        const r = await sessionsCollection.updateOne(
            {userId, deviceId, iat: oldIatDate},
            {$set: {ip, iat: newIat, exp: newExp}},
        );
        return r.matchedCount > 0;
    },

    async deleteByUserAndDevice(
        userId: ObjectId,
        deviceId: string,
        iatSeconds?: number,
    ): Promise<void> {
        const filter: {userId: ObjectId; deviceId: string; iat?: Date} = {userId, deviceId}
        if (iatSeconds !== undefined) {
            filter.iat = new Date(iatSeconds * 1000)
        }
        await sessionsCollection.deleteOne(filter);
    },

    async deleteByUser(userId: ObjectId): Promise<void> {
        await sessionsCollection.deleteMany({userId});
    },

    async deleteOtherSessions(userId: ObjectId, currentDeviceId: string): Promise<void> {
        await sessionsCollection.deleteMany({userId, deviceId: {$ne: currentDeviceId}});
    },

    async deleteExpiredSessions(now: Date = new Date()): Promise<number> {
        const r = await sessionsCollection.deleteMany({exp: {$lt: now}});
        return r.deletedCount ?? 0;
    },

    async findDeviceById(deviceId: string): Promise<SessionDBType | null> {
        return await sessionsCollection.findOne({deviceId});
    },
};
