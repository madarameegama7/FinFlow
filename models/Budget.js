const mongoose = require('mongoose')

const budgetSchema = new mongoose.Schema({
    userEmail:{
          type:mongoose.Schema.Types.String,
          ref:'User',
          required: true
    },
    amount:{
        type:Number,
        required:true,
        min:0
    },
    category:{
        type:String,
        enum:["Food","Transportation","Entertainment","Bills","Salary","Investments","Others",null],
        default: null
    },
    month:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    currency: {
        type: String,
        default: 'GBP'
    },

});

const Budget = mongoose.model('Budget', budgetSchema);
module.exports=Budget;