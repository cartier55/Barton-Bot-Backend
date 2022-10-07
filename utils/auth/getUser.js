const User = require('../../models/userModel');
const mongoConnect = require('../db/mongoConnect');
const debug = require('debug')('app:getUser');


const getUser = async (username) =>{
    await mongoConnect(process.env.DB_PWORD)
    debug('[+] Finding User...')
    const user = await User.findOne({username}).lean()
    if(user){
        debug('[+] User Found')
        return {status:'success', user:user}
    }else{
        debug('[-] User Not Found')
        return {status:'error', error:'Invalid Username'}
    }
}


module.exports = getUser