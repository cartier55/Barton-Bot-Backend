const mongoConnect = require("../db/mongoConnect");
const PendingJob = require('../../models/pendingJobModel');
const { startBot } = require("../bot/bot");
const { decryptToken } = require("../proxy/tokenCrypt");
const { getProxyConfig } = require("../proxy/getProxy");
// const { createCron } = require("./createCron");
const { createCron } = require("c:/Users/carjames/OneDrive - Cisco/Documents/Code/Barton-Bot-Backend/utils/cron/createCron");
const debug = require('debug')('app:testDate');

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
  };

// console.log(new Date('Sat Sep 10 2022 00:00:00 GMT-0400 (Eastern Daylight Time)').yyyymmdd());
// console.log(new Date('2022-10-01T04:00:00.000Z').yyyymmdd());

const sevenDaysBefore = (date, retrieve=false) =>{
    // Works Dont Change!!!
    // string date from db goes in
    // creates new date obj for the current date then turns into string
    // create new date obj form date parameter from db
    // adds seven days to db date obj then turns to string
    // compares if today's string date === db string date
    const today = new Date().yyyymmdd();
    const days = 7
    const teeDate = new Date(date)
    const sevenDaysBefore =  new Date(teeDate.getTime() - (days * 24 * 60 * 60 * 1000));
    if(!retrieve){
        if(today === sevenDaysBefore.yyyymmdd()){
            debug('[+] Seven Days Before')
            return true
        }
        else{
            debug('[+] Not Today')
            return false
        } 
    }else return sevenDaysBefore

}

// console.log(sevenDaysBefore('2022-10-02T04:00:00.000Z', true))

const testJobsDate = (jobs) =>{
    debug('[+] Testing Job Dates...')
    const job = jobs.find(job=> sevenDaysBefore(job.date) && !job.botStartDate && !job.botStartTime)
    // jobs.forEach((job) =>{
    //     // console.log(job.id)
    //     // if(sevenDaysBefore(job.date) && !job.botStartDate && !job.botStartTime) todayJobs.push(job)
    //     todayJobs.push(job)
    // })
    if (job){
        debug('[+] Job Found')
        createCron(job)
    }else debug('[-] No Jobs For Today')
}


// getJobs()


module.exports = { testJobsDate }