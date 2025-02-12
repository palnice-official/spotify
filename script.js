console.log("Initialising script.js....");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}`);
  let response = await a.text();
  // console.log(response, "getSongs");
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  // console.log(div)
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      // console.log(element, "element")
      songs.push(element.href.split(`${folder}`)[1]);
    }
  }
  console.log(songs)
  return songs;
}
// getSongs();

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  currentSong.play();
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-2)[1];
      // console.log(folder)
      // Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      // console.log(response)
      let cardContainer = document.querySelector(".cardContainer");
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder = "cs" class="card">
              <div  class="play-button">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#000"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 20V4L19 12L5 20Z"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpg"
              />
              <h2>${response.title}</h2>
              <p>
                ${response.description}
              </p>
            </div>`;
    }
  }
  // Load card whenever it is clicked
// console.log(Array.from(document.getElementsByClassName("card")), "array")
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    // console.log(e);
    e.addEventListener("click", async (item) => {
      console.log("Fetching songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      console.log(item.currentTarget, "items")
      playMusic(songs[0])
    });
  });
}

async function main() {
  await getSongs("songs/ncs");
  playMusic(songs[(0, true)]);
  // console.log(songs);
  // let audio = new Audio(songs[0]);
  // audio.play();
  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songs.innerHTML = "";
  for (const song of songs) {
    console.log(song, "song")
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
                <img class="invert" src="music.svg">
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Nice</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img src="play.svg" class="invert">
                </div>
              </li>
    
    <li>`;
  }

  // audio.addEventListener("onetimeupdate", () => {
  //   let duration = audio.duration;
  //   console.log(duration);
  // });

  // Attach event lisner to each song
  console.log(Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ))
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML.trim())
      console.log(element)
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  //Display all the albums
  displayAlbums();

  // Attach event lisner to play, pause, next
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // time update event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration)
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  // Add Eventlisner to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    // console.log(persent)
    document.querySelector(".circle").style.left = persent + "%";
    currentSong.currentTime = (currentSong.duration * persent) / 100;
  });
  // Add Eventlisner to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add Eventlisner to close btn
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  // add eventlisner to previous button
  document.querySelector("#previous").addEventListener("click", () => {
    // console.log("click on previous btn")
    // console.log(songs)
    // console.log(currentSong.src.split("/").slice(-1)[0])
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // add eventlisner to next button
  document.querySelector("#next").addEventListener("click", () => {
    // currentSong.pause()
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 > songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // add eventlisner to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("setting volume to", e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Add event eventlisner to mute the track

    document.querySelector(".volume >img").addEventListener("click", e =>{
      // console.log(e.target)
      if(e.target.srt.includes("volume.svg")){
       e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
      }
      else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
      }
    })
}
main();
