const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userEmail:{
        type:mongoose.Schema.Types.String,
        ref:'User',
        required: true
    },
    title:{
        type:String,
        required:true
    },
    targetAmount:{
        type:Number,
        required:true
    },
    savedAmount:{
        type:Number,
        default: 0,
        min: 0
    },
    deadline:{
        type: Date,
        required: true,
    },
    autoSavePercentage:{
        type:Number,
        min: 0,
        max: 100,
        default: 0
    },
    priorityLevel: {
        type: Number,
        default: 1,
    },
    currency: {
        type: String,
        default: 'GBP'
    },
    createdAt:{
        type:Date,
        default:Date.now
    } 
});

goalSchema.virtual('progressPercentage').get(function () {
    return this.targetAmount > 0 ? (this.savedAmount / this.targetAmount) * 100 : 0;
});

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

const Goal = mongoose.model('Goal',goalSchema);
module.exports=Goal;