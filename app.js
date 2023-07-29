require('dotenv').config()
require('express-async-errors');
const express = require('express')
const app = express()
const connectDb = require('./db/connect')

const authRoute = require('./routes/auth')
const campaignRoute = require('./routes/campaign')

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const cors = require('cors');
const { default: mongoose } = require('mongoose');

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())


// routes
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/campaign', campaignRoute)

app.get('/', (req, res) => {
    res.send('bibektimilsina')
})


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        await connectDb(process.env.MONGO_URL_LOCAL)
        console.log(`DB Connection Succesfull. Host:- ${mongoose.connection.host}`)
        app.listen(PORT, (req, res) => {
            console.log(`Server listening on port ${PORT}.....`);
        })
    } catch (error) {
        console.log(`Error occured:- ${error}`);
    }
}
startServer()