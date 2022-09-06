require('dotenv');
const User = require('../../models/userModel');
const mongoConnect = require('../db/mongoConnect');
const loginUser = async (username, token) =>{    
    await mongoConnect(process.env.DB_PWORD)
    const resp = await User.findOneAndUpdate({username:username}, {$set:{refreshToken:token}}, {new:true})
    if(resp.refreshToken){
        return {msg:'Logged In'}
    }else{
        return {msg:'Not Logged In'} 
    }
    // if(resp.acknowledged){
    //     return {msg:'Logged In'}
    // }else{
    //     return {msg:'Not Logged In'}
    // }
}

module.exports = loginUser