const jwt = require('jsonwebtoken')
const debug = require('debug')('app:ensureToken');
const ensureToken = async (req, res, next) => {
 const bearerHeader = req.headers["authorization"]
 if(typeof bearerHeader !== 'undefined') {
    debug('[+] Access Token Found')
    const bearer = bearerHeader.split(" ")
    const bearerToken = bearer[1]
    debug('[+] Verifying Token')
    jwt.verify(bearerToken, process.env.JWT_ACCESS_SECRET, (err, result) => {
        if(err) { 
            debug('[-] Invalid Token')
            res.status(403).send('Invalid Access Token')
        }else{
            debug('[+] Valid Token')
            req.user = result;        
            next() 
        }
    })
    }else{
        debug('[-] Access Token Not Found')
        res.sendStatus(401)
    }
}

module.exports = ensureToken