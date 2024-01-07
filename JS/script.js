console.log("Let's Write javaScript");
let currentsong = new Audio();
let songs;
let currFolder;

function secondsToMinutesAndSeconds(seconds) {
    // Ensure seconds is a non-negative number
    if (typeof seconds !== 'number' || seconds < 0) {
        return '00:00';
    }

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine minutes and seconds in the "mm:ss" format
    const formattedTime = `${formattedMinutes}:${formattedSeconds}`;

    return formattedTime;
}

// Example usage:
const totalSeconds = 123;
const formattedTime = secondsToMinutesAndSeconds(totalSeconds);
// console.log(formattedTime);  // Output: "02:03"


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // shows all songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Cheemsss</div>
                        </div>
                        <div class="playnow">
                            <span>PLay Now</span>
                            <img class="invert" src="img/play.svg" alt="">
                        </div></li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

    return songs;

}

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00  / 00:00"
}

// displaying albums on the page
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let cardContainer = document.querySelector(".cardContainer")
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            //  get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="25" cy="25" r="25" fill="#1fdf64" />
                    <path d="M15 12L35 25L15 38V12Z" fill="#141B34" />
                </svg>
            </div>
            <img class="Cardimage" src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {
    // get all songs's list
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    // display all albums on the page
    displayAlbums()

    // Attach an event listener to play next and previous buttons
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg";
        } else {
            currentsong.pause()
            play.src = "img/play.svg";
        }
    })

    // Listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesAndSeconds(currentsong.currentTime)} / ${secondsToMinutesAndSeconds(currentsong.duration)}`

        // running seekbar
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100
    })

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // add an event listener to previous
    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    // add an event listener to previous
    next.addEventListener("click", () => {
        console.log("Next clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    // add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100")
        currentsong.volume = parseInt(e.target.value) / 100;
        if(currentsong.volume > 0){
            document.querySelector(".volume>img").src =document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })

    // add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }
    })

}

main()


