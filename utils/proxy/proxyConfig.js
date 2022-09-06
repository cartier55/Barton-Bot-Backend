const Proxy = require('../../models/proxyModel');
const User = require('../../models/userModel');
const mongoose = require('mongoose');
const mongoConnect = require('../db/mongoConnect');
const { encryptToken } = require('./tokenCrypt');
const newProxyConfig = async (url, token, username, expUsername) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        const {encryptedToken, iv} = encryptToken(token)
        const proxy = await Proxy.create({
            url,
            username,
            encryptedToken,
            iv
        })
        console.log('Created Proxy Config', proxy);
        const status = await associateProxy(proxy, expUsername)
        return {...status, ...proxy}
    } catch (err) {
        console.log(err);
        return {status:'error'}
    }
}

const associateProxy = async (proxy, username) =>{
    try {
        // const resp = await User.updateOne({username:username}, {$set:{proxyConfig:proxy}} )
        const resp = await User.findOneAndUpdate({username:username}, {$set:{proxyConfig:proxy}}, {new:true}) //Returns whole document reciord
        if(resp.proxyConfig) return {status:"success"}
        else return {status:"error"} 
    } catch (err) {
        console.log(err);
        return {status:"error"}
    }
}

const retrieveProxyConfig = async (username) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        const user = await User.findOne({username:username}).populate('proxyConfig')
        const proxy = user?.proxyConfig        
        if(proxy) return {status:"success", ...proxy}
        else return {status:"no proxy"}
    } catch (err) {
        console.log(err);
        return {status:"error"}
        
    }
}

const clearProxyConfig = async (username) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {        
        const resp = await User.updateOne({username:username}, {$unset:{proxyConfig:1}}, {new:true})
        console.log(resp);
        
        return {status:"success"}
    } catch (err) {
        console.log(err);
        return {status:"error"}
    }

}

module.exports = { newProxyConfig, clearProxyConfig, retrieveProxyConfig }