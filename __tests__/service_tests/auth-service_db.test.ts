import {authService} from "../../src/domain/auth-service";
import {usersRepository} from "../../src/repositories/users-repository";
import {EmailAdapter} from "../../src/application/email-adapter";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {addMinutes} from "date-fns";
import {ObjectId} from "mongodb";
import {userCollection, initCollectionsFromMongoose} from "../../src/db/mongo-db";
import {randomUUID} from "node:crypto";

describe("integration tests for AuthService", () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoose.set('strictQuery', false);
        
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri);
        
        initCollectionsFromMongoose(mongoose.connection);

        jest.spyOn(EmailAdapter, 'sendEmail').mockResolvedValue(undefined);
    });

    afterAll(async () => {
        // Clean up
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        if (mongoServer) {
            await mongoServer.stop();
        }
        jest.restoreAllMocks();
    });

    beforeEach(async () => {
        // Clean database before each test using userCollection
        await userCollection.deleteMany({});
        // Reset mock calls
        jest.clearAllMocks();
    });

    describe("createUser",() => {
        let userSmtpEmail = "smtp@dimych.com"
        let userSmtpLogin = "smtp"
        let correctUserEmail = "dimych@dimych.com"
        let correctUserLogin = "dymyich"
        let busyUserEmail = correctUserEmail
        let busyUserLogin = correctUserLogin
        let password = "123"

        it("this.emailAdapter.sendEmail should be called", async () => {
            await authService.createUser(userSmtpLogin, userSmtpEmail, password)
            expect(EmailAdapter.sendEmail).toHaveBeenCalled()
        })
        it("should return correct created user", async () => {
           let email = correctUserEmail;
           let login = correctUserLogin;
           const id = await authService.createUser(login, email, password)

            const result = await usersRepository.findUserById(id!)


           expect(result!.email).toBe(email)
           expect(result!.login).toEqual(login)
           expect(result!.emailConfirmation.isConfirmed).toBe(false)
       })
        it("should return null because duplicated email", async () => {
            // First create a user with the email that will be duplicated
            await authService.createUser(busyUserLogin, busyUserEmail, password)
            
            // Try to create another user with the same email
            const result = await authService.createUser(randomUUID(), busyUserEmail, password)

            expect(result).toBe(null)
        })
        it("should return null because duplicated login", async () => {
            // First create a user with the login that will be duplicated
            await authService.createUser(busyUserLogin, busyUserEmail, password)
            
            // Try to create another user with the same login
            const result = await authService.createUser(busyUserLogin, randomUUID(), password)

            expect(result).toBe(null)
        })
    })

    describe("confirmEmail",() => {
        const createUser = (confirmationCode: string, expirationDate: Date, email: string ) => {
            return {
                _id: new ObjectId(),
                email: email,
                login: "",
                passwordHash: "",
                passwordSalt: "",
                createdAt: '',
                emailConfirmation: {
                    isConfirmed: false,
                    confirmationCode: confirmationCode,
                    expirationDate: expirationDate,
                },
            }
        }


        it("should return false for expired confirmation code", async () => {
            let user = createUser("supercode", addMinutes(new Date(), -1), "email@email.email");
            await userCollection.insertOne(user)

            const result = await authService.confirmEmail("supercode", "email@email.email")
            const userModel = await userCollection.findOne({_id: user._id})

            expect(result).toBe(false)
            expect(userModel!.emailConfirmation.isConfirmed).toBeFalsy()
        })
        it("should return false for not existed confirmation code", async () => {
            let user = createUser(randomUUID(), addMinutes(new Date(), 60), randomUUID());
            await userCollection.insertOne(user)

            const spy = jest.spyOn(usersRepository, "updateConfirmation")
            const result = await authService.confirmEmail(user.emailConfirmation.confirmationCode + "trash",
                user.email)

            expect(result).toBe(false)
            expect(spy).not.toHaveBeenCalled()
        })

        it("should return true for existed and not expired confirmation code", async () => {
            let user = createUser("goodcode", addMinutes(new Date(), 60), "emailforgoodcode@email.email");
            await userCollection.insertOne(user)

            const result = await authService.confirmEmail("goodcode", "emailforgoodcode@email.email")
            const userModel = await userCollection.findOne({_id: user._id})

            expect(result).toBeTruthy()
            expect(userModel!.emailConfirmation.isConfirmed).toBeTruthy()
        })
    })

})