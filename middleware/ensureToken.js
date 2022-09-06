const jwt = require('jsonwebtoken')
const ensureToken = async (req, res, next) => {
 const bearerHeader = req.headers["authorization"]
 if(typeof bearerHeader !== 'undefined') {
  const bearer = bearerHeader.split(" ")
  const bearerToken = bearer[1]
  jwt.verify(bearerToken, process.env.JWT_ACCESS_SECRET, (err, result) => {
    if(err) { 
        // res.status(403).json({msg:'Invalid Access Token'})
        res.status(403).send('Invalid Access Token')
    }else{
        req.user = result;        
        next() 
    }
})
}else{
    res.sendStatus(401)
   }
}

module.exports = ensureToken