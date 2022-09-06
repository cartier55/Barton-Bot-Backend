Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
  };

// console.log(new Date('Sat Sep 10 2022 00:00:00 GMT-0400 (Eastern Daylight Time)').yyyymmdd());

const sevenDaysBefore = (date) =>{
    const today = new Date().yyyymmdd();
    const days = 7
    const teeDate = new Date(date)
    const sevenDaysBefore =  new Date(teeDate.getTime() - (days * 24 * 60 * 60 * 1000)).yyyymmdd();
    if(today === sevenDaysBefore) return true

}

// console.log(sevenDaysBefore('9/9/22'))