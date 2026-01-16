import { Request, Response, Router } from 'express';
import { usersService} from '../domain/users-service'
import {HTTP_STATUSES, getParamId} from "../utils";
import {paginationQueries} from "../helpers/paginations-values";
import {usersQueriesRepository} from "../repositories/users-queries-repository";
import {authMiddleware} from "../middlewares/auth-middleware";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";
import {userInputsValidation} from "../input-output-types/user-input-validations";
import {objectIdValidationMiddleware} from "../middlewares/ObjectId-validation-middleware";
import {ObjectId} from "mongodb";
import {usersRepository} from "../repositories/users-repository";
import {baseAuthMiddleware} from "../middlewares/base-auth-middleware";

export const usersRouter = Router()


usersRouter.get("/",
    baseAuthMiddleware,
    async (req: Request, res: Response) => {

        const {pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm} = paginationQueries(req)

        const foundUsers = await usersQueriesRepository.findUsers({pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm})
        const usersCounts = await usersQueriesRepository.getUsersCount(searchLoginTerm, searchEmailTerm)
        const result = usersQueriesRepository.mapPaginationViewModel({usersCounts, foundUsers, pageSize, pageNumber})

        res.status(HTTP_STATUSES.OK_200).json(result)
})

usersRouter.get("/:id",
    objectIdValidationMiddleware,
    async (req: Request, res: Response) => {

        const result =  await usersRepository.findUserById(new ObjectId(getParamId(req.params.id)))
        if (!result) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        } else {
            res.status(HTTP_STATUSES.OK_200).send(result)
        }
    })


usersRouter.post('/',
    baseAuthMiddleware,
    userInputsValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        let newUserId
        try {
             newUserId = await usersService.createUser(req.body.login, req.body.email, req.body.password);
        }
        catch (errorsMessages) {
            res.status(HTTP_STATUSES.NOT_FOUND_404).json({errorsMessages})
        }
        if (newUserId){
            const newUser = await usersQueriesRepository.findUserById(newUserId!);
            res.status(HTTP_STATUSES.CREATED_201).send(newUser);
        }
    }
)

usersRouter.delete("/:id", baseAuthMiddleware, objectIdValidationMiddleware, async (req: Request, res: Response) => {
    const isDeleted = await usersService.deleteUser(new ObjectId(getParamId(req.params.id)));
    if (isDeleted) {
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } else{
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
})
