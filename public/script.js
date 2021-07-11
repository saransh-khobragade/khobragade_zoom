const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()

const myVideo = document.createElement('video')
myVideo.muted = true  //intially our video is muted
const peers = {}


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

let isMute = true

//SENDING
socket.on('user-connected', userId => {

  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: isMute
  }).then(ourStream => {
    addVideoStream(myVideo, ourStream)
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

})


//RECIEVING
myPeer.on('call', call => { //when remote peer attempts to call you
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: isMute
  }).then(ourStream => {
    addVideoStream(myVideo, ourStream)
    call.answer(ourStream)  // answer call send our stream

    const video = document.createElement('video')

    call.on('stream', userVideoStream => {  //listern peer upcoming stream
      addVideoStream(video, userVideoStream) //attach incoming video
    })
  })

})


document.getElementById("mute").addEventListener('change', function () {
  isMute = !isMute
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: isMute
  }).then(ourStream => {
    Object.keys(peers).forEach(userId => {
      const call = myPeer.call(userId, ourStream)
  
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })

      call.on('close', () => {
        video.remove()
      })
    });
  })
});