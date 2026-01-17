import {usersRepository} from '../repositories/users-repository'
import {InputUserType} from '../input-output-types/types'
import bcrypt from "bcrypt";
import {usersQueriesRepository} from "../repositories/users-queries-repository";
import {addMinutes} from 'date-fns'
import {randomUUID} from 'node:crypto'
import {EmailTemplatesManager} from "../application/email-templates-manager";
import {EmailAdapter} from "../application/email-adapter";

export const authService = {
    async createUser(login: string, email: string, password: string) {
        if (await usersQueriesRepository.findUserByLogin(login)) {
            return null
        }

        if (await usersQueriesRepository.findUserByEmail(email)) {
            return null
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
                confirmationCode: randomUUID(),
                expirationDate: addMinutes(new Date(), 3000),
            }
        }
        const createResult = await usersRepository.createUser(newUser);

        const messageBody = EmailTemplatesManager.getEmailConfirmationMessage(newUser)
        await EmailAdapter.sendEmail(newUser.email, 'Email confirmation', messageBody)

        return createResult
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