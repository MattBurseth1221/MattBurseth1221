// import nodeServer from "./app.js";

const nodeServer = "http://localhost:8443";
const MAIN_SITE = "http://localhost:5502/index.html";

async function signUpUser(formData) {
  const signupResult = await fetch(nodeServer + "/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(formData)),
  }).then((response) => response.json());

  var signupMessage = document.getElementById("signup-error");

  if ("error" in signupResult) {
    signupMessage.textContent = signupResult.error;
    signupMessage.style.color = "red";

    //window.location.href = MAIN_SITE;

    // Back out of function, let user try another username
    return;
  } else {
    signupMessage.textContent = signupResult.success;
    signupMessage.style.color = "green";

    window.setTimeout(function () {
      // Move to a new location or you can do something else
      window.location.href = MAIN_SITE;
    }, 3000);
  }
}

async function loginUser(formData) {
  // const loginResult = await fetch(nodeServer + "/login", {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(Object.fromEntries(formData)),
  // }).then((response) => response.json());

  const loginResult = await fetch(
    `${nodeServer}/login?` + new URLSearchParams(Object.fromEntries(formData))
  );

  var loginMessage = document.getElementById("login-error");

  if ("error" in loginResult) {
    loginMessage.textContent = loginResult.error;
    loginMessage.style.color = "red";
  } else {
    loginMessage.textContent = loginResult.success;
    loginMessage.style.color = "green";

    window.setTimeout(function () {
      window.location.href = MAIN_SITE;
    }, 3000);
  }
}

// document.getElementById("signup-form").addEventListener("submit", (e) => {
//   e.preventDefault();

//   signUpUser(new FormData(e.target));
// });

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  loginUser(new FormData(e.target));
});
