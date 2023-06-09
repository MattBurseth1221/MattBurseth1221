// Spotify API credentials
const CLIENT_ID = 'b7a28fe4fa8e4a13846d6dd5579fd5f9';
const REDIRECT_URI = 'http://127.0.0.1:5500/index.html';
const SCOPES = ['user-read-private', 'user-read-email', 'user-top-read'];

const WORDNIK_API_KEY = 'vi2bx8wan21fjdix6j7aqiiejjhp5a01i8konq6k9b1us4rvo';

const BASE_API_CALL = 'https://api.spotify.com.';
var APIResponse;
var accessToken = 'null';
localStorage.setItem('accessToken', 'null');

// Function to handle Spotify login
function loginToSpotify() {
  // Generate the Spotify authentication URL
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES.join('%20')}`;
  // Open the authentication URL in a new window
  window.open(authUrl, '_self');
}

function getAccessTokenFromHash() {
  const urlParams = new URLSearchParams(window.location.hash.substr(1));
  const accessTokenOld = urlParams.get('access_token');

  if (localStorage.getItem('accessToken') == 'null') {
    localStorage.setItem('accessToken', accessTokenOld);
    console.log("access token changed: " + localStorage.getItem('accessToken'));
  }
}

if (accessToken == 'null') {
  getAccessTokenFromHash();
  accessToken = localStorage.getItem('accessToken');
  
}

// Display the access token in a paragraph tag
async function success() {
  const accessTokenParagraph = document.getElementById('hasToken');

  if (accessToken != 'null') {
    accessTokenParagraph.textContent = 'Access token received!';
    console.log(accessToken);

    APIResponse = await fetchProfile(accessToken);

    document.getElementById('profile-name-span').textContent = APIResponse.display_name;
    document.getElementById('profile-country-span').textContent = APIResponse.country;
  } else {
    accessTokenParagraph.textContent = 'No Access Token found, please log in to Spotify on the Services page.';
  }
  //document.body.appendChild(accessTokenParagraph);
}

async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
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
    body:JSON.stringify(body)
  });

  return res;
}

async function getTopSongs() {
  return (await fetchWebApi(
    'v1/me/top/tracks?time_range=short_term&limit=5', 'GET'
  ));
}

async function showTopSongs() {
  if (accessToken != 'null') {
    var topSongs = await getTopSongs();
    console.log(topSongs);
  } else {
    console.log("Error! No Access Token!");
  }
}

async function getTrack() {
  if (accessToken != 'null') {
    var categories = await fetchWebApi('v1/tracks/11dFghVXANMlKmJXsNCbNl', 'GET'
    );
  }
}

async function getRandomWord() {
  const result = await fetchWordnikAPI(`words.json/randomWord?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=2&maxLength=-1&api_key=${WORDNIK_API_KEY}`);

  document.getElementById('random-word').textContent = result.word.toLowerCase();
}
