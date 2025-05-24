const express = require('express')
const mongoose = require('mongoose')
const cors =  require('cors')
const dotenv = require('dotenv')

dotenv.config();

//express app
const app = express()

//export routes
const transactionRoutes=require('./routes/transactionRoutes')
const userRoutes=require('./routes/userRoutes')
const budgetRoutes=require('./routes/budgetRoutes')
const financialReportRoutes=require('./routes/financialReportRoutes')
const goalRoutes=require('./routes/goalRoutes')
const currencyRoutes=require('./routes/currencyRoutes')
const notificationRoutes=require('./routes/notificationRoutes')


//middleware
app.use(express.json())

app.use((req,res,next) =>{
console.log(req.path, req.method)
next()
})

//routes
app.use('/api/transactions',transactionRoutes)
app.use('/api/users',userRoutes)
app.use('/api/budget',budgetRoutes)
app.use('/api/financialReport',financialReportRoutes)
app.use('/api/goals',goalRoutes)
app.use('/api/convert',currencyRoutes)
app.use('/api/notifications',notificationRoutes)

//connect to db
mongoose.connect(process.env.DB_URI)
.then(() =>{
    //listen for requests

    if (process.env.NODE_ENV !== 'test') {
        app.listen(process.env.PORT, () => {
            console.log("Listening on port", process.env.PORT);
        });
      }
})
.catch((error) =>{
    console.log(error)
})

// Export the app for testing
module.exports = app;