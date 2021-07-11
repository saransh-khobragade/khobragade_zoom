const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()

let isAudio = true
let isVideo = true

const myVideo = document.createElement('video')
myVideo.muted = true  //intially our video is muted
const peers = {}

navigator.mediaDevices.getUserMedia({
  video: isVideo,
  audio: isAudio
}).then(ourStream => {
  addVideoStream(myVideo, ourStream) //attach our video to our screen

  myPeer.on('call', call => { //when remote peer attempts to call you
    call.answer(ourStream)  // answer call send our stream

    const video = document.createElement('video')

    call.on('stream', userVideoStream => {  //listern peer upcoming stream
      addVideoStream(video, userVideoStream) //attach incoming video
    })

  })

  socket.on('user-connected', userId => {
    const call = myPeer.call(userId, ourStream)
    
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
      video.remove()
    })

    peers[userId] = call
  })
}).catch(err=>{
  alert(err.message)
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})


function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

const muteCheckbox = document.getElementById("mute");

muteCheckbox.addEventListener('change', function () {
  isAudio = !isAudio
  isVideo = !isVideo
});