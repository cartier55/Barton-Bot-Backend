const User = require('../../models/userModel');
const mongoose = require('mongoose');
const mongoConnect = require('../db/mongoConnect');


const getUser = async (username) =>{
    await mongoConnect(process.env.DB_PWORD)
    const user = await User.findOne({username}).lean()
    if(user){
        return {status:'success', user:user}
    }else{
        return {status:'error', error:'Invalid Username'}
    }
    // console.log(err.code);
}


module.exports = getUser