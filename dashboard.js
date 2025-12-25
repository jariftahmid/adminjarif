import { collection, addDoc } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const publishBtn = document.getElementById("publish-btn");

// Redirect to login if not logged in
onAuthStateChanged(window.auth, user => {
  if (!user) window.location.href = "index.html";
});

publishBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const board = document.getElementById("board").value;
  const summary = document.getElementById("summary").value;
  const content = document.getElementById("content").value;
  const file = document.getElementById("image").files[0];

  if (!title || !category || !board || !summary || !content || !file) {
    return alert("All fields are required");
  }

  try {
    // Upload Image
    const imgRef = ref(window.storage, "articles/" + Date.now() + "-" + file.name);
    await uploadBytes(imgRef, file);
    const imageURL = await getDownloadURL(imgRef);

    // Save Article
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
    
    // Clear Form
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
