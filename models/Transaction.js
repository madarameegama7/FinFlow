const mongoose = require('mongoose')

const Schema = mongoose.Schema

const transactionSchema = new Schema({
    userEmail:{
        type:mongoose.Schema.Types.String,
        ref:'User',
        required: true
    },
    type:{
        type:String,
        enum: ["income","expense"],
        required: true,
    },
    amount:{
        type:Number,
        required:true,
        min:0,
    },
    category:{
        type:String,
        enum:["Food", "Transportation", "Entertainment", "Bills", "Salary", "Investments","Savings","Other"],
        required: true,
    },
    tags:{
        type:[String],
        default:[],
    },
    transactionDate:{
        type:Date,
        required:true,
        default:Date.now,
    },
    description:{
        type:String,
        maxlength:200,
    },
    recurring:{
        isRecurring:{
            type:Boolean,
            default: false,
        },
        frequency:{
            type:String,
            enum:["daily","weekly","monthly","yearly"],
            required: function(){
                return this.recurring.isRecurring;
            },
        },
    },
    autoSave:{
        type:Boolean,
        default:false,
    },
    goalId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Goal",
        default:null,

    },
    currency: {
        type: String,
        default: 'GBP'
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
});

const Transaction=mongoose.model("Transaction",transactionSchema);
module.exports=Transaction;

