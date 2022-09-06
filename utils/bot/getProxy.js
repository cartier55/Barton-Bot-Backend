const Proxy = require('../../models/proxyModel');
const User = require('../../models/userModel');
const mongoose = require('mongoose');
const mongoConnect = require('../db/mongoConnect');
const { decryptToken } = require('../proxy/tokenCrypt');



const getProxyConfig = async (user) =>{
    await mongoConnect(process.env.DB_PWORD)
    const {username} = user
    try {
        const user = await User.findOne({username:username}).populate('proxyConfig')
        const proxy = user?.proxyConfig  
        // console.log(proxy);
        const {encryptedToken, iv} = proxy
        const decryptedToken = decryptToken(encryptedToken, iv)
        // const {url, username} = proxy
        if(proxy) return {status:"success", username:proxy.username, url:proxy.url, token:decryptedToken}
        else return {status:"no proxy"}
    } catch (err) {
        console.log(err);
        return {status:"error"}
        
    }
}



module.exports = { getProxyConfig }