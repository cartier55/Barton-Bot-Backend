const Proxy = require('../../models/proxyModel');
const User = require('../../models/userModel');
const mongoose = require('mongoose');
const mongoConnect = require('../db/mongoConnect');
const { encryptToken } = require('./tokenCrypt');
const debug = require('debug')('app:proxyConfig');


const newProxyConfig = async (url, token, username, expUsername) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        const {encryptedToken, iv} = encryptToken(token)
        debug('[+] Creating Proxy Config...')
        const proxy = await Proxy.create({
            url,
            username,
            encryptedToken,
            iv
        })
        debug('[+] Created Proxy Config %O', proxy)
        // console.log('Created Proxy Config', proxy);
        const status = await associateProxy(proxy, expUsername)
        return {...status, ...proxy}
    } catch (err) {
        debug('[-] Error Creating Proxy Config')
        console.log(err);
        return {status:'error'}
    }
}

const associateProxy = async (proxy, username) =>{
    try {
        // const resp = await User.updateOne({username:username}, {$set:{proxyConfig:proxy}} )
        debug('[+] Associating Proxy -> User')
        const resp = await User.findOneAndUpdate({username:username}, {$set:{proxyConfig:proxy}}, {new:true}) //Returns whole document reciord
        if(resp.proxyConfig){
            debug('[+] Associated')
            return {status:"success"}
        } 
        else{
            debug('[-] Error Associating')
            return {status:"error"} 
        } 
    } catch (err) {
        debug('[-] Error Associating')
        console.log(err);
        return {status:"error"}
    }
}

const retrieveProxyConfig = async (username) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        debug('[+] Retrieving Proxy Config...')
        const user = await User.findOne({username:username}).populate('proxyConfig')
        const proxy = user?.proxyConfig        
        if(proxy){
            debug('[+] Proxy Config Retrieved')
            return {status:"success", ...proxy}
        } 
        else{
            debug('[+] No Proxy Config')
            return {status:"no proxy"}
        } 
    } catch (err) {
        debug('[-] Error Retrieving Proxy Config')
        console.log(err);
        return {status:"error"}
        
    }
}

const clearProxyConfig = async (username) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {        
        debug('[+] Removing Proxy Config...')
        const resp = await User.updateOne({username:username}, {$unset:{proxyConfig:1}}, {new:true})
        console.log(resp);
        debug('[+] Proxy Config Removed')
        
        return {status:"success"}
    } catch (err) {
        debug('[-] Error Removing Proxy Config')
        console.log(err);
        return {status:"error"}
    }

}

module.exports = { newProxyConfig, clearProxyConfig, retrieveProxyConfig }