const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //checking room and name is not empty
    if(!username || !room){
        return {
            error: 'Name or room cannot be empty'
        }
    }

    //checking existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if(existingUser){
        return {
            error: 'Username already in use!'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex( (user) => {
        return user.id === id
    })

    if(index !== -1 ){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
   return users.find( (user) => user.id ===id )
}

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter( (user) => user.room === room )
}

module.exports = {
    getUser,
    getUserInRoom,
    addUser,
    removeUser
}





// addUser({ 
//     id:22,
//     username: 'Gopal ',
//     room: 'UP'
// })

// addUser({ 
//     id:23,
//     username: 'Shyam ',
//     room: 'Delhi'
// })

// addUser({ 
//     id:24,
//     username: 'Ram ',
//     room: 'Delhi'
// })

// console.log(users)
// const getUserBy = getUser(21)
// console.log(getUserBy)

// const userList = getUserByRoom('Delhi')
// console.log(userList)
// const res = addUser({ 
//     id:22,
//     username: 'Gopal',
//     room: 'Delhi'
// })

// console.log(res)

// const removedUser = removeUser(22)
// console.log(removedUser)
// console.log(users)