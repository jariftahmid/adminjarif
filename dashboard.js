import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Sidebar menu logic
const sections = {
  "add-article-btn":"add-article-section",
  "add-question-btn":"add-question-section",
  "edit-article-btn":"edit-article-section",
  "edit-question-btn":"edit-question-section"
};

Object.keys(sections).forEach(btnId => {
  document.getElementById(btnId).onclick = () => {
    document.querySelectorAll(".cms-section").forEach(s => s.style.display="none");
    document.getElementById(sections[btnId]).style.display="block";
  };
});

// Logout
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  location.href="/index.html";
};

// Quill editors
let quill, questionQuill, solutionQuill;
document.addEventListener("DOMContentLoaded", () => {
  quill = new Quill('#editor', {theme:'snow'});
  questionQuill = new Quill('#questionEditor', {theme:'snow'});
  solutionQuill = new Quill('#solutionEditor', {theme:'snow'});
});

// Custom Select Logic
function setupCustomSelect(selectDivId, optionsDivId) {
  const selectDiv = document.getElementById(selectDivId);
  const optionsDiv = document.getElementById(optionsDivId);
  selectDiv.onclick = () => optionsDiv.style.display = optionsDiv.style.display === "block" ? "none" : "block";
  optionsDiv.querySelectorAll("div").forEach(opt => {
    opt.onclick = () => {
      selectDiv.innerText = opt.dataset.value;
      selectDiv.dataset.value = opt.dataset.value;
      optionsDiv.style.display = "none";
    };
  });
}

setupCustomSelect("exam-div","exam-options");
setupCustomSelect("board-div","board-options");

// Publish Article
document.getElementById("publish-article-btn").onclick = async () => {
  const data = {
    title: document.getElementById("title").value,
    slug: document.getElementById("slug").value,
    category: document.getElementById("category").value,
    subject: document.getElementById("subject").value,
    image: document.getElementById("image").value,
    content: quill.root.innerHTML,
    createdAt: new Date()
  };
  if(!data.title || !data.slug) { alert("Fill title & slug"); return; }
  await addDoc(collection(db,"articles"), data);
  alert("Article Published!");
  loadArticles();
};

// Publish Question
document.getElementById("publish-question-btn").onclick = async () => {
  const data = {
    exam: document.getElementById("exam-div").dataset.value,
    board: document.getElementById("board-div").dataset.value,
    year: document.getElementById("year").value,
    subject: document.getElementById("subject-q").value,
    slug: document.getElementById("slug-q").value,
    question: questionQuill.root.innerHTML,
    solution: solutionQuill.root.innerHTML,
    createdAt: new Date()
  };
  if(!data.exam || !data.board || !data.year || !data.subject || !data.slug) {
    alert("Fill all fields");
    return;
  }
  await addDoc(collection(db,"boardQuestions"), data);
  alert("Question Published!");
  loadQuestions();
};

// Load Articles
async function loadArticles() {
  const list = document.getElementById("articleList");
  list.innerHTML="";
  const snap = await getDocs(collection(db,"articles"));
  snap.forEach(d=>{
    const div=document.createElement("div");
    div.innerHTML = `
      <span>${d.data().title}</span>
      <div>
        <button data-edit="${d.id}">Edit</button>
        <button data-del="${d.id}">Delete</button>
      </div>`;
    div.querySelector("[data-edit]").onclick = () => editArticle(d.id);
    div.querySelector("[data-del]").onclick = () => deleteArticle(d.id);
    list.appendChild(div);
  });
}

// Load Questions
async function loadQuestions() {
  const list = document.getElementById("questionList");
  list.innerHTML="";
  const snap = await getDocs(collection(db,"boardQuestions"));
  snap.forEach(d=>{
    const div=document.createElement("div");
    div.innerHTML = `
      <span>${d.data().exam} ${d.data().board} ${d.data().year} - ${d.data().subject}</span>
      <div>
        <button data-edit="${d.id}">Edit</button>
        <button data-del="${d.id}">Delete</button>
      </div>`;
    div.querySelector("[data-edit]").onclick = () => editQuestion(d.id);
    div.querySelector("[data-del]").onclick = () => deleteQuestion(d.id);
    list.appendChild(div);
  });
}

// Edit Article
async function editArticle(id) {
  const d = await getDoc(doc(db,"articles",id));
  const data = d.data();
  document.getElementById("title").value = data.title;
  document.getElementById("slug").value = data.slug;
  document.getElementById("category").value = data.category;
  document.getElementById("subject").value = data.subject;
  document.getElementById("image").value = data.image;
  quill.root.innerHTML = data.content;
  document.querySelectorAll(".cms-section").forEach(s => s.style.display="none");
  document.getElementById("edit-article-section").style.display="block";
}

// Edit Question
async function editQuestion(id) {
  const d = await getDoc(doc(db,"boardQuestions",id));
  const data = d.data();
  document.getElementById("exam-div").innerText = data.exam;
  document.getElementById("exam-div").dataset.value = data.exam;
  document.getElementById("board-div").innerText = data.board;
  document.getElementById("board-div").dataset.value = data.board;
  document.getElementById("year").value = data.year;
  document.getElementById("subject-q").value = data.subject;
  document.getElementById("slug-q").value = data.slug;
  questionQuill.root.innerHTML = data.question;
  solutionQuill.root.innerHTML = data.solution;
  document.querySelectorAll(".cms-section").forEach(s => s.style.display="none");
  document.getElementById("edit-question-section").style.display="block";
}

// Delete Article
async function deleteArticle(id){
  if(!confirm("Delete Article?")) return;
  await deleteDoc(doc(db,"articles",id));
  loadArticles();
}

// Delete Question
async function deleteQuestion(id){
  if(!confirm("Delete Question?")) return;
  await deleteDoc(doc(db,"boardQuestions",id));
  loadQuestions();
}

// Auth Guard
onAuthStateChanged(auth, user => {
  if(!user) location.href="/index.html";
  else { loadArticles(); loadQuestions(); }
});
