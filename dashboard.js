import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc }
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { onAuthStateChanged, signOut }
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import { auth, db } from "./firebase.js";

// DOM
const titleInput = document.getElementById("title");
const slugInput = document.getElementById("slug");
const categoryInput = document.getElementById("category");
const subjectInput = document.getElementById("subject");
const imageInput = document.getElementById("image");
const publishBtn = document.getElementById("publish-btn");
const articleList = document.getElementById("articleList");
const logoutBtn = document.getElementById("logoutBtn");

// Editor
const quill = new Quill('#editor', { theme: 'snow' });

let editId = null;

// 🔐 AUTH GUARD
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Login required");
    location.href = "/index.html";
  } else {
    loadArticles();
  }
});

// LOGOUT
logoutBtn.onclick = async () => {
  await signOut(auth);
  location.href = "/index.html";
};

// PUBLISH / UPDATE
publishBtn.onclick = async () => {
  const data = {
    title: titleInput.value,
    slug: slugInput.value,
    category: categoryInput.value,
    subject: subjectInput.value,
    image: imageInput.value,
    content: quill.root.innerHTML,
    published: true,
    createdAt: new Date()
  };

  if (!data.title || !data.slug) {
    alert("Title & slug required");
    return;
  }

  if (editId) {
    await updateDoc(doc(db, "articles", editId), data);
    editId = null;
    publishBtn.innerText = "Publish";
  } else {
    await addDoc(collection(db, "articles"), data);
  }

  clearForm();
  loadArticles();
};

// LOAD ARTICLES
async function loadArticles() {
  articleList.innerHTML = "";
  const snap = await getDocs(collection(db, "articles"));

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
}

// EDIT
async function editArticle(id) {
  const snap = await getDoc(doc(db, "articles", id));
  const d = snap.data();

  titleInput.value = d.title;
  slugInput.value = d.slug;
  categoryInput.value = d.category;
  subjectInput.value = d.subject;
  imageInput.value = d.image;
  quill.root.innerHTML = d.content;

  editId = id;
  publishBtn.innerText = "Update";
}

// DELETE
async function deleteArticle(id) {
  if (!confirm("Delete article?")) return;
  await deleteDoc(doc(db, "articles", id));
  loadArticles();
}

// CLEAR
function clearForm() {
  titleInput.value = "";
  slugInput.value = "";
  categoryInput.value = "";
  subjectInput.value = "";
  imageInput.value = "";
  quill.root.innerHTML = "";
}
