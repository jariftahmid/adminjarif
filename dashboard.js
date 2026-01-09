import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import { auth, db } from "./firebase.js";

// DOM elements
const titleInput = document.getElementById("title");
const slugInput = document.getElementById("slug");
const categoryInput = document.getElementById("category");
const subjectInput = document.getElementById("subject");
const imageInput = document.getElementById("image");
const publishBtn = document.getElementById("publish-btn");
const articleList = document.getElementById("articleList");
const logoutBtn = document.getElementById("logoutBtn");

// Initialize Quill editor
const quill = new Quill('#editor', { theme: 'snow' });

let editId = null;

// ------------------- AUTH GUARD -------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Login required");
    location.href = "/index.html";
  } else {
    loadArticles();
  }
});

// ------------------- LOGOUT -------------------
logoutBtn.onclick = async () => {
  await signOut(auth);
  location.href = "/index.html";
};

// ------------------- PUBLISH / UPDATE ARTICLE -------------------
publishBtn.onclick = async () => {
  const data = {
    title: titleInput.value.trim(),
    slug: slugInput.value.trim(),
    category: categoryInput.value.trim(),
    subject: subjectInput.value.trim(),
    image: imageInput.value.trim(),
    content: quill.root.innerHTML,
    published: true,
    createdAt: new Date()
  };

  if (!data.title || !data.slug) {
    alert("Title & Slug are required!");
    return;
  }

  try {
    if (editId) {
      // Update article
      await updateDoc(doc(db, "articles", editId), data);
      editId = null;
      publishBtn.innerText = "Publish Article";
    } else {
      // Add new article
      await addDoc(collection(db, "articles"), data);
    }

    alert("Article saved successfully!");
    clearForm();
    loadArticles();

  } catch (err) {
    alert("Error: " + err.message);
  }
};

// ------------------- LOAD ARTICLES -------------------
async function loadArticles() {
  articleList.innerHTML = "Loading articles...";
  try {
    const snap = await getDocs(collection(db, "articles"));
    articleList.innerHTML = "";

    if (snap.empty) {
      articleList.innerHTML = "<p>No articles found.</p>";
      return;
    }

    snap.forEach(d => {
      const div = document.createElement("div");
      div.className = "article-item";
      div.innerHTML = `
        <span>${d.data().title}</span>
        <div>
          <button data-edit="${d.id}">Edit</button>
          <button data-del="${d.id}">Delete</button>
        </div>
      `;

      div.querySelector("[data-edit]").onclick = () => editArticle(d.id);
      div.querySelector("[data-del]").onclick = () => deleteArticle(d.id);

      articleList.appendChild(div);
    });

  } catch (err) {
    articleList.innerHTML = `<p>Error loading articles: ${err.message}</p>`;
    console.error(err);
  }
}

// ------------------- EDIT ARTICLE -------------------
async function editArticle(id) {
  const snap = await getDoc(doc(db, "articles", id));
  const d = snap.data();

  titleInput.value = d.title || "";
  slugInput.value = d.slug || "";
  categoryInput.value = d.category || "";
  subjectInput.value = d.subject || "";
  imageInput.value = d.image || "";
  quill.root.innerHTML = d.content || "";

  editId = id;
  publishBtn.innerText = "Update Article";
}

// ------------------- DELETE ARTICLE -------------------
async function deleteArticle(id) {
  if (!confirm("Are you sure you want to delete this article?")) return;
  try {
    await deleteDoc(doc(db, "articles", id));
    alert("Article deleted!");
    loadArticles();
  } catch (err) {
    alert("Delete failed: " + err.message);
  }
}

// ------------------- CLEAR FORM -------------------
function clearForm() {
  titleInput.value = "";
  slugInput.value = "";
  categoryInput.value = "";
  subjectInput.value = "";
  imageInput.value = "";
  quill.root.innerHTML = "";
  publishBtn.innerText = "Publish Article";
}
