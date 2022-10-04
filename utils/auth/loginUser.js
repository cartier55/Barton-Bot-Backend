require('dotenv');
const User = require('../../models/userModel');
const mongoConnect = require('../db/mongoConnect');
const debug = require('debug')('app:loginUser');

const loginUser = async (username, token) =>{    
    // await mongoConnect(process.env.DB_PWORD)
    debug('[+] Saving Refresh Token...')
    const resp = await User.findOneAndUpdate({username:username}, {$set:{refreshToken:token}}, {new:true})
    if(resp.refreshToken){
        debug('[+] Refresh Token Saved')
        return {msg:'Logged In'}
    }else{
        debug('[-] Refresh Token Not Saved')
        return {msg:'Not Logged In'} 
    }
    // if(resp.acknowledged){
    //     return {msg:'Logged In'}
    // }else{
    //     return {msg:'Not Logged In'}
    // }
}

module.exports = loginUser