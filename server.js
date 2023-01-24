//Importing
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const Messages = require('./Models/dbMessages')
const Pusher = require('pusher')

//pusher
const pusher = new Pusher({
  appId: '1495531',
  key: '0016fb1fee0afff35e28',
  secret: '15bf4b0cb79f944f8de7',
  cluster: 'ap2',
  useTLS: true
})

//app config
const app = express()
app.use(cors())
app.use(express.json())

//Middleware

//DB config
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connection established')
  })
  .catch(err => {
    console.log(err)
  })

//pusher
const db = mongoose.connection
db.once('open', () => {
  console.log('DB connected to pusher')

  const msgCollection = db.collection('messagecontents')
  const changeStream = msgCollection.watch()

  changeStream.on('change', change => {
    console.log('A changed occured', change)

    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument
      pusher.trigger('messages', 'inserted', {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received
      })
    } else {
      console.log('Error triggering Pusher')
    }
  })
})

//????

//api routes
app.get('/', (req, res) => res.status(200).send('hello world'))

app.get('/api/messages/sync', (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(200).send(data)
    }
  })
})

app.post('/api/messages/new', (req, res) => {
  const dbMessage = req.body

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(201).send(data)
    }
  })
})

//listen
const port = process.env.PORT || 9000
app.listen(port, () => console.log(`Listening on Localhost ${port}`))
