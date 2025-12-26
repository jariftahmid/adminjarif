import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!email || !password){
    alert("Email and password required!");
    return;
  }

  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      return signInWithEmailAndPassword(auth, email, password);
    })
    .then(() => {
      alert("Login successful!");
      window.location.href = "/dashboard.html";
    })
    .catch(err => alert(err.message));
});
