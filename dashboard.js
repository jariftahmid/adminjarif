import { collection, addDoc, getDocs, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// DOM
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category"); // SSC / HSC
const subjectInput = document.getElementById("subject");   // Physics / Math
const imageInput = document.getElementById("image");
const contentInput = document.getElementById("content");

const publishBtn = document.getElementById("publish-btn");
const articleList = document.getElementById("articleList");
const logoutBtn = document.getElementById("logoutBtn");

// 🔐 Auth guard
onAuthStateChanged(window.auth, (user) => {
  if (!user) {
    alert("You must be logged in!");
    window.location.href = "/index.html";
  } else {
    console.log("Logged in as:", user.email);
    loadDashboard();
  }
});

// 🔹 Logout
logoutBtn.addEventListener("click", () => {
  signOut(window.auth).then(() => {
    window.location.href = "/index.html";
  });
});

// 🔹 Load dashboard
function loadDashboard() {
  publishBtn.addEventListener("click", publishArticle);
  loadArticles();
}

// 🔹 Publish article
async function publishArticle() {
  const title = titleInput.value.trim();
  const category = categoryInput.value.trim(); // SSC / HSC
  const subject = subjectInput.value.trim();   // Physics / Math
  const image = imageInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !category || !subject || !image || !content) {
    alert("All fields are required!");
    return;
  }

  try {
    await addDoc(collection(window.db, "articles"), {
      title,
      category,
      subject,
      image,
      content,
      date: new Date()
    });

    alert("Article Published!");

    titleInput.value = "";
    categoryInput.value = "";
    subjectInput.value = "";
    imageInput.value = "";
    contentInput.value = "";

    loadArticles();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// 🔹 Load articles list
async function loadArticles() {
  articleList.innerHTML = "Loading...";

  const snapshot = await getDocs(collection(window.db, "articles"));
  articleList.innerHTML = "";

  if (snapshot.empty) {
    articleList.innerHTML = "<p>No articles found.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "article-item";

    div.innerHTML = `
      <div>
        <strong>${data.title}</strong><br>
        <small>${data.category} • ${data.subject}</small>
      </div>
      <button class="delete-btn" data-id="${id}">Delete</button>
    `;

    div.querySelector(".delete-btn").addEventListener("click", () => {
      deleteArticle(id);
    });

    articleList.appendChild(div);
  });
}

// 🔹 Delete article
async function deleteArticle(id) {
  if (!confirm("Are you sure you want to delete this article?")) return;

  try {
    await deleteDoc(doc(window.db, "articles", id));
    alert("Article Deleted!");
    loadArticles();
  } catch (err) {
    alert("Delete failed: " + err.message);
  }
}
