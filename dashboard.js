import { collection, addDoc } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

const publishBtn = document.getElementById("publish-btn");

// Auth guard (ensure admin logged in)
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

onAuthStateChanged(window.auth, user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

publishBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const board = document.getElementById("board").value;
  const summary = document.getElementById("summary").value;
  const content = document.getElementById("content").value;
  const file = document.getElementById("image").files[0];

  if (!title || !category || !board || !summary || !content || !file) {
    alert("All fields are required!");
    return;
  }

  try {
    // Upload image to Firebase Storage
    const imgRef = ref(window.storage, "articles/" + Date.now());
    await uploadBytes(imgRef, file);
    const imageURL = await getDownloadURL(imgRef);

    // Save article to Firestore
    await addDoc(collection(window.db, "articles"), {
      title,
      category,
      board,
      summary,
      content,
      image: imageURL,
      date: new Date()
    });

    alert("Article Published Successfully!");

    // Clear form
    document.getElementById("title").value = "";
    document.getElementById("category").value = "";
    document.getElementById("board").value = "";
    document.getElementById("summary").value = "";
    document.getElementById("content").value = "";
    document.getElementById("image").value = "";
  } catch (err) {
    alert("Error: " + err.message);
  }
});
