const User = require('../../models/userModel');
const mongoose = require('mongoose');
const mongoConnect = require('../db/mongoConnect');
const newUser = async (username, password) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        const resp = await User.create({
            username,
            password
        })
        console.log('Created', resp);
        return {status:"success"}
    } catch (err) {
        console.log(err);
        return {status:'error', code:err.code, error:'Username already in use'}
    }
}

module.exports = newUser