const socket = io()
//Elements
const $messagForm = document.querySelector('#message-form')
const $messagFormInput = $messagForm.querySelector('input')
const $messagFormButton = $messagForm.querySelector('button')
const $sendLocationButton  = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const linkTemplate = document.querySelector('#link-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//Options
const { username, room} = Qs.parse( location.search, { ignoreQueryPrefix: true })

//Autoscrolling
const autoscroll = () => {
    //New message element
    const $newMessage  = $messages.lastElementChild

    //get the height of new message
    const newMessageStyles = getComputedStyle($newMessage) //to check global styles and checking global marginbottom style
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //container height of messages
    const containerHeight = $messages.scrollHeight

    //how far as i scroll
    const scrollOffset = $messages.scrollTop + visibleHeight
    // console.log(containerHeight)
    // console.log(newMessageHeight)
    // console.log(scrollOffset)

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log( message)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// socket.on('countUpdated', (count) => {

//     console.log('count is updated', count)
// })

//Listen send message URL from server
socket.on('LocationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(linkTemplate, {
        username:url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')

//     socket.emit('increment')
// })

$messagForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messagFormButton.setAttribute('disabled', 'disabled' )//2nd disabled is name of it


    const value = e.target.elements.message.value
    socket.emit('formValue', value , (error) => {

        $messagFormButton.removeAttribute('disabled') //mention the name of the input/button
        $messagFormInput.value = ''
        $messagFormInput.focus()

        if(error){

            return console.log(error )
        }
        console.log('Message delivered!')
    })
    //console.log(value)
})

$sendLocationButton.addEventListener('click', () => {

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    //disabled location send button
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition( (position) => {
        const lat = position.coords.latitude
        const long = position.coords.longitude

        const location  = {
            lat,
            long
        }
        socket.emit('locationSharing', location, () => {
            //remove diabled from a button
            $sendLocationButton.removeAttribute('disabled')

            console.log('location Shared')
        })
    })
})

//to join the room
socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})

//update userlist data
socket.on('usersRoom', ({ room, users }) => {

    const html = Mustache.render(sidebarTemplate ,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})