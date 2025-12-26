import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// DOM
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const imageInput = document.getElementById("image");
const contentInput = document.getElementById("content");
const publishBtn = document.getElementById("publish-btn");
const articleList = document.getElementById("articleList");

// 🔐 Auth guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("You must be logged in to access the dashboard!");
    window.location.href = "/index.html"; // Login page
  } else {
    console.log("Logged in as:", user.email);
    loadDashboard();
  }
});

async function loadDashboard() {

  // ✅ Publish
  publishBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const category = categoryInput.value.trim();
    const image = imageInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !category || !image || !content) {
      alert("All fields required!");
      return;
    }

    try {
      await addDoc(collection(db, "articles"), {
        title, category, image, content, date: new Date()
      });

      alert("Article Published!");
      titleInput.value = "";
      categoryInput.value = "";
      imageInput.value = "";
      contentInput.value = "";

      loadArticles();
    } catch (err) {
      alert("Error: " + err.message);
    }
  });

  // ✅ Load articles
  loadArticles();
}

async function loadArticles() {
  articleList.innerHTML = "Loading...";

  const snapshot = await getDocs(collection(db, "articles"));
  articleList.innerHTML = "";

  snapshot.forEach(docSnap => {
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

  if (snapshot.empty) articleList.innerHTML = "<p>No articles found.</p>";
}

window.deleteArticle = async function(id) {
  const confirmDelete = confirm("Are you sure you want to delete?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "articles", id));
    alert("Deleted!");
    loadArticles();
  } catch (err) {
    alert("Delete failed: " + err.message);
  }
}
