import {UserDeviceSessionViewType} from '../input-output-types/types'
import {ObjectId} from "mongodb";
import {sessionsRepository} from "../repositories/sessions-repository";

export const securityService = {
    async findSessionsByUserId(userId: ObjectId): Promise<UserDeviceSessionViewType[]> {
        return sessionsRepository.findSessionsByUserId(userId);
    },
    async deleteSessions(userId: ObjectId){
        return await sessionsRepository.deleteByUser(userId);
    },

    async deleteSession(userId: ObjectId, deviceId: string){
        const device = await sessionsRepository.findDeviceById(deviceId);
        if (!device) {
            return null;
        }
        if (device.userId.toString() !== userId.toString()) {
            return false;
        }
        
        return await sessionsRepository.deleteByUserAndDevice(userId, deviceId);
    },
}