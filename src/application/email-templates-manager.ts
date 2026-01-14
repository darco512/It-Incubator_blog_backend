import {InputUserType, UserDBType} from '../input-output-types/types'

export class EmailTemplatesManager {
    static getEmailConfirmationMessage(user: InputUserType | UserDBType) {
        return `<div>
                    <h1>Thanks for registration</h1>
                    <p>To finish registration please follow the link below:
                        <a href='http://supersite.com?code=${user.emailConfirmation.confirmationCode}'>
                        http://supersite.com?code=${user.emailConfirmation.confirmationCode}
                        </a>
                     </p>
                </div>`
    }

}
