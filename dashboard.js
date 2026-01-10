import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// === Sidebar Menu ===
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

// === Logout ===
document.getElementById("logoutBtn").onclick = async () => {
  try {
    await signOut(auth);
    location.href="/index.html";
  } catch(err) {
    alert("Logout failed: " + err.message);
  }
};

// === Quill Editors ===
let quill, questionQuill, solutionQuill;
document.addEventListener("DOMContentLoaded", () => {
  quill = new Quill('#editor', {theme:'snow'});
  questionQuill = new Quill('#questionEditor', {theme:'snow'});
  solutionQuill = new Quill('#solutionEditor', {theme:'snow'});
});

// === Global edit IDs ===
let editArticleId = null;
let editQuestionId = null;

// === Publish Article ===
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

  try {
    if(editArticleId){
      await updateDoc(doc(db,"articles",editArticleId), data);
      alert("Article Updated!");
      editArticleId = null;
    } else {
      await addDoc(collection(db,"articles"), data);
      alert("Article Published!");
    }
    loadArticles();
  } catch(err){
    alert("Publish failed: " + err.message);
  }
};

// === Publish Question ===
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

  if(!data.exam || !data.board || !data.year || !data.subject || !data.slug){
    alert("Fill all fields");
    return;
  }

  try{
    if(editQuestionId){
      await updateDoc(doc(db,"boardQuestions",editQuestionId), data);
      alert("Question Updated!");
      editQuestionId = null;
    } else {
      await addDoc(collection(db,"boardQuestions"), data);
      alert("Question Published!");
    }
    loadQuestions();
  } catch(err){
    alert("Publish failed: " + err.message);
  }
};

// === Load Articles ===
async function loadArticles(){
  const list = document.getElementById("articleList");
  list.innerHTML="";
  try{
    const snap = await getDocs(collection(db,"articles"));
    snap.forEach(d=>{
      const div = document.createElement("div");
      div.className="cms-list-item";
      div.innerHTML = `
        <span>${d.data().title}</span>
        <div>
          <button data-edit="${d.id}">Edit</button>
          <button data-del="${d.id}">Delete</button>
        </div>`;
      div.querySelector("[data-edit]").onclick = ()=>editArticle(d.id);
      div.querySelector("[data-del]").onclick = ()=>deleteArticle(d.id);
      list.appendChild(div);
    });
  } catch(err){
    alert("Failed to load articles: " + err.message);
  }
}

// === Load Questions ===
async function loadQuestions(){
  const list = document.getElementById("questionList");
  list.innerHTML="";
  try{
    const snap = await getDocs(collection(db,"boardQuestions"));
    snap.forEach(d=>{
      const div = document.createElement("div");
      div.className="cms-list-item";
      div.innerHTML = `
        <span>${d.data().exam} | ${d.data().board} | ${d.data().year}</span>
        <div>
          <button data-edit="${d.id}">Edit</button>
          <button data-del="${d.id}">Delete</button>
        </div>`;
      div.querySelector("[data-edit]").onclick = ()=>editQuestion(d.id);
      div.querySelector("[data-del]").onclick = ()=>deleteQuestion(d.id);
      list.appendChild(div);
    });
  } catch(err){
    alert("Failed to load questions: " + err.message);
  }
}

// === Edit Article ===
async function editArticle(id){
  try{
    const d = await getDoc(doc(db,"articles",id));
    const data = d.data();
    document.getElementById("title").value = data.title;
    document.getElementById("slug").value = data.slug;
    document.getElementById("category").value = data.category;
    document.getElementById("subject").value = data.subject;
    document.getElementById("image").value = data.image;
    quill.root.innerHTML = data.content;

    editArticleId = id; // <-- important

    document.querySelectorAll(".cms-section").forEach(s=>s.style.display="none");
    document.getElementById("edit-article-section").style.display="block";
  } catch(err){
    alert("Failed to load article: " + err.message);
  }
}

// === Edit Question ===
async function editQuestion(id){
  try{
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

    editQuestionId = id; // <-- important

    document.querySelectorAll(".cms-section").forEach(s=>s.style.display="none");
    document.getElementById("edit-question-section").style.display="block";
  } catch(err){
    alert("Failed to load question: " + err.message);
  }
}

// === Delete Article ===
async function deleteArticle(id){
  if(!confirm("Delete Article?")) return;
  try{
    await deleteDoc(doc(db,"articles",id));
    loadArticles();
  } catch(err){
    alert("Delete failed: " + err.message);
  }
}

// === Delete Question ===
async function deleteQuestion(id){
  if(!confirm("Delete Question?")) return;
  try{
    await deleteDoc(doc(db,"boardQuestions",id));
    loadQuestions();
  } catch(err){
    alert("Delete failed: " + err.message);
  }
}

// === Auth Guard ===
onAuthStateChanged(auth, user=>{
  if(!user) location.href="/index.html";
  else {
    loadArticles();
    loadQuestions();
  }
});
