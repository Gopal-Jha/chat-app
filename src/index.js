const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const { generateMessage, generateLocationMessage } = require('../src/utils/messages')
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')

const port = process.env.PORT || 3000

//To define path for express config file
const directoryPath = path.join(__dirname, '../public')

let count = 0
//To check socket client side connection 
io.on('connection', (socket) => {
    console.log('New web socket connnection')

    //Join function for a room
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options }) //remove destructure and passing the whole options
        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))

        //broadcast used to send send message everyone expect that socket
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('usersRoom', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })

    socket.on('formValue', (value, callback) => {
        const filter = new Filter()
        if(filter.isProfane(value)){

            return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id)
        
       io.to(user.room).emit('message', generateMessage(user.username, value))
       callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            
            io.emit('message',generateMessage('Admin', `${user.username} has just disconnected`) )
            io.to(user.room).emit('usersRoom', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
        
    })

    socket.on('locationSharing', (location , callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('LocationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.lat},${location.long }`))
        callback()
    })
    // socket.emit('countUpdated', count)

    // socket.on('increment', () => {
    //     count++

    //     socket.emit('countUpdated', count)
    //     io.emit('countUpdated', count)
    // })
})

//Setup static directory to serve
app.use(express.static(directoryPath))

server.listen( port, () => {
    console.log(`Server is running on port at ${port}`)
})