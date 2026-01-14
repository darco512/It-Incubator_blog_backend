import {usersRepository} from '../repositories/users-repository'
import {InputUserType, UserDBType} from '../input-output-types/types'
import {ObjectId} from "mongodb";
import bcrypt from "bcrypt";
import {usersQueriesRepository} from "../repositories/users-queries-repository";
import {addMinutes} from 'date-fns'
import {v4 as uuidv4} from 'uuid'
import {EmailTemplatesManager} from "../application/email-templates-manager";
import {EmailAdapter} from "../application/email-adapter"
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
            emailConfirmation: {
                isConfirmed: false,
                confirmationCode: uuidv4(),
                expirationDate: addMinutes(new Date(), 3000),
            }
        }
        const createResult = usersRepository.createUser(newUser);

        const messageBody = EmailTemplatesManager.getEmailConfirmationMessage(newUser)
        await EmailAdapter.sendEmail(newUser.email, 'Email confirmation', messageBody)

        return createResult
    },

    async findUserById(_id: ObjectId): Promise<UserDBType | null> {
        return usersRepository.findUserById(_id)
    },

    async checkCredentials(loginOrEmail: string, password: string){
        let user = await usersRepository.findByLoginOrEmail(loginOrEmail);
        if(!user){ return false}
        const passwordHash = await this._generateHash(password, user.passwordSalt);
        if(user.passwordHash === passwordHash){
            return user
        }
        else {
            return false
        }

    },
    async _generateHash(password: string, salt: string){
        const hash = await bcrypt.hash(password, salt);
        return hash;
    },

    async deleteUser(_id: ObjectId){
        return await usersRepository.deleteUser(_id);
    },

    async confirmEmail(code: string, email: string): Promise<boolean> {
        let user = await usersRepository.findByLoginOrEmail(email);
        if (!user){ return false}
        if (user.emailConfirmation.confirmationCode === code && user.emailConfirmation.expirationDate > new Date()){
            return await usersRepository.updateConfirmation(user._id)
        }
        return false
    },

    async resendCode(email: string){
        let user = await usersRepository.findByLoginOrEmail(email);
        if (!user){ return false}
        if (!user.emailConfirmation.isConfirmed) {
            const messageBody = EmailTemplatesManager.getEmailConfirmationMessage(user)
            await EmailAdapter.sendEmail(user.email, 'Email confirmation', messageBody)

        }
        return false
    }
}