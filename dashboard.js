import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// DOM elements
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const imageInput = document.getElementById("image");
const contentInput = document.getElementById("content");
const publishBtn = document.getElementById("publish-btn");
const articleList = document.getElementById("articleList");

// 🔐 AUTH GUARD
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("You must be logged in to access the dashboard!");
      window.location.href = "/index.html"; // Redirect to login
    } else {
      console.log("User logged in:", user.email);
      loadDashboard();
    }
  });
});

// 🔹 MAIN FUNCTION TO LOAD DASHBOARD
async function loadDashboard() {

  // ✅ PUBLISH ARTICLE
  publishBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const category = categoryInput.value.trim();
    const image = imageInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !category || !image || !content) {
      alert("All fields are required!");
      return;
    }

    try {
      await addDoc(collection(db, "articles"), {
        title,
        category,
        image,
        content,
        date: new Date()
      });

      alert("Article Published Successfully!");

      // Clear inputs
      titleInput.value = "";
      categoryInput.value = "";
      imageInput.value = "";
      contentInput.value = "";

      loadArticles(); // Refresh list
    } catch (err) {
      alert("Error: " + err.message);
    }
  });

  // ✅ LOAD ARTICLE LIST + DELETE BUTTON
  await loadArticles();
}

// 🔹 LOAD ARTICLES FUNCTION
async function loadArticles() {
  articleList.innerHTML = "Loading...";

  const snapshot = await getDocs(collection(db, "articles"));
  articleList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "article-item";

    div.innerHTML = `
      <div>
        <strong>${data.title}</strong><br>
        <small>${data.category}</small>
      </div>
      <button class="delete-btn" onclick="deleteArticle('${id}')">Delete</button>
    `;

    articleList.appendChild(div);
  });

  if (snapshot.empty) {
    articleList.innerHTML = "<p>No articles found.</p>";
  }
}

// 🔹 DELETE ARTICLE FUNCTION
window.deleteArticle = async function (id) {
  const confirmDelete = confirm("Are you sure you want to delete this article?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "articles", id));
    alert("Article deleted successfully!");
    loadArticles();
  } catch (err) {
    alert("Delete failed: " + err.message);
  }
}
