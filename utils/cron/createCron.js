const schedule = require('node-schedule');
// const { getJobs } = require('c:/Users/carjames/OneDrive - Cisco/Documents/Code/Barton-Bot-Backend/utils/bot/botJobActions');
const debug = require('debug')('app:createCron');

const init = () =>{
    const { getJobs } = require('../bot/botJobActions');
    debug('[+] Initalizing Cron...')
    const rule = new schedule.RecurrenceRule();
    rule.hour = 5;
    rule.minute = 30;
    rule.tz = 'US/Central'	

    const job = schedule.scheduleJob(rule, async function(){
        debug(`[+] ${new Date()} Checking For Jobs...`)
        await getJobs();
    });
    
    debug('[+] Cron Initalized')
}

const createCron = (job) =>{
    const { runBot } = require('../bot/botJobActions');
    // const { runBot } = require('c:/Users/carjames/OneDrive - Cisco/Documents/Code/Barton-Bot-Backend/utils/bot/botJobActions');
    debug('[+] Scheduling Job')
    console.log(job)
    const day = sevenDaysBefore(job.date, true)
    const startDate = new Date(job.botStartDate ? job.botStartDate : sevenDaysBefore(job.date, true))
    const startTime = changeTimeZone(new Date(`09/19/2000 ${job.botStartTime ? job.botStartTime : '6:00 AM'}`))
    console.log(startTime.getHours())
    console.log(startTime.getMinutes())
    startDate.setHours(startTime.getHours())
    startDate.setMinutes(startTime.getMinutes())
    const jobb = schedule.scheduleJob(job.date, startDate, async function(){
        debug(`[+] ${new Date()} Starting Job...`)
        await runBot([job])
    })
    debug('[+] Job Scheduled')
}

const removeCron = (date) =>{
    const my_job = schedule.scheduledJobs[date];
    try{
        my_job.cancel();
        debug('[+] Cron Removed')
    }catch(err){
        return
    }
}

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
  };

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
        if(today === sevenDaysBefore.yyyymmdd()) return true
        else return false
    }else return sevenDaysBefore

}

function changeTimeZone(time) {
    // Changes time to CMT timeZone 
    // Takes in DateTime Obj with perferred time 
    // Sets universal time hours equal to perferred time in CMT 
    // Returns DateTime obj that is set to whatever time in CPU current timeZone that matches perffered CMT
    time.setUTCHours(time.getHours() + 5)
    return time
}
module.exports = { init, createCron, removeCron }