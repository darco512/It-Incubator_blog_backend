import {app} from '../src/app'
import {agent} from 'supertest'
import {UserInputType} from "../src/input-output-types/types";

export const req = agent(app)

export const users: UserInputType[] = [
    {
        login: 'loSer',
        password: '12345578',
        email: 'email2p@gg.om',
    },
    {
        login: 'log01log01',
        password: '12345578',
        email: 'emai@gg.com',
    },
    {
        login: 'log02',
        password: '12345578',
        email: 'email2p@g.com',
    },
    {
        login: 'uer15',
        password: '12345578',
        email: 'email1p@gg.cm',
    },
    {
        login: 'user02',
        password: '12345578',
        email: 'email1p@gg.com',
    },
    {
        login: 'user03',
        password: '12345578',
        email: 'email1p@gg.coi',
    },
    {
        login: 'usr-1-01',
        password: '12345578',
        email: 'email3@gg.com',
    }
]