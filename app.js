// Spotify API credentials
const CLIENT_ID = "b7a28fe4fa8e4a13846d6dd5579fd5f9";
const REDIRECT_URI = "http://127.0.0.1:8443/callback";
const SCOPES = ["user-read-private", "user-read-email", "user-top-read"];
const nodeServer = "http://localhost:8443";
var accessCode = "null";
var state;

const maxDisplaySongs = 15;

const generateRandomString = (length) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const codeVerifier = generateRandomString(64);

async function callNode() {
  const result = await fetch("http://localhost:8443/request-files", {
    method: "GET",
  }).then((res) => res.json());
  // .then((response) => response.json());

  console.log(result);
}

async function loginToSpotifyAccessCode() {
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  localStorage.setItem("code_verifier", codeVerifier);
  passCodeVerifier();
  console.log("sent code verifier");

  const params = {
    response_type: "code",
    client_id: CLIENT_ID,
    SCOPES,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: REDIRECT_URI,
  };

  let authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.search = new URLSearchParams(params).toString();

  window.open(authUrl, "_self");
}

async function passCodeVerifier() {
  console.log("posting code verifier");

  const rawResponse = await fetch(nodeServer + "/verifier-code", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      test_data: "test",
      code_verifier: codeVerifier,
    }),
  });

  const content = await rawResponse.json();

  console.log(content);
}

// function getAccessCodeFromHash() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const accessCodeOld = urlParams.get("code");

//   localStorage.setItem("accessCode", accessCodeOld);
//   accessCode = accessCodeOld;
// }

// function getAccessTokenFromHash() {
//   const urlParams = new URLSearchParams(window.location.hash.substr(1));
//   const accessTokenOld = urlParams.get("access_token");
//   const refreshTokenOld = urlParams.get("refresh_token");

//   if (localStorage.getItem("accessToken") == "null") {
//     localStorage.setItem("accessToken", accessTokenOld);
//     accessToken = accessTokenOld;
//     console.log("access token changed: " + localStorage.getItem("accessToken"));
//   }

//   localStorage.setItem("refreshToken", refreshTokenOld);
//   refreshToken = refreshTokenOld;
//   console.log("refresh token changed: " + refreshTokenOld);
// }

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

async function printArtistSearch() {
  var artistName = document.getElementById("artist-search-bar").value;
  var artistList = await fetch(nodeServer + `/spotify-api/${artistName}`).then(
    (response) => response.json()
  );

  artistList = artistList.items;

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

    if (artistList[i].images.length >= 3) {
      console.log(artistList[i].images[2].url);
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

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};
