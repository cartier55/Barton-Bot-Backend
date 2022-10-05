const PendingJob = require('../../models/pendingJobModel');
const CompletedJob = require('../../models/completedJobModel');
const mongoConnect = require('../db/mongoConnect');
const { encryptToken, decryptToken } = require('../proxy/tokenCrypt');
const { testJobsDate } = require('../cron/testDate');
const { getProxyConfig } = require('../proxy/getProxy');
const { startBot } = require('./bot');
const debug = require('debug')('app:botJobActions');

const newJob = async (date, startTime, endTime, courseList, member, clubUsername, clubPassword, proxy, botStartDate, botStartTime, username) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        debug('[+] Encrypting ClubPassword...')
        const {encryptedToken, iv} = encryptToken(clubPassword)
        debug('[+] Creating Pending Job...')
        const job = await PendingJob.create({
            date,
            startTime,
            endTime,
            courseList,
            member,
            clubUsername,
            clubPassword:{token:encryptedToken, iv:iv},
            proxy,
            botStartDate,
            botStartTime,
            user:username
        })
        debug('[+] Created %O', job);
        return {status:"success"}
    } catch (err) {
        debug('[-] Error Creating Job')
        console.log(err);
        return {status:'error', code:err.code, error:'Job already created for date'}
    }
}


const getUserJobs = async (username) =>{
// const getUserJobs = async () =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        debug('[+] Retriving Jobs...')
        const pendingJobs = await PendingJob.find({user:username})
        const completedJobs= await CompletedJob.find({user:username})
        
        // const resp = await User.findOne({username:username}).populate(['pendingJobs', 'completedJobs'])
        // const {pendingJobs, completedJobs} = resp 
        if (pendingJobs || completedJobs){
            debug('[+] Jobs Retrived')
            return {status:"success", pendingJobs:pendingJobs, completedJobs:completedJobs}
        } 
        // if (pendingJobs) return {status:"success", pendingJobs:pendingJobs, completedJobs:completedJobs}
        else{
            debug('[-] Error Retriving Jobs')
            return {status:"error"}
        } 
        // console.log(pendingJobs)
        // return
    } catch (err) {
        debug('[-] Error Retriving Jobs')
        console.log(err);
        return {status:"error",}
        
    }
}

const updateUserJob = async (id, update) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        // delete update['clubPassword']
        debug('[+] Encrypting ClubPassword...')
        const {encryptedToken, iv} = encryptToken(update.clubPassword)
        update['clubPassword'] = {token:encryptedToken, iv:iv}
        debug('[+] Updating Job...')
        const resp = await PendingJob.findByIdAndUpdate(id, update)
        // console.log(resp);
        
        if (resp._id){
            debug('[+] Job Updated')
            return {status:"success", msg:`Job Updated`}
        } 
        else{
            debug('[-] Error Updating Job')
            return {status:"error"}
        } 
        
    } catch (err) {
        debug('[-] Error Updating Job')
        console.log(err);
        return {status:"error",}
        
    }
}

const destroyUserPendingJob = async (id) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        debug('[+] Deleting Pending Job...')
        const removedJob = await PendingJob.findByIdAndDelete(id)
        // console.log(removedJob)       
        if(removedJob){
            debug('[+] Job Deleted')
            return {status:"success", msg: "Job Deleted"}
        } 
        else{
            debug('[-] Error Deleting Job')
            return {status:"error"}
        } 
    } catch (err) {
        debug('[-] Error Deleting Job')
        console.log('err');
        return {status:"error",}
        
    }
}

const destroyUserCompletedJob = async (id) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        debug('[+] Deleting Completed Job...')
        const removedJob = await CompletedJob.findByIdAndDelete(id)
        // console.log(removedJob)
        if(removedJob){
            debug('[+] Job Deleted')
            return {status:"success", msg: "Job Deleted"}
        } 
        else{
            debug('[-] Error Deleting Job')
            return {status:"error"}
        } 
        
    } catch (err) {
        debug('[-] Error Deleting Job')
        console.log(err);
        return {status:"error",}
        
    }
}

const activateJob = async (jobID)=>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        await PendingJob.updateOne({_id:jobID}, { "$set": { "active": true } }, function(err, doc){
                if(err){
                    debug('[-] Error Activating Job')
                    console.log(err);
                    return {status:"error"}
                }else{
                    console.log(`[+] Job Activated - ${jobID}`)
                    // console.log(doc)
                    return {status:"success", msg: "Job Activated"}
                    
                }}).clone()
        
    } catch (err) {
        debug('[-] Error Activating Job')
        console.log(err);
        return {status:"error",}
        
    }
    
}


const endJob = async (success, jobId, time=null, course=null, member=null) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        debug('[+] Ending Job...')
        const pendingJob = await PendingJob.findById({_id:jobId})
        debug('[+] Creating Completed Job')
        const completedJob = await CompletedJob.create({
            date:pendingJob.date,
            successful:success,
            time:time,
            course:course,
            member:member,
            user:pendingJob.user
        })
        debug('[+] Created %O', completedJob)
        await destroyUserPendingJob(jobId)
    } catch (err) {
        debug('[-] Error Ending Job')
        console.log(err)
    }
    
}

const getJobs = async () =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        
        // const resp = await PendingJob.find().populate(['pendingJobs', 'completedJobs'])
        debug('[+] Retriving All Jobs...')
        const pendingJobs = await PendingJob.find()
        // Find User with job
        // console.log(await User.findOne({pendingJobs:pendingJobs[0].id}))
        
        // const {pendingJobs, completedJobs} = resp 
        if (pendingJobs && pendingJobs.length) {
            debug('[+] Jobs Retrived')
            testJobsDate(pendingJobs)
            // return {pendingJobs:pendingJobs}
        }
        else if(pendingJobs.length === 0) {
            debug('[+] No PendingJobs')
            return
        }
        else debug('[-] Retival Error')
        
    } catch (err) {
        console.log(err);
        return debug('[-] Retival Error')
        
    }
}

const runBot = async (todayJobs) =>{
    
    for(const job of todayJobs){
        debug('[+] Decrypting ClubPassword...')
        const clubPassword = decryptToken(job.clubPassword.token, job.clubPassword.iv)
        const user = job.user

        if(job.proxy){
            debug('[+] Proxy Enabled')
            const proxyConfig = await getProxyConfig(user)
            if(proxyConfig.status === "no proxy"){
                debug("[-] Proxy Config Retrival Error/Running Without Proxy")
            }
            await startBot(member=job.member?job.member : null, proxy=proxyConfig.status === 'success'?proxyConfig:null, job.clubUsername, clubPassword, job.startTime, job.endTime, job.date, job.courseList, job.id)
            // await console.log(member=job.member?job.member : null, proxy=proxyConfig.status === 'success'?proxyConfig:null, job.clubUsername, clubPassword, job.startTime, job.endTime, job.courseList, job.id)
        }else{
            console.log('typeof job.courseList')
            console.log(typeof job.courseList)
            await startBot(member=job.member?job.member : null, proxy=null, job.clubUsername, clubPassword, job.startTime, job.endTime, job.date, job.courseList, job.id)
            // await console.log(member=job.member?job.member : null, proxy=null, job.clubUsername, clubPassword, job.startTime, job.endTime, job.courseList, job.id)
        }
    }
    return
    
}

module.exports = { newJob, getJobs, getUserJobs, updateUserJob, destroyUserPendingJob, destroyUserCompletedJob, activateJob, endJob, runBot }