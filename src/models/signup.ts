import superagent from 'superagent'

import { userSvcAuthority, UserSvcPing } from 'authorities'

import { User } from 'entities/user'

export class SignupModel {
    /**
     * create a new user, including its inventory, cosmetics, loadouts and buy menu
     * @param username the new user's name
     * @param playername the new user's ingame player name
     * @param password the new user's password
     * @returns the new user's ID if created, null if not
     */
    public static async createUser(username: string, playername: string, password: string): Promise<number> {
        if (UserSvcPing.isAlive() === false) {
            return null
        }

        const userId: number = await User.create(username, playername, password)

        if (userId == null) {
            return null
        }

        const results: boolean[] = await Promise.all([
            this.createInventory(userId),
            this.createCosmetics(userId),
            this.createLoadouts(userId),
            this.createBuymenu(userId),
        ])

        for (const r of results) {
            if (r === false) {
                return null
            }
        }

        return userId
    }

    /**
     * create a new user
     * @param username the new user's name
     * @param playername the new user's ingame player name
     * @param password the new user's password
     * @returns the new user's ID if created, null if not
     */
    private static async createUserInternal(username: string, playername: string, password: string): Promise<number> {
        const res: superagent.Response = await superagent
            .post('http://' + userSvcAuthority() + '/users/')
            .send({
                username,
                playername,
                password,
            })
            .accept('json')

        if (res.status === 201) {
            return res.body.userId
        }

        return null
    }

    /**
     * create a new inventory for an user
     * @param userId the new owner's user ID
     * @returns true if successful, false if not
     */
    private static async createInventory(userId: number): Promise<boolean> {
        const res: superagent.Response = await superagent
            .post('http://' + userSvcAuthority() + '/inventory/' + userId)
            .accept('json')
        return res.status === 201
    }

    /**
     * create new cosmetic slots for an user
     * @param userId the new owner's user ID
     * @returns true if successful, false if not
     */
    private static async createCosmetics(userId: number): Promise<boolean> {
        const res: superagent.Response = await superagent
            .post('http://' + userSvcAuthority() + '/inventory/' + userId + '/cosmetics')
            .accept('json')
        return res.status === 201
    }

    /**
     * create new loadouts for an user
     * @param userId the new owner's user ID
     * @returns true if successful, false if not
     */
    private static async createLoadouts(userId: number): Promise<boolean> {
        const res: superagent.Response = await superagent
            .post('http://' + userSvcAuthority() + '/inventory/' + userId + '/loadout')
            .accept('json')
        return res.status === 201
    }

    /**
     * create new buy menu slots for an user
     * @param userId the new owner's user ID
     * @returns true if successful, false if not
     */
    private static async createBuymenu(userId: number): Promise<boolean> {
        const res: superagent.Response = await superagent
            .post('http://' + userSvcAuthority() + '/inventory/' + userId + '/buymenu')
            .accept('json')
        return res.status === 201
    }
}
