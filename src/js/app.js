const apiroot = "http://localhost:8080";

let imageContainerElement;
let imageElement;
let panzoom;
let zoomedIn = false;
let pointerPosition = { x: null, y: null };
let maxIndex;
let previousIndex;
let currentIndex;
window.onload = function () {
  imageContainerElement = document.getElementById("image");
  imageElement = imageContainerElement.getElementsByTagName("img")[0];
  initApi();
  //check if image load is complete
  if (imageElement.complete) {
    load();
  } 
  imageElement.addEventListener("load", load);
  
  document.addEventListener("keyup",(event) => {
    console.log(event.code)
    if(event.code === "KeyS"){
      setNextImage();
    } else if (event.code === "KeyW"){
      setPreviousImage();
    }
  })
};


function load() {
  let zoomfactor = zoomFactorToFit();
  let start = calculateXYstart(zoomfactor);
  panzoom = Panzoom(imageContainerElement, {
    startScale: zoomfactor,
    minScale: 0.01,
    startX: start.x,
    startY: start.y,
  });

  setTimeout(() => panzoom.setOptions({ disablePan: true }));

  imageContainerElement.addEventListener(
    "pointerdown",
    function (event) {
      zoomedIn = true;
      pointerPosition.x = event.x;
      pointerPosition.y = event.y;
      zoomToPoint(event);
    },
    { passive: false }
  );
  imageContainerElement.addEventListener(
    "pointerup",
    function (event) {
      //panzoom.zoom(zoomFactorToFit(), { animate: false });
      panzoom.reset({ animate: false });
      zoomedIn = false;
    },
    { passive: false }
  );
  imageContainerElement.addEventListener("pointermove", (event) => pan(event), {
    passive: false,
  });
}

function calculateXYstart(zoomfactor){
  let result = {x: null, y:null};
  result.x = -(imageElement.naturalWidth - imageElement.naturalWidth*zoomfactor)/2;
  result.y = -(imageElement.naturalHeight - imageElement.naturalHeight*zoomfactor)/2;

/*   if(imageElement.clientHeight>imageElement.clientWidth){
    result.y = result.x;
  } else {
    result.y = result.x;
  } */
  return result;
}

function zoomFactorToFit() {
  let factor = 1;
  const imageWidth = imageElement.naturalWidth;
  const imageHeight = imageElement.naturalHeight;
  const containerWidth = imageElement.parentElement.clientWidth;
  const containerHeight = imageElement.parentElement.clientHeight;
  const widthFactor = containerWidth / imageWidth;
  const heightFactor = containerHeight / imageHeight;

  return  Math.min(factor, widthFactor, heightFactor);
}

function zoomToPoint(event) {
  panzoom.zoomToPoint(1.0, event, { animate: false });
}

function pan(event) {
  if (zoomedIn) {
    let currentPan = panzoom.getPan();
    panzoom.pan(
      currentPan.x - (pointerPosition.x - event.x),
      currentPan.y - (pointerPosition.y - event.y),
      { force: true }
    );
  }
  pointerPosition.x = event.x;
  pointerPosition.y = event.y;
}

//-------------------api


async function initApi() {
  maxIndex = await (await fetch(apiroot + "/index")).text();
  setNextImage();
}

function setNextImage(){
  if(currentIndex){
    previousIndex = currentIndex;
  }
  currentIndex = Math.floor(Math.random() * (maxIndex - 0 + 1)) + 0; //don't remove the 0
  setSrc(currentIndex);
  
}

function setPreviousImage(){
  if(previousIndex){
    setSrc(previousIndex);
  }
}

function setSrc(index){
  imageElement.src=apiroot+"/index/"+index;
}
