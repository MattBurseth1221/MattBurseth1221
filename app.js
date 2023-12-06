// Spotify API credentials
const CLIENT_ID = "b7a28fe4fa8e4a13846d6dd5579fd5f9";
const REDIRECT_URI = "http://localhost:5502/index.html";
const SCOPES = ["user-read-private", "user-read-email", "user-top-read"];

const WORDNIK_API_KEY = "vi2bx8wan21fjdix6j7aqiiejjhp5a01i8konq6k9b1us4rvo";

const BASE_API_CALL = "https://api.spotify.com.";
const SPOTIFY_SEARCH_CALL = "https://api.spotify.com/v1/search?";
var APIResponse;
var accessToken = "null";
var refreshToken = "null";
var accessCode = "null";
localStorage.setItem("accessToken", "null");

const maxDisplaySongs = 15;

// Function to handle Spotify login
function loginToSpotify() {
  // Generate the Spotify authentication URL
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${SCOPES.join("%20")}`;
  // Open the authentication URL in a new window
  window.open(authUrl, "_self");
}

async function callNode() {
  const result = await fetch("http://localhost:8443", {
    method: "GET",
  }).then((res) => res.json());
  // .then((response) => response.json());

  console.log(result);
}

function loginToSpotifyAccessCode() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${SCOPES.join("%20")}`;
  // Open the authentication URL in a new window
  window.open(authUrl, "_self");
}

function getAccessCodeFromHash() {
  const urlParams = new URLSearchParams(window.location.hash.substr(1));
  const accessCodeOld = urlParams.get("code");
  console.log(window.location.hash);

  localStorage.setItem("accessCode", accessCodeOld);
  accessCode = accessCodeOld;
  console.log("access code received");
}

function getAccessTokenFromHash() {
  const urlParams = new URLSearchParams(window.location.hash.substr(1));
  const accessTokenOld = urlParams.get("access_token");
  const refreshTokenOld = urlParams.get("refresh_token");

  if (localStorage.getItem("accessToken") == "null") {
    localStorage.setItem("accessToken", accessTokenOld);
    accessToken = accessTokenOld;
    console.log("access token changed: " + localStorage.getItem("accessToken"));
  }

  localStorage.setItem("refreshToken", refreshTokenOld);
  refreshToken = refreshTokenOld;
  console.log("refresh token changed: " + refreshTokenOld);
}

// if (accessToken == "null") {
//   getAccessTokenFromHash();
//   accessToken = localStorage.getItem("accessToken");
// }

// Display the access token in a paragraph tag
async function success() {
  if (accessToken != "null") {
    APIResponse = await fetchProfile(accessToken);

    document.getElementById("profile-name-span").textContent =
      APIResponse.display_name;
    document.getElementById("profile-country-span").textContent =
      APIResponse.country;
  } else {
    // accessTokenParagraph.textContent =
    //   "No Access Token found, please log in to Spotify on the Services page.";
  }
  //document.body.appendChild(accessTokenParagraph);
}

async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

async function fetchWordnikAPI(endpoint) {
  const result = await fetch(`https://api.wordnik.com/v4/${endpoint}`);

  return result.json();
}

async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method,
    body: JSON.stringify(body),
  });

  return res.json();
}

async function getTopSongs(numSongs) {
  return await fetchWebApi(
    `v1/me/top/tracks?time_range=short_term&limit=${numSongs}`,
    "GET"
  );
}

async function showTopSongs() {
  if (accessToken != "null") {
    var numSongs = Number(
      document.getElementById("number-of-display-songs").value
    );

    //check if value in text box is a number/within the correct range
    if (!Number.isFinite(numSongs)) {
      numSongs = 5;
    } else if (numSongs > maxDisplaySongs) {
      numSongs = maxDisplaySongs;
    } else if (numSongs < 3) {
      numSongs = 3;
    }

    //request API here
    const result = await getTopSongs(numSongs);

    if (document.getElementById("test-list-section") != null) {
      document.getElementById("test-list-section").remove();
    }

    var test = document.createElement("section");
    test.setAttribute("id", "test-list-section");

    document.getElementById("top-songs").appendChild(test);
    var ol = document.createElement("ol");
    ol.setAttribute("id", "test-list");
    test.appendChild(ol);

    for (let i = 0; i < result.items.length; i++) {
      var li = document.createElement("li");
      ol.appendChild(li);
      li.innerHTML =
        result.items[i].name + " - " + result.items[i].artists[0].name;
    }

    document.getElementById("top-songs-replace").textContent = "Info Printed";

    var audio = document.createElement("audio");
    var source = document.createElement("source");
    source.setAttribute(
      "src",
      "https://p.scdn.co/mp3-preview/c85bc2fe71a4e2e002376c04b771cbb6be6438e6?cid=b7a28fe4fa8e4a13846d6dd5579fd5f9"
    );

    audio.appendChild(source);
    test.appendChild(audio);
  } else {
    console.log("Error! No Access Token!");
  }
}

async function getTrack() {
  if (accessToken != "null") {
    var categories = await fetchWebApi(
      "v1/tracks/11dFghVXANMlKmJXsNCbNl",
      "GET"
    );
  }
}

async function getRandomWord() {
  const result = await fetchWordnikAPI(
    `words.json/randomWord?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=2&maxLength=-1&api_key=${WORDNIK_API_KEY}`
  );

  document.getElementById("random-word").textContent =
    result.word.toLowerCase();
}

function setSuccessSpan() {
  const successSpan = document.getElementById("successSpan");

  successSpan.textContent = "Success";
}

window.addEventListener("load", () => {
  // getAccessTokenFromHash();
  getAccessCodeFromHash();

  if (accessCode != "null") {
    console.log(accessCode);
  }

  // if (localStorage.getItem("accessToken") != "null") {
  //   success();
  // } else {
  //   console.log("Login to Spotify");
  // }
});

async function printArtistSearch() {
  var artistName = document.getElementById("number-of-display-songs").value;
  var artistList;

  if (artistName === "") {
    alert("No artist given.");
    return;
  }

  const params = {
    q: artistName,
    type: "artist",
    limit: 8,
  };

  var url = new URL(SPOTIFY_SEARCH_CALL);

  url.search = new URLSearchParams(params).toString();

  const result = await searchForArtist(url)
    .then((response) => response.json())
    .then((artist) => {
      artistList = artist.artists.items;
    });

  // for (let i = 0; i < artistList.length; i++) {
  //   console.log(artistList[i].name);
  // }

  if (document.getElementById("test-list-section") != null) {
    document.getElementById("test-list-section").remove();
  }

  var test = document.createElement("div");
  test.setAttribute("id", "test-list-section");

  document.getElementById("top-songs").appendChild(test);
  var ol = document.createElement("ol");
  ol.setAttribute("id", "test-list");
  test.appendChild(ol);

  for (let i = 0; i < artistList.length; i++) {
    var li = document.createElement("li");

    var image = document.createElement("img");
    //console.log(artistList[i].images[0].url);

    if (artistList[i].images.length >= 2) {
      image.setAttribute("src", artistList[i].images[2].url);
    } else {
      image.setAttribute("src", "styles/x-image.png");
    }

    image.classList.add("artist-photo");
    li.appendChild(image);

    li.appendChild(document.createTextNode(" - " + artistList[i].name));

    ol.appendChild(li);
  }

  document.getElementById("top-songs-replace").textContent = "Info Printed";
}

async function searchForArtist(url) {
  return await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
