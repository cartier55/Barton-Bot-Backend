const mongoose = require('mongoose');
const { createCron, removeCron } = require('../utils/cron/createCron');


const pendingJobModel = new mongoose.Schema({
    date:{type:String, required: true, unique:true},
    startTime:{type:String, required: true},
    endTime:{type:String, required: true},
    courseList:{type:[String], required: true},
    member:{type:String},
    clubUsername:{type:String, required: true},
    clubPassword:{type:{token:String, iv:String}, required:true},
    proxy:{type:Boolean, required: true, default:false},
    active:{type:Boolean, required: true, default:false},
    botStartDate:{type:String},
    botStartTime:{type:String},
    user:{type:String, required: true},
},{collection:'pendingjobs'})

pendingJobModel.post('save', function() {
  if(this.botStartDate || this.botStartTime){
    createCron(this)
} 
});

pendingJobModel.pre('findOneAndUpdate', async function() {
  const docToUpdate = await this.model.findOne(this.getQuery());
  if(docToUpdate.botStartDate || docToUpdate.botStartTime){
    removeCron(docToUpdate.date)
  }
});

pendingJobModel.post('findOneAndUpdate', function() {
  const id = this._conditions._id.toString()
  if(this._update['$set'].botStartDate || this._update['$set'].botStartTime){
    createCron({id:id, ...this._update['$set']})
  }
});

pendingJobModel.pre('findOneAndDelete', async function() {
  const docToDelete = await this.model.findOne(this.getQuery());
  if(docToDelete.botStartDate || docToDelete.botStartTime){
    removeCron(docToDelete.date)
  }
});

pendingJobModel.static('findByID', function(id){
    this.find({_id:id}, function(err, resp){
        if(err){
            console.log(err)
        }else{
            console.log(resp)
        }
    })
    
})


module.exports = mongoose.model('PendingJob', pendingJobModel)
