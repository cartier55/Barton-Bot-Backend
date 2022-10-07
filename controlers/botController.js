const { newJob, getUserJobs, updateUserJob, destroyUserPendingJob, destroyUserCompletedJob } = require('../utils/bot/botJobActions');
const debug = require('debug')('app:botController');

const createJob = async (req, res) => {
    const {date, startTime, endTime, clubUsername, clubPassword, member, priorityList, proxy, botStartDate, botStartTime} = req.body
    const user = req.user
    debug(`[+] Creating Job For ${date}`)
    // console.log(date, startTime, endTime, clubUsername, clubPassword, member, priorityList, proxy);
    const resp = await newJob(date, startTime, endTime, priorityList, member, clubUsername, clubPassword, proxy, botStartDate, botStartTime, user.username)
    if (resp.status === 'success') return res.status(200).json({msg:'Job Created'})
    else return res.status(400).json({error:resp.error})
    
}

const listJobs = async (req,res)=>{
    const user = req.user
    debug(`[+] Listing Jobs For ${user.username}`)
    const resp = await getUserJobs(user.username)
    if (resp.status == "success") return res.status(200).json({pendingJobs:resp.pendingJobs, completedJobs:resp.completedJobs})
    else return res.status(400).json({status:"error"})
}

const updateJob = async (req, res) => {
    const {date, startTime, endTime, clubUsername, clubPassword, member, priorityList, proxy, botStartDate, botStartTime, _id} = req.body
    // console.log(date, startTime, endTime, clubUsername, clubPassword, member, priorityList, proxy, botStartDate, botStartTime, _id);
    debug(`[+] Updating ${_id}`)
    const resp = await updateUserJob(_id, {date, startTime, endTime, courseList:priorityList, member, clubUsername, clubPassword, proxy, botStartDate, botStartTime})
    if (resp.status === "success") return res.status(202).json(resp)
    else return res.status(400).json(resp)
    
}

const destroyPendingJob = async (req, res) => {
    const {id} = req.params
    const {username} = req.user
    debug(`[+] Deleting PendingJob ${id}`)
    const resp = await destroyUserPendingJob(id, username)
    if(resp.status === "success") return res.status(204).json({msg:'Job Deleted'})
    else return res.status(400)
}

const destroyCompletedJob = async (req, res) => {
    const {id} = req.params
    const {username} = req.user
    debug(`[+] Deleting CompletedJob ${id}`)
    const resp = await destroyUserCompletedJob(id, username)
    if(resp.status === "success") return res.status(204).json({msg:'Job Deleted'})
    else return res.status(400)
}


module.exports = { createJob, listJobs, updateJob, destroyPendingJob, destroyCompletedJob }