const { Cluster } = require('puppeteer-cluster');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { activateJob, endJob } = require('./botJobActions');
// const { activateJob, endJob } = require('c:/Users/carjames/OneDrive - Cisco/Documents/Code/Barton-Bot-Backend/utils/bot/botJobActions');


const activateCluster = async (posts) =>{
    const cluster = await Cluster.launch( {puppeteerOptions: {
        headless: false,
        defaultViewport: null, 
    },
        puppeteer,
        // monitor:true,
        retryLimit:5,
        timeout:180000,
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 1,
    });
    cluster.on('taskerror', (err, data, willRetry) => {
        if (willRetry) {
          console.warn(`Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`);
        } else {
          console.error(`Failed to crawl ${data}: ${err.message}`);
        }
    });
   
    await cluster.task(startBot(page))
    cluster.queue()
    
    await cluster.idle();
    await cluster.close();
}

async function startBot(member=null, proxy=null, username, password, startTime, endTime, date, courseList, jobId){ 
    // const { activateJob } = require('c:/Users/carjames/OneDrive - Cisco/Documents/Code/Barton-Bot-Backend/utils/bot/botJobActions');
    const { activateJob } = require('./botJobActions');

    // async function startBot(){ 
        console.log(typeof courseList)
        console.log("[+] Bot Starting...")
        
    const callback = function(err, resp){
        if(err){
            console.log(err)
        }else{
            console.log(resp)
        }
    }
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', proxy ? `--proxy-server=${proxy.url}` : '']
    });
    puppeteer.use(StealthPlugin())
    
    process.on('SIGTERM', async () => {
        console.log('End Gracefuly')
    await browser.close();
    });

    const page = (await browser.pages())[0]
    page.on('dialog', async dialog => {
        //get alert message
        console.log(dialog.message());
        //accept alert
        await dialog.accept();
    })
    if(proxy){
        console.log('proxy')
        await page.authenticate({
            username: proxy.username,
            password: proxy.token
        });
    }
    console.log('id')
    console.log(jobId);
    await activateJob(jobId)

    await page.goto(`https://www.bartoncreekmembers.com/`, {waitUntil : 'networkidle2' }).catch(e => void 0);
    await Promise.all([
        page.click('a.loginLink'),
        page.waitForNavigation({waitUntil: 'networkidle2'})
    ]);

    if(!await login(page, username, password)){
        await completeJob( browser, false, jobId )
        return
    }

    const [golfLink] = await page.$x("//a[contains(., 'Golf')]");
    if(golfLink){
        await golfLink.hover()

    }
    await handleForeTeesNav(page, member)
    await findDate(page, date)
    const sucess = await findTime(page, startTime, endTime, courseList)
    if(sucess){
        console.log(`[+] ${sucess}`)
        await completeJob(browser, true, jobId, sucess.time, sucess.course, member)
    }else{
        console.log(sucess)
        await completeJob(browser, false, jobId)
    }
    console.log("-Done")
    await browser.close();
};


const login = async (page, username, password) => {
    console.log('[+] Logging In')
    await page.waitForSelector('input[placeholder="Username"]')
    await page.type('input[placeholder="Username"]', username)
    // await page.type('input[placeholder="Username"]', 'dgriffus', {delay:100})
    await page.type('input[placeholder="Password"]', password)
    // await page.type('input[placeholder="Password"]', 'Bestteetimes1', {delay:100})
    await page.click('input[name="btnSecureLogin"][value="Sign In"]')
    await page.waitForNavigation({waitUntil:'networkidle2'}) 
    if(await checkFailedLogin(page)){
        console.log('[-] Failed Login')
        return false
    } 
    else{
        console.log('[+] Logged In')
        return true
    }
}

const checkFailedLogin = async (page) =>{
    try {
        console.log(page.url())
        const errorUrls = ['https://www.bartoncreekmembers.com/default.aspx?p=home&E=0', 'https://www.bartoncreekmembers.com/default.aspx?p=home&E=1']
        const err = errorUrls.find(url=> page.url() === url)  
        if (err) return true
        else return false
        
    } catch (error) {
        if (error instanceof TypeError) return false
    }
}

const handleForeTeesNav = async (page, member) =>{
    let href = await getHref(page, 'ForeTees')
    console.log("[+] Navigating To ForeTees")
    await page.goto(href, {waitUntil : 'domcontentloaded' }).catch(e => void 0)
    if(!member){
        console.log('no member')
        await page.click('a.standard_button') //Clicking on first member name this is where provided memeber will be used or not
    }else{
        console.log('yes member')
        try {
            const [btn] = await page.$x(`//a[contains(@class, "standard_button") and contains(., "${member}")]`)
            await btn.click()
        } catch (error) {
            console.log(error)
            await page.click('a.standard_button') //Clicking on first member name this is where provided memeber will be used or not
        }
        
    }

    await page.waitForNavigation()
    await page.waitForSelector('span.topnav_item')
    const [menu] = await page.$x(`//a[contains(., "Tee Times")]`)
    await menu.hover()
    const link = await page.$x(`//a[contains(., "Make, Change, or View Tee Times")]`)
    await link[0].click()
    // href = await getHref(page, "Today's Tee Sheet") 
    // console.log(href)
    // await page.goto(href, {waitUntil : 'domcontentloaded' }).catch(e => void 0)
    await page.waitForNavigation()
    console.log("[+] Navigated")
    return
    
    
}

