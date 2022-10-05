require('dotenv').config()
const mongoose = require('mongoose')
const debug = require('debug')('app:mongoConnect')

async function mongoConnect(){
    let db
    const password = process.env.DB_PWORD
    const dbName = process.env.DB_NAME
    try {
        debug(`[+] Connecting to DB...`)
        db = await mongoose.connect(`mongodb+srv://teck:${password}@grayteck-cluster-0.8lrgrcc.mongodb.net/${dbName}?retryWrites=true&w=majority`)
        // db = await mongoose.connect(`mongodb://127.0.0.1:27017/barton-bot-db`)
        // debug(`Connected to ${dbName}`)
        debug(`[+] Connected to Baton-Bot-DB`)
        // console.log('connected')
        return db
    } catch (err) {
        debug(err)
        console.log(err)
    }
}
// (async ()=>{
//     console.log('test')
//     await mongoConnect()

// })()


module.exports = mongoConnect