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


//Capturing our stream data
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(ourStream => {

  //SENDING
  socket.on('user-connected', userId => {

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


  //RECIEVING
  myPeer.on('call', call => { 
    addVideoStream(myVideo, ourStream)
    call.answer(ourStream)  // answer call send our stream
  
    const video = document.createElement('video')
  
    call.on('stream', userVideoStream => {  //listern peer upcoming stream
      addVideoStream(video, userVideoStream) //attach incoming video
    })
  })
  

  //When muted
  document.getElementById("mute").addEventListener('change', function () {
    if(this.checked){
      
      ourStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);

      Object.keys(peers).forEach(userId => {
        const oldCall = peers[userId]
        oldCall.close()
  
        const call = myPeer.call(userId, ourStream)
  
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
  
        call.on('close', () => {
          video.remove()
        })
      });
    }else{

      Object.keys(peers).forEach(userId => {
        const oldCall = peers[userId]
        oldCall.close()
  
        const call = myPeer.call(userId, ourStream)
  
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
  
        call.on('close', () => {
          video.remove()
        })
      });
    }
  })
})





