const User = require('../../models/userModel');
const mongoConnect = require('../db/mongoConnect');
const debug = require('debug')('app:createUser');

const newUser = async (username, password) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        debug('[+] Creating User...')
        const resp = await User.create({
            username,
            password
        })
        debug('[+] Created %O', resp)
        return {status:"success"}
    } catch (err) {
        debug('[-] Error Creating User')
        console.log(err);
        return {status:'error', code:err.code, error:'Username already in use'}
    }
}

module.exports = newUser