async function signUpUser(formData) {
  console.log("formdata: " + formData);

  localStorage.setItem(
    "formData",
    JSON.stringify(Object.fromEntries(formData))
  );

  const signupResult = await fetch(nodeServer + `/signup`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(formData)),
  }).then((response) => response.json());

  var signupMessage = document.getElementById("signup-error");
  localStorage.setItem("signup", signupResult);

  if ("error" in signupResult) {
    signupMessage.textContent = signupResult.error;
    signupMessage.style.color = "red";

    //window.location.href = MAIN_SITE;

    // Back out of function, let user try another username
    window.location.href = MAIN_SITE;
  } else {
    signupMessage.textContent = signupResult.success;
    signupMessage.style.color = "green";

    window.setTimeout(function () {
      // Move to a new location or you can do something else
      window.location.href = MAIN_SITE;
    }, 3000);
  }
}

// document.querySelector("form").addEventListener("submit", (e) => {
//   signUpUser(new FormData(e.target));
// });
