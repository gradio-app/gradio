videoWidth = 400;
videoHeight = 400;

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }
  
  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;
  

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
  'audio': false,
  'video': {
    facingMode: 'user',
    width: mobile ? undefined : videoWidth,
    height: mobile ? undefined : videoHeight,
  },
  });
  
  video.srcObject = stream;

  return new Promise((resolve) => {
  video.onloadedmetadata = () => {
    resolve(video);
  };
  });

}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

function detectPoseInRealTime(video) {
  const flipHorizontal = true;
  async function poseDetectionFrame() {

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();
 
    requestAnimationFrame(poseDetectionFrame);

  }

  poseDetectionFrame();
}

async function bindPage() {

  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
        'or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }

  detectPoseInRealTime(video);

}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// kick off the demo
bindPage();


function notifyError(error) {
      $.notify({
          // options
          message: 'Not able to communicate with model (is python code still running?)'
      },{
          // settings
          type: 'danger',
          animate: {
              enter: 'animated fadeInDown',
              exit: 'animated fadeOutUp'
          },
          placement: {
              from: "bottom",
              align: "right"
          },
          delay: 5000

      });
 }


$('#clear-button').click(function(e){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    clickX = new Array();
    clickY = new Array();
    clickDrag = new Array();
    context.fillStyle = "black";
    context.fillRect(0, 0, 400, 400);
    ctx.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
})


$('#submit-button').click(function(e){
    var dataURL = canvas.toDataURL("image/png");
    ws.send(dataURL, function(e){
      notifyError(e)
    });

})

$('#capture-button').click(function(e){  
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();
    var dataURL = canvas.toDataURL("image/png");
    ws.send(dataURL, function(e){
      notifyError(e)
    });
})