const findDate = async (page, date) =>{
    console.log("[+] Selecting Date")
    const todayNum = new Date(date).getDate()
    const [todayCal] = await page.$x(`//a[contains(., "${todayNum}")]`)
    // const [todayCal] = await page.$x(`//a[text()="4"]`)
    await todayCal.click()
    console.log("[+] Navigating To Time Selection")
    await page.waitForNavigation()
    console.log("[+] Navigated")
    return
}

const findTime = async (page, startTime, endTime, courseList) =>{
    let timeFound = false
    const date = new Date(`09/19/2022 ${startTime}`);

    
    const teeTimes = getTimeList(date, endTime)
    //div[contains(@class, 'atag') and contains(@class ,'btag')]

    // const example = await page.$('#example'); // Element
    // const example_parent = (await example.$x('..'))[0]; // Element Parent
    // const example_siblings = await example.$x('following-sibling::*'); // Element Siblings
    console.log(typeof courseList)
    for (const course of courseList){
        // if(course !== '')
        await changeCourse(page, course)
        for (const time of teeTimes){
            console.log(`[+] Checking For ${time}`)
            const avail = await page.$x(`//a[@data-ftjson and contains(., "${time}")]`)
            if(avail.length){
            const parent = await avail[0].$x('..')
            const playerSibling = await parent[0].$x('following-sibling::div[4]')
            const open = await page.evaluate(el => el.innerText, playerSibling[0])
            if(open.split('Open')[0].trim() === '4'){
                console.log('[+] Time Found');
                timeFound = true
                await avail[0].click()
                await page.waitForNavigation()
                await addPlayers(page)
                const sucess = await requestTime(page)
                if(sucess){
                    // console.log("[+] Tee Time - ")
                    return {time:time, course:course}
                    // break
                    
                    
                }else{
                    timeFound = false
                    await page.goBack()
                    continue
                }

            }
        }
        
    }
}
if(!timeFound){
    console.log('[-] No Avaliable Tee Time')
    return false

} 

}

const getHref = async(page, text) =>{
    const link = await page.$x(`//a[contains(., "${text}")]`)
    const href = await page.evaluate(el => el.getAttribute('href'), link[0])
    return href
}

const getTimeList = (date, endTime) =>{
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };
    // const timeString = date.toLocaleString('en-US', options);

    const teeTimes = []
    let startTime = date
    while(true){
        let teeTime = startTime.toLocaleString('en-US', options)       
        let nxtTeeTime = new Date(startTime.getTime() + 9*60000);
        startTime = nxtTeeTime
        teeTimes.push(teeTime)
        
        if (teeTime == endTime){
            break
        }
    } 
    // console.log(teeTimes)
    return teeTimes
}

// getTimeList(new Date('9/10/2022 8:03 AM'), '8:21 AM')

// const getTimeList = async (date, endTime) =>{
    //     const options = {
//         hour: 'numeric',
//         minute: 'numeric',
//         hour12: true
//     };
//     const timeString = date.toLocaleString('en-US', options);
//     console.log(timeString);

//     function addMinutes(date, endTime) {
//         const teeTimes = []
//         let teeTime
//         wihle(teeTime != endTime);{
//             let rawTeeTime = new Date(date.getTime() + 9*60000);
//             teeTime = rawTeeTime.toLocaleString('en-us', options)
//             teeTimes.push(teeTime)
//         } 

//     }

//     const timePlusNineMinString = addMinutes(date,9).toLocaleString('en-US', options)

// }

const changeCourse = async(page, course)=>{
    // if 
    console.log('[+] Grabbing Current Url');
    const currentUrl = await page.url()
    console.log('[+] Creating New Url');
    const newUrl = currentUrl.split('course')[0] + `course=${course}`
    console.log(`[+] Navigating To ${course}`);
    console.log(newUrl)
    await page.goto(newUrl, {waitUntil : 'domcontentloaded' }).catch(e => void 0)
    // await page.waitForNavigation()
    console.log('[+] Navigated');
    return
}

