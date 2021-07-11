const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()

let isAudio = false
let isVideo = false

const myVideo = document.createElement('video')
myVideo.muted = true  //intially our video is muted
const peers = {}

navigator.mediaDevices.getUserMedia({
  video: isVideo,
  audio: isAudio
}).then(stream => {
  addVideoStream(myVideo, stream) //attach our video to our screen

  myPeer.on('call', call => {
    call.answer(stream)

    const video = document.createElement('video')
    
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream) //attach incoming video
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

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