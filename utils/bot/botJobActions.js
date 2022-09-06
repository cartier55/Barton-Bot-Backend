const PendingJob = require('../../models/pendingJobModel');
const CompletedJob = require('../../models/completedJobModel');
const User = require('../../models/userModel');
const mongoose = require('mongoose');
const mongoConnect = require('../db/mongoConnect');
const newJob = async (date, startTime, endTime, courseList, member, clubUsername, clubPassword, proxy, username) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        const job = await PendingJob.create({
            date,
            startTime,
            endTime,
            courseList,
            member,
            clubUsername,
            clubPassword,
            proxy
        })
        console.log('Created', job);
        const status = await associateJob(job, username)
        return {...status}
    } catch (err) {
        // console.log(err);
        return {status:'error', code:err.code, error:'Job already created for date'}
    }
}

const associateJob = async (job, username) =>{
    try {
        // const resp = await User.updateOne({username:username}, {$set:{proxyConfig:proxy}} )
        const resp = await User.findOneAndUpdate({username:username}, {$push:{pendingJobs:job}}, {new:true}) //Returns whole document reciord
        console.log('associate');
        console.log(resp);
        
        if(resp.pendingJobs) return {status:"success"}
        else return {status:"error"} 
    } catch (err) {
        console.log(err);
        return {status:"error"}
    }
}

const getUserJobs = async (username) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        const resp = await User.findOne({username:username}).populate(['pendingJobs', 'completedJobs'])
        const {pendingJobs, completedJobs} = resp 
        if (pendingJobs) return {status:"success", pendingJobs:pendingJobs, completedJobs:completedJobs}
        else return {status:"error"}
        
    } catch (err) {
        console.log(err);
        return {status:"error",}
        
    }
}

const updateUserJob = async (id, update) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        const resp = await PendingJob.findByIdAndUpdate(id, update)
        console.log(resp);
        
        if (resp._id) return {status:"success", msg:`Job Updated`}
        else return {status:"error"}
        
    } catch (err) {
        console.log(err);
        return {status:"error",}
        
    }
}

const destroyUserPendingJob = async (id, username) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        const removedJob = await PendingJob.findByIdAndDelete(id)        
        // Deletes refrenced objects in user pending jobs array
        const resp = await User.updateOne({username:username}, {$pull:{pendingJobs:removedJob._id}},function(error){console.log(error)}).clone()
        if(resp.acknowledged && resp.modifiedCount) return {status:"success", msg: "Job Deleted"}
        else return {status:"error"}
    } catch (err) {
        console.log('err');
        console.log(err);
        return {status:"error",}
        
    }
}

const destroyUserCompletedJob = async (id, username) =>{
    await mongoConnect(process.env.DB_PWORD)
    try {
        const removedJob = await CompletedJob.findByIdAndDelete(id)
        const resp = await User.updateOne({username:username}, {$pull:{pendingJobs:removedJob._id}},function(error){console.log(error)}).clone()
        if(resp.acknowledged && resp.modifiedCount) return {status:"success", msg: "Job Deleted"}
        else return {status:"error"}
        
    } catch (err) {
        console.log('err');
        console.log(err);
        return {status:"error",}
        
    }
}

module.exports = { newJob, getUserJobs, updateUserJob, destroyUserPendingJob, destroyUserCompletedJob }