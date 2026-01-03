import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc }
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { onAuthStateChanged, signOut }
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const allowedAdmins = ["jarif@gmail.com"]; // change this

const titleInput = document.getElementById("title");
const slugInput = document.getElementById("slug");
const categoryInput = document.getElementById("category");
const subjectInput = document.getElementById("subject");
const imageInput = document.getElementById("image");
const publishBtn = document.getElementById("publish-btn");
const articleList = document.getElementById("articleList");
const logoutBtn = document.getElementById("logoutBtn");

const quill = new Quill('#editor', { theme: 'snow' });

let editId = null;

// 🔐 Auth guard
onAuthStateChanged(window.auth, user => {
  if (!user || !allowedAdmins.includes(user.email)) {
    alert("Access denied");
    window.location.href = "/index.html";
  } else {
    loadArticles();
  }
});

logoutBtn.onclick = () => {
  signOut(window.auth);
  window.location.href = "/index.html";
};

// Publish / Update
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
    alert("Title & Slug required");
    return;
  }

  if (editId) {
    await updateDoc(doc(window.db, "articles", editId), data);
    alert("Updated");
    editId = null;
    publishBtn.innerText = "Publish";
  } else {
    await addDoc(collection(window.db, "articles"), data);
    alert("Published");
  }

  clearForm();
  loadArticles();
};

function clearForm() {
  titleInput.value = "";
  slugInput.value = "";
  categoryInput.value = "";
  subjectInput.value = "";
  imageInput.value = "";
  quill.root.innerHTML = "";
}

// Load articles
async function loadArticles() {
  articleList.innerHTML = "";
  const snap = await getDocs(collection(window.db, "articles"));

  snap.forEach(d => {
    const div = document.createElement("div");
    div.className = "article-item";
    div.innerHTML = `
      <span>${d.data().title}</span>
      <div>
        <button onclick="editArticle('${d.id}')">Edit</button>
        <button onclick="deleteArticle('${d.id}')">Delete</button>
      </div>
    `;
    articleList.appendChild(div);
  });
}

window.editArticle = async (id) => {
  const ref = doc(window.db, "articles", id);
  const snap = await getDoc(ref);
  const d = snap.data();

  titleInput.value = d.title;
  slugInput.value = d.slug;
  categoryInput.value = d.category;
  subjectInput.value = d.subject;
  imageInput.value = d.image;
  quill.root.innerHTML = d.content;

  editId = id;
  publishBtn.innerText = "Update";
};

window.deleteArticle = async (id) => {
  if (confirm("Delete?")) {
    await deleteDoc(doc(window.db, "articles", id));
    loadArticles();
  }
};
