import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
// auth gaurd
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // ❌ Not logged in
    window.location.href = "/index.html"; // login page
  }
});

const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const imageInput = document.getElementById("image");
const contentInput = document.getElementById("content");
const publishBtn = document.getElementById("publish-btn");
const articleList = document.getElementById("articleList");

// 🔹 ADD ARTICLE
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

    titleInput.value = "";
    categoryInput.value = "";
    imageInput.value = "";
    contentInput.value = "";

    loadArticles();
  } catch (err) {
    alert("Error: " + err.message);
  }
});

// 🔹 LOAD ARTICLES
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
}

// 🔹 DELETE ARTICLE
window.deleteArticle = async function (id) {
  const confirmDelete = confirm("Are you sure?");
  if (!confirmDelete) return;

  await deleteDoc(doc(db, "articles", id));
  alert("Article Deleted!");
  loadArticles();
};

// Initial load
loadArticles();
