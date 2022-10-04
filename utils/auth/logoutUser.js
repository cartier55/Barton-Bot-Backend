const User = require('../../models/userModel');
const mongoose = require('mongoose');
const mongoConnect = require('../db/mongoConnect');
const debug = require('debug')('app:logoutUser');

const logoutUser = async (token) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        debug('[+] Removing Refresh Token From DB...')
        const user = await User.findOneAndUpdate({refreshToken:token}, {$set:{refreshToken:""}}, {new: true})
        // console.log(user);
        if(user.refreshToken === ''){
            return {status:"success",msg:"Logged Out"}
        }else{
            return {status:"error",msg:"Not Logged Out"}
        } 
    } catch (err) {
        debug('[-] Error Removing Refresh Token From DB')
        console.log(err);
        return {status:"error",msg:"Error Logging Out"}
        
    }
}

module.exports = logoutUser