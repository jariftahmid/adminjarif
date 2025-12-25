import { collection, addDoc } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const publishBtn = document.getElementById("publish-btn");

  // Auth guard
  onAuthStateChanged(window.auth, user => {
    if (!user) {
      alert("You must login first!");
      window.location.href = "index.html";
    }
  });

  publishBtn.addEventListener("click", async () => {
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const board = document.getElementById("board").value;
    const summary = document.getElementById("summary").value;
    const content = document.getElementById("content").value;
    const imageURL = document.getElementById("image-url").value;

    if (!title || !category || !board || !summary || !content || !imageURL) {
      return alert("All fields are required");
    }

    try {
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
      document.getElementById("image-url").value = "";
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
});
