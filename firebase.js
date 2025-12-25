import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyChrKBpyRSLhkmVMy3c1gdWBp4_grrrphA",
  authDomain: "boardques.firebaseapp.com",
  projectId: "boardques",
  storageBucket: "boardques.firebasestorage.app",
  messagingSenderId: "496679352856",
  appId: "1:496679352856:web:1d62a3a23b7fec669ce16d",
  measurementId: "G-7GGLSZZS1H"
};

const app = initializeApp(firebaseConfig);

window.auth = getAuth(app);
window.db = getFirestore(app);
