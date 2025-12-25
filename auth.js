import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(window.auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
});
