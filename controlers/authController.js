require('dotenv')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const newUser = require('../utils/auth/createUser');
const getUser = require('../utils/auth/getUser');
const chgPwd = require('../utils/auth/chgPwd');
const loginUser = require('../utils/auth/loginUser');
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const ms = require('ms'); 
const logoutUser = require('../utils/auth/logoutUser');
const debug = require('debug')('app:authController');


const signUp = async (req, res) => {
    const {username, password} = req.body
    debug('[+] Hashing Password...')
    const hashedPassword = await bcrypt.hash(password, 10)
    debug('[+] Password Hashed')
    // console.log(username, password, hashedPassword)
    debug(`[+] Creating ${username}`)
    const resp = await newUser(username, hashedPassword)
    if(resp.code == 11000){
        debug('[-] Duplicate User Error')
        return res.status(409).json({error:"User Not Unique"})
    }
    debug('[+] Successful Register')
    return res.status(200).json({msg:"Registered"})
    
}


const logIn = async (req,res)=>{
    const {username, password} = req.body
    
    const resp = await getUser(username)
    if (resp.status == 'success'){
        debug('[+] Verifying Password')
        if(await bcrypt.compare(password, resp.user.password)){
            debug('[+] Valid Password')
            debug('[+] Signing Tokens...')
            const accessToken = jwt.sign({id:resp.user._id, username:resp.user.username}, JWT_ACCESS_SECRET, {expiresIn:'15m'})
            const refreshToken = jwt.sign({id:resp.user._id, username:resp.user.username}, JWT_REFRESH_SECRET, {expiresIn:'15m'})
            debug('[+] Tokens Signed')
            res.cookie('jwt', refreshToken, {httpOnly:true, maxAge:ms('1d')})
            const msg = await loginUser(username, refreshToken)
            debug('[+] User Logged In')
            res.status(200).json({...msg, accessToken:accessToken})
        }else{
            debug('[-] Invalid Password')
            res.status(403).json({status:'error', error:'Invalid username/password'})
        }
    }else{
        debug(`[-] ${resp.error}`)
        res.status(403).json({status:'error', error:'Invalid username/password'})
    }

}

const logOut = async (req,res)=>{
    const cookies = req.cookies
    if(!cookies?.jwt) {
        debug('[+] Refresh Token Cookie Gone')
        return res.send({status:"success"})
    }
    const refreshToken = cookies.jwt
    res.clearCookie('jwt', {httpOnly:true, maxAge:ms('1d')})
    debug('[+] Refresh Token Cookie Removed')
    const resp = await logoutUser(refreshToken)
    if(resp.status === "success") {
        debug('[+] Refresh Token Removed')
        return res.status(204).send({msg:resp.msg})
    }
    debug('[+] Refresh Token Not Removed')
    return res.status(400).send({msg:resp.msg})
}

const changePwd = async (req,res)=>{
    const {password, token} = req.body
    try {
        const user = jwt.verify(token, JWT_SECRET)
        const hashedPassword = await bcrypt.hash(password, 10)
        const resp = await chgPwd(user.id, hashedPassword)
        // const resp = await User.updateOne({_id:user.id}, {password:hashedPassword})
        // console.log(resp);
        res.send(resp)
    } catch (err) {
        console.log(err);
        res.send({status:"error"})
        
    }
}

const refreshToken = async (req,res)=>{
    const cookies = req.cookies
    if(!cookies?.jwt){
        // console.log('error f');
        debug('[-] No JWT Refresh Token')
        return res.status(400).send({msg:'No Jwt Cookie'})
    } 
    const refreshToken = cookies.jwt
    debug('[+] Verifying Refresh Token...')
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded)=>{
        if(err){
            debug('[-] Invalid Token')
            return res.status(400).send({msg:"Invalid Refresh Token"})
        } 
        debug('[+] Valid Token')
        const accessToken = jwt.sign({username:decoded.username}, process.env.JWT_ACCESS_SECRET, {expiresIn:'30s'})
        debug('[+] Access Token Refreshed')
        return res.status(200).send({msg:'success', accessToken:accessToken})
    })
}


module.exports = {signUp, logIn, logOut, changePwd, refreshToken}