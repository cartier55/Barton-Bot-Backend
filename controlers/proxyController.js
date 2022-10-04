require('dotenv')
const bcrypt = require('bcrypt');
const ms = require('ms'); 
const getUser = require('../utils/auth/getUser');
const {newProxyConfig, clearProxyConfig, retrieveProxyConfig} = require('../utils/proxy/proxyConfig');
const debug = require('debug')('app:proxyController');

const proxy = async (req, res) => {
    const {proxyUrl, proxyToken, proxyUsername} = req.body
    const {username} = req.user
    // console.log(req.body)
    // console.log(proxyUrl, proxyToken, user);
    const resp = await newProxyConfig(proxyUrl, proxyToken, proxyUsername, username)
    if(resp.status == 'success') {
        debug("[+] Proxy Config Saved")
        return res.status(200).send({msg: "Proxy Configuration Saved", ...resp.proxy})
    }else{
        debug("[-] Error Saving Configs")
        return res.status(500).send({error: "Proxy Configuration Not Saved"})
    }
    // const hashedPassword = await bcrypt.hash(password, 10)
    // console.log(username, password, hashedPassword)
    // const resp = await newUser(username, hashedPassword)
    // if(resp.code == 11000){
        // debug('[-] Duplicate User Error')
        // return res.status(409).json({error:"User Not Unique"})
    // }
    // debug('[+] Successful Register')
    // return res.status(200).json({msg:"Registered"})
    return res.status(200)
    
}

const retrieve = async (req,res)=>{
    const {username} = req.user
    const resp = await retrieveProxyConfig(username)
    
    if(resp.status == "success"){
        debug('[+] Sucessful Retrieval')
        return res.status(200).json({proxyConfig:resp._doc})
    } 
    if(resp.status == "no proxy"){
        debug('[+] Successful Retrieval')
        res.sendStatus(404)
        
    } 
    if(resp.status == "error"){
        debug('[+] Retrieval Error')
        res.sendStatus(500)

    } 
    
}

const clear = async (req,res)=>{
    const {username} = req.user
    const resp = await clearProxyConfig(username)
    if (resp.status == "success"){
        debug('[+] Removed Successfully')
        return res.status(200).json({msg:"Proxy Configuration Cleared"})
    }else{
        debug('[-] Error Removing')
        return res.status(500).json({msg:"Proxy Configuration Not Cleared"})
    }
}


module.exports = { proxy, clear, retrieve }