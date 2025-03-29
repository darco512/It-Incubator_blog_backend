import {usersRepository} from '../repositories/users-repository'
import {InputUserType, UserDBType} from '../input-output-types/types'
import {ObjectId} from "mongodb";
import bcrypt from "bcrypt";
import {usersQueriesRepository} from "../repositories/users-queries-repository";


export const usersService = {
    async createUser(login: string, email: string, password: string) {
            let errorsMessages;
        if (await usersQueriesRepository.findUserByLogin(login)) {
            throw errorsMessages = [{
                    "message": "Login already taken",
                    "field": "login",
                }]
        }

        if (await usersQueriesRepository.findUserByEmail(email)) {
            throw errorsMessages = [{
                "message": "Email already have been used",
                "field": "email",
            }]
        }


        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await this._generateHash(password, passwordSalt);

        const newUser: InputUserType = {
            login,
            email,
            passwordHash,
            passwordSalt,
            createdAt: new Date().toISOString(),
        }
        return usersRepository.createUser(newUser)
    },

    async findUserById(id: ObjectId): Promise<UserDBType | null> {
        return usersRepository.findUserById(id)
    },

    async checkCredentials(loginOrEmail: string, password: string){
        const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
        if(!user){ return false}
        const passwordHash = await this._generateHash(password, user.passwordSalt);
        return user.passwordHash === passwordHash;

    },
    async _generateHash(password: string, salt: string){
        const hash = await bcrypt.hash(password, salt);
        return hash;
    },

    async deleteUser(_id: ObjectId){
        return await usersRepository.deleteUser(_id);
    }
}