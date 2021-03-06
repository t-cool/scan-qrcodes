// Camera facing mode = flip mode
const FACING_MODE_ENVIRONMENT = "environment";
const FACING_MODE_USER = "user";
let gCurrentCameraFacingMode = FACING_MODE_ENVIRONMENT;

// Flip camera
function switchCamera () {
  if( gCurrentCameraFacingMode === FACING_MODE_ENVIRONMENT ){
    gCurrentCameraFacingMode = FACING_MODE_USER;
  }else{
    gCurrentCameraFacingMode = FACING_MODE_ENVIRONMENT;
  }
  startStreamingVideo();
}

// Flip Cmera
const filpCameraElem = document.getElementById( "flipCameraImage" );
filpCameraElem.addEventListener( "mouseover", async ev => {
  filpCameraElem.style.opacity = 0.7;
});

filpCameraElem.addEventListener( "mouseout", async ev => {
  filpCameraElem.style.opacity = 0.3;
});

filpCameraElem.addEventListener( "click", async ev => {
  switchCamera();
});

// Video element
const video = document.querySelector( "#video" );

// On Streaming
function startStreamingVideo () {
  if( navigator.mediaDevices.getUserMedia ){
    navigator.mediaDevices.getUserMedia( 
      { video: {
        facingMode: gCurrentCameraFacingMode } } 
    ).then( ( stream ) => {
      video.srcObject = stream;
    } );    
  }
}
startStreamingVideo();

// ビデオストリームを読み込んだ後に、ビデオストリーミングから画像をキャプチャする
// https://qiita.com/iwaimagic/items/1d16a721b36f04e91aed
let gIsLoaded = false;
video.onloadedmetadata = () => {

  if( !gIsLoaded ){
    gIsLoaded = true;

    const btCapture = document.getElementById( 'btCapture' );

    btCapture.addEventListener( 'click', () => {
      
      // Capture: draw to hidden canvas
      const hiddenCanvas = document.getElementById( 'hiddenCanvas' );
      hiddenCanvas.width = video.videoWidth;
      hiddenCanvas.height = video.videoHeight;
      const ctx = hiddenCanvas.getContext('2d');
      ctx.drawImage( video, 0, 0, hiddenCanvas.width, hiddenCanvas.height );

      // DataURLの読み込みとpngへの変換
      const link = document.getElementById( 'hiddenLink' );
      link.href = hiddenCanvas.toDataURL();

      link.download = "save.png";
      link.click();

    });

    btCapture.disabled = false;

    const INTERVAL = 100;
    setInterval( decodeQR, INTERVAL );
  }
}

// QR decoding
let previousDecodedData = undefined;

// Decode
let resultSet = new Set();
let resultArray = [];

function decodeQR (){
  // Capture: draw to hidden canvas
  const canvas = document.getElementById( 'hiddenCanvasForQR' );
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage( video, 0, 0, canvas.width, canvas.height );
  const imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
  const code = jsQR( imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  } );
  
  if ( code ) {
    if( document.getElementById( 'cbIgnoreSameData' ).checked &&
        ( code.data === previousDecodedData ) ){
    }else{
      const decodedDataText = document.getElementById( 'decodedData' );
      if( previousDecodedData === undefined ){
        decodedDataText.value = '';
      }
      resultSet.add(code.data);
      resultArray = Array.from(resultSet); 
      decodedDataText.value = resultArray.sort((a,b)=>{return a - b});
    }
  }
}
