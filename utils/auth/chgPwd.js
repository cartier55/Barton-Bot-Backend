const User = require('../../models/userModel');
const mongoose = require('mongoose');
const mongoConnect = require('../db/mongoConnect');
const chgPwd = async (id, newHashedPassword) =>{
    await mongoConnect(process.env.DB_PWORD)

    const resp = await User.updateOne({_id:id}, {$set:{password:newHashedPassword}})
    return resp
        // console.log(err.code);
}

module.exports = chgPwd