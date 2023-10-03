/**
 * @constant 
*/
const container = document.querySelector(".container");
const porgressBarProvider = document.querySelector(".progress-bar-provider");
const porgressBar = document.querySelector(".progress-bar");
const volumePorgressBar = document.querySelector(".volume-progress-bar");
const btnWrapper = document.querySelector(".btn-wrapper");
const playButton = document.querySelector(".btn-play");
const pauseButton = document.querySelector(".btn-pause");
const pointSpan = document.querySelector(".point");
const startTimeElment = document.querySelector(".time-start");
const totalTimeElment = document.querySelector(".time-total");
const volumeBtn = document.querySelector(".mute-btn");

const volumeWrapper = document.querySelector(".volume-wrapper");
const volumeBarContainer = document.querySelector(".volume-progress-bar");
const volumePointer = volumeBarContainer.querySelector(".volume-point");
const volumeBar = volumeBarContainer.querySelector(".volume-bar");
const volume = document.querySelector(".volume");

let isScrubbing = false;
let isVolumeScrubbing = false;
let t = null;
let isProgressBar = false;
let checkVolumeIsScrubingOnce = null;

const musics = [
  {
    name: "clocks",
    artist: "coldplay",
    src: "./music/clocks.mp3",
  },
  {
    name: "dory",
    artist: "test",
    src: "./music/dory.m4a"
  }
];

/**
 * @audio_api 
*/
const audio = new Audio(musics[0].src);
let wasPuased = audio.paused;

const handlePlay = () => 
{
  audio.play();
  btnWrapper.classList.add("play");
}; 

const handlePuase = () => 
{
  audio.pause();
  btnWrapper.classList.remove("play");
};

pauseButton.onclick = handlePuase;
playButton.onclick = handlePlay;

const timeUpdate = () => 
{
  let x = audio.currentTime / audio.duration;
  porgressBarProvider.style.setProperty("--progress-x", `${x * 100}%`);
  startTimeElment.textContent = formatTime(audio.currentTime);

  if(audio.currentTime  === audio.duration)
  {
    setTimeout(() => 
    {
      handlePuase();
      audio.currentTime = 0;
    }, 1000);
  }
}

const handleLoadeddata = () =>
{
  totalTimeElment.textContent =  formatTime(audio.duration)
}

// eventListeners
audio.onloadeddata = handleLoadeddata;
audio.ontimeupdate = timeUpdate;

/**
 * @hover_effect
*/
const handleHoverEffect = (_e) =>
{
  const rect =  container.getBoundingClientRect();
  container.style.setProperty("--mouse-x", `${_e.clientX - rect.left}px`);
  container.style.setProperty("--mouse-y", `${_e.clientY - rect.top}px`);
}
container.onmousemove = handleHoverEffect;

/**
 * @progressBar_cursor 
*/
const handleProgressBar = (evt) =>
{
  // return true whene user hold right click
  isScrubbing = (evt.buttons & 1) == 1;
  /**
   * simulate mouseEnter and mouseLeave events but runs just for once 
  */
  if(isScrubbing)
  {
    handlePuase();
    const rect = porgressBar.getBoundingClientRect();
    let x = Math.min(1, Math.max((evt.clientX - rect.left) / rect.width, 0));
    audio.currentTime = x * audio.duration;
    porgressBarProvider.style.setProperty(
      "--progress-x", 
      `${x * 100}%`
    );
    if(t === null) 
    {
      t = true;
      pointSpan.classList.add("scrubbing");
      porgressBar.classList.add("scrubbing");
    } 
  }
  else if(t) 
  {
    t = null
    pointSpan.classList.remove("scrubbing");
    porgressBar.classList.remove("scrubbing");
    if (wasPuased) {
      handlePlay();
    }
  }
}

document.addEventListener("mousemove", (_e) => 
{
  // scrub the progress bar when first run porgressBar.onmousemove
  if(isScrubbing)
  {
    handleProgressBar(_e)
  }
})
porgressBar.onmousemove = handleProgressBar;

porgressBar.onmousedown = (_e) => 
{
  const rect = porgressBar.getBoundingClientRect();
  let x = Math.min(1, Math.max((_e.clientX - rect.left) / rect.width, 0));
  audio.currentTime = x * audio.duration;
};

/**
 * @volumeBar_component
*/
volumeBtn.onclick = () => document.querySelector(".volume-wrapper").classList.toggle("show");
volumeBtn.onblur = () => document.querySelector(".volume-wrapper").classList.remove("show");
document.querySelector(".volume-wrapper").onmousedown = (_e) => _e.preventDefault();

let hideVoumeBarHandler;
// set defualt volume
volumePointer.style.setProperty("--volume-x", `${100}%`);
volumeBar.style.setProperty("--volume-x", `${100}%`);

function handleVolumeBarMouseMove(evt)
{
  //* return true whene user hold right click
  isVolumeScrubbing = (evt.buttons & 1) == 1;
  //* simulate mouseEnter and mouseLeave events but runs just for once 
  if(isVolumeScrubbing)
  {
    const volumeRect = volumeBarContainer.getBoundingClientRect();
    let x = ((evt.clientX - volumeRect.left) / volumeRect.width);
    let calcedX = Math.max(0, Math.min(x * 100, 100));

    volumePointer.style.setProperty("--volume-x", `${calcedX}%`);
    volumeBar.style.setProperty("--volume-x", `${calcedX}%`);
    volume.textContent = Math.floor(calcedX);

    audio.volume = Math.max(0, Math.min(x, 1));
    
    if (checkVolumeIsScrubingOnce == null)
    {
      checkVolumeIsScrubingOnce = true;
      volumeBarContainer.classList.add("scrubbing");
      if(hideVoumeBarHandler)
      {
        clearTimeout(hideVoumeBarHandler);
      }
      console.log("in");
    }
  }
  else if(checkVolumeIsScrubingOnce)
  {
    checkVolumeIsScrubingOnce = null;
    hideVoumeBarHandler = setTimeout(() =>
    {
      volumeBarContainer.classList.remove("scrubbing");
    }, 3000)
    console.log("out");
  }
}
document.addEventListener("mousemove", (e) =>
{
  isVolumeScrubbing && handleVolumeBarMouseMove(e);
});
volumeBarContainer.onmousemove = handleVolumeBarMouseMove
volumeBarContainer.onmousedown = (evt) =>
{
  const volumeRect = volumeBarContainer.getBoundingClientRect();
  let x = ((evt.clientX - volumeRect.left) / volumeRect.width);
  let calcedX = Math.max(0, Math.min(x * 100, 100));

  volumePointer.style.setProperty("--volume-x", `${calcedX}%`);
  volumeBar.style.setProperty("--volume-x", `${calcedX}%`);
  volume.textContent = Math.floor(calcedX);

  audio.volume = Math.max(0, Math.min(x, 1));
};

/**
 * @handle_volume_chnage 
*/
audio.onvolumechange = () =>
{
  if(audio.volume >= 0.5) volumeWrapper.className = "volume-wrapper volume-high-icon show"
  if(audio.volume <= 0.5) volumeWrapper.className = "volume-wrapper volume-low-icon show";
  if(audio.volume == 0) volumeWrapper.className = "volume-wrapper volume-muted-icon show";
}

// helper
const formatToDigits = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2
});

const formatTime = (_time) => 
{
  let sec = Math.floor(_time % 60);
  let min = Math.floor(_time / 60);

  return `${formatToDigits.format(min)}:${formatToDigits.format(sec)}`; 
}