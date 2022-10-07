// ! - Remove this file before bundling
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
        let rawTeeTime = new Date(startTime.getTime() + 9*60000);
        startTime = rawTeeTime
        let teeTime = rawTeeTime.toLocaleString('en-us', options)
        teeTimes.push(teeTime)
        
        if (teeTime == endTime){
            break
        }
    } 

}

// getTimeList(new Date('9/10/2022 8:03 AM'), '8:21 AM')
const time = '12:59 pm'
const timeRegex = /^(0{0,1}[1-9]|1[012]):[0-5][0-9]\s(A|P)M/ig
// console.log(time.match(timeRegex))

const convertTime = (time) =>{
    time.setUTCHours(time.getHours() + 5)
    // const orginalTime = new Date(`09/19/2000 ${time}`)
    // console.log(orginalTime.toLocaleTimeString())
    // console.log(orginalTime.getUTCHours() - 5)
    // orginalTime.setUTCHours(orginalTime.getHours() + 5)
    // console.log(orginalTime.toLocaleTimeString())
    console.log(time.toLocaleTimeString())
}

convertTime(new Date('09/19/2000 12:00 PM'))