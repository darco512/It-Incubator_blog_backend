import {userCollection} from "../db/mongo-db";
import {UserDBType, UserViewModel} from "../input-output-types/types";
import {ObjectId, SortDirection} from "mongodb";



export const usersQueriesRepository = {
    async findUsers(dto: {
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        searchLoginTerm: string | null
        searchEmailTerm: string | null
    }): Promise<UserDBType[]> {




        const {pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm} = dto;
        const searchByLoginTerms = searchLoginTerm ? {login: {$regex: searchLoginTerm, $options: 'i'}} : {}
        const searchByEmailTerms = searchEmailTerm ? {email: {$regex: searchEmailTerm, $options: 'i'}} : {}
        const filter = { $or: [searchByLoginTerms, searchByEmailTerms] };


        return await userCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },

    async findUserById(_id: ObjectId): Promise<UserViewModel | null> {
        let user = await userCollection.findOne(_id)
        if (user) {
            return this.mapUserToViewModel(user)
        } else {
            return null
        }
    },

    async findUserByLogin(login: string): Promise<UserViewModel | null> {
        let user = await userCollection.findOne({login: login})
        if (user) {
            return this.mapUserToViewModel(user)
        } else {
            return null
        }
    },

    async findUserByEmail(email: string): Promise<UserViewModel | null> {
        let user = await userCollection.findOne({email: email})
        if (user) {
            return this.mapUserToViewModel(user)
        } else {
            return null
        }
    },

    async getUsersCount(searchLoginTerm: string | null, searchEmailTerm: string | null): Promise<number> {

        const searchByLoginTerms = searchLoginTerm ? {login: {$regex: searchLoginTerm, $options: 'i'}} : {}
        const searchByEmailTerms = searchEmailTerm ? {email: {$regex: searchEmailTerm, $options: 'i'}} : {}
        const filter = { $or: [searchByLoginTerms, searchByEmailTerms] };
        return userCollection.countDocuments(filter)
    },

    mapUserToViewModel(user: UserDBType) {
        return {
            id: user._id.toString(), // Convert ObjectId to string and rename to "id"
            login: user.login,
            email: user.email,
            createdAt: user.createdAt,
        }
    },

    mapPaginationViewModel(dto: {
        usersCounts: number,
        foundUsers: UserDBType[],
        pageSize: number,
        pageNumber: number
    }) {
        return {
            pagesCount: Math.ceil(dto.usersCounts / dto.pageSize),
            page: dto.pageNumber,
            pageSize: dto.pageSize,
            totalCount: dto.usersCounts,
            items: dto.foundUsers.map(this.mapUserToViewModel)
        }
    }
}