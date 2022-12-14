const User = require('../../models/userModel');
const mongoConnect = require('../db/mongoConnect');
const { decryptToken } = require('./tokenCrypt');
const debug = require('debug')('app:tokenCrypt');



const getProxyConfig = async (user) =>{
    await mongoConnect(process.env.DB_PWORD)
    const {username} = user
    try {
        debug('[+] Retriving Proxy Config...')
        const user = await User.findOne({username:username}).populate('proxyConfig')
        const proxy = user?.proxyConfig  
        if (proxy){
            debug('[+] Retrived Proxy')
            const {encryptedToken, iv} = proxy
            debug('[+] Decrypting Proxy Token...')
            const decryptedToken = decryptToken(encryptedToken, iv)
            return {status:"success", username:proxy.username, url:proxy.url, token:decryptedToken}
        }
        else return {status:"no proxy"}
    } catch (err) {
        console.log(err);
        return {status:"error"}
        
    }
}



module.exports = { getProxyConfig }