const addPlayers = async (page, players=4)=>{
    //data-fttab=".ftMs-guestTbd"
    const TBD = await page.$x('//div[contains(@data-fttab, "ftMs-guestTbd") and contains(.,"TBD")]')
    await TBD[0].click()
    const TBDInput = await page.$x('//div[contains(@class, "ftMs-listItem") and contains(.,"X")]')
    for (let i = 0; i < players; i++){
        await TBDInput[0].click()
        await page.select(`div#slot_player_row_${i} .transport_type`, 'CRT')
    }

}

const addRyan = async(page) =>{
    const [members] = await page.$x('//div[contains(@data-fttab, "ftMs-memberSearch") and contains(.,"Members")]')
    await members.click()
    await page.waitForSelector('input.ftMs-input')
    await page.type('input.ftMs-input', 'Ryan Fitzgibbon')
    // await page.waitForTimeout(2000)
    await page.waitForSelector('div[data-ftid="5322"]')
    await page.click('div[data-ftid="5322"]')
    await page.select(`div#slot_player_row_${1} .transport_type`, 'CRT')
    return await requestTime(page)
    // await addPlayers(page, players=2)


}

const clearPlayer = async (page) =>{
    const clearBtns = await page.$x('//a[contains(@class, "player_erase_button")]')
    await clearBtns[1].click()
}

const checkRestriction = async (page) =>{
    const [modal] = await page.$x('//h3[contains(.,"Player Count Restriction")]')
    if (modal){
        return true
    }else return false
}

const closePopup = async(page) =>{
    const closeBtn = await page.$x('//span[contains(@class, "ui-button-text") and contains(.,"Close")]')
    await closeBtn[1].click()
    await page.waitForTimeout(2000)
}

const checkBusy = async (page)=>{
    const [busy] = await page.$x('//span[contains(@id, "ui-id-18") and contains(., "Tee Time Slot Busy")]')
    if(busy){
        return true
    }else return false
}

const setJobStatus = async (id) =>{

}

const requestTime = async (page)=>{
    await page.click('div.button_container a.submit_request_button')
    await page.waitForTimeout(2000)
    if(await checkRestriction(page)){
        // await page.waitForTimeout(2000)
        await closePopup(page)
        await clearPlayer(page)
        return await addRyan(page)
        // return
    }
    
    const [successMsg] = await page.$x('//span[contains(@id, "ui-id-18") and contains(.,"Request Complete")]')
    if(successMsg){
       console.log('[+] Tee Time Set')
       const [btn] = await page.$x('//span[contains(@class, "ui-button-text") and contains(.,"Continue")]')
       await btn.click()
    //    console.log(sucess)
    //    await completeJob(browser, true, jobId, sucess.time, sucess.course, member)
       return true
    }
    else{
        console.log('[-] Failed Requesting Time')
        await closePopup(page)
        return false
    } 
    // const sucessMsg = page.evaluate(()=>{
    //     const popup = document.querySelector
    // })
}

const checkTime = () =>{
    const now = new Date()
    const compareTime = new Date()
    compareTime.setHours(6)
    compareTime.setMinutes(01)
    compareTime.setSeconds(00)
    if(now > compareTime) return true
    else return false
}

const completeJob = async ( browser, sucess, id, time=null, course=null, member=null)=>{
    // const { endJob } = require('c:/Users/carjames/OneDrive - Cisco/Documents/Code/Barton-Bot-Backend/utils/bot/botJobActions');
    const { endJob } = require('./botJobActions');

    try {
        // await browser.close()
        console.log('[+] Job Completed')
        await endJob(sucess, id, time, course, member)
    } catch (error) {
        
    }
}

const testHover = async ()=>{
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        // args: ['--start-maximized', `--proxy-server=${proxy}`]
    });
    puppeteer.use(StealthPlugin())
    
    process.on('SIGTERM', async () => {
    console.log('End Gracefuly')
    await browser.close();
    });
    
    const page = (await browser.pages())[0]
    await page.goto(`https://www.bartoncreekmembers.com/`, {waitUntil : 'load' }).catch(e => void 0);
    const [golfLink] = await page.$x("//a[contains(., 'Golf')]");
    if(golfLink){
        await golfLink.hover()
}
}
// startBot(member=null, proxy=null, username, password, startTime, endTime, courseList, jobId){ 
    
// startBot(member="Nicole", proxy=null, 'dgriffus','Bestteetimes1', '10:18 AM', '11:12 AM', ['Coore Crenshaw Cliffside', 'Fazio Foothills'], '632e373700c78772c62704eb')
// startBot(member=null, proxy=null, 'dgriffus','Bestteetimes1', '5:30 PM', '5:48 PM', ['Fazio Foothills'], '632e373700c78772c62704eb')
// startBot(member=null, proxy=null, 'dgriffus','Bestteetimes1', '4:45 PM', '5:12 PM', ['Fazio Foothills'], '632e373700c78772c62704eb')
// activateCluster()

module.exports = {startBot}