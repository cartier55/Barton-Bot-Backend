require('dotenv').config()
const mongoose = require('mongoose')
const debug = require('debug')('app:mongoConnect')

async function mongoConnect(password){
    let db
    const dbName = process.env.DB_NAME
    try {
        db = await mongoose.connect(`mongodb+srv://teck:${password}@grayteck-cluster-0.8lrgrcc.mongodb.net/${dbName}?retryWrites=true&w=majority`)
        debug(`Connected to ${dbName}`)
        return db
    } catch (err) {
        debug(err)
    }
}

module.exports = mongoConnect