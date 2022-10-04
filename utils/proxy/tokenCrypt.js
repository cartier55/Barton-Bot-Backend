require('dotenv')
const crypto = require('crypto');
const SECRET = process.env.SECRET
const algo ='aes-256-cbc'
const debug = require('debug')('app:tokenCrypt');

const encryptToken = (token) =>{
    debug('[+] Generating IV & Cipher')
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algo, SECRET, iv)
    debug('[+] Encrypting Token')
    let encryptedData = cipher.update(token, "utf-8", "hex")
    encryptedData += cipher.final("hex")
    debug('[+] Token Encrypted')
    debug('[+] Converting IV')
    const base64Data = Buffer.from(iv, 'binary').toString('base64')
    return {encryptedToken: encryptedData, iv:base64Data}
}


const decryptToken = (token, iv) =>{
    debug('[+] Converting IV')
    const orginalIV = Buffer.from(iv, 'base64')
    const decipher = crypto.createDecipheriv(algo, SECRET, orginalIV)
    debug('[+] Decrypting Token')
    let decryptedData = decipher.update(token, 'hex', 'utf8')
    decryptedData += decipher.final("utf8")
    debug('[+] Token Decrypted')
    return decryptedData
}

module.exports = { encryptToken, decryptToken }