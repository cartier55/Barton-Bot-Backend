require('dotenv')
const crypto = require('crypto');
const SECRET = process.env.SECRET
const algo ='aes-256-cbc'

const encryptToken = (token) =>{
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algo, SECRET, iv)
    let encryptedData = cipher.update(token, "utf-8", "hex")
    encryptedData += cipher.final("hex")
    const base64Data = Buffer.from(iv, 'binary').toString('base64')
    return {encryptedToken: encryptedData, iv:base64Data}
}


const decryptToken = (token, iv) =>{
    const orginalIV = Buffer.from(iv, 'base64')
    const decipher = crypto.createDecipheriv(algo, SECRET, orginalIV)
    let decryptedData = decipher.update(token, 'hex', 'utf8')
    decryptedData += decipher.final("utf8")
    return decryptedData
}

module.exports = { encryptToken, decryptToken }