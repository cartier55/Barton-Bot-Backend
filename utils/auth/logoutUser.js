const User = require('../../models/userModel');
const mongoose = require('mongoose');
const mongoConnect = require('../db/mongoConnect');
const logoutUser = async (token) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        const user = await User.findOneAndUpdate({refreshToken:token}, {$set:{refreshToken:""}}, {new: true})
        // console.log(user);
        if(user.refreshToken === '') return {status:"success",msg:"Logged Out"}
        return {status:"error",msg:"Not Logged Out"}
    } catch (err) {
        console.log(err);
        return {status:"error",msg:"Error Logging Out"}
        
    }
    const user = await User.findOneAndUpdate({refreshToken:token}, {$set:{refreshToken:""}}, {new: true})
    // console.log(user);
    if(user.refreshToken === '') return {status:"success",msg:"Logged Out"}
    return {status:"error",msg:"Not Logged Out"}
}

module.exports = logoutUser