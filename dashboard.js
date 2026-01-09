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
const quill = new Quill('#editor', {theme:'snow'});
const questionQuill = new Quill('#questionEditor', {theme:'snow'});
const solutionQuill = new Quill('#solutionEditor', {theme:'snow'});

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
  await addDoc(collection(db,"articles"), data);
  alert("Article Published!");
  loadArticles();
};

// Publish Question
document.getElementById("publish-question-btn").onclick = async () => {
  const data = {
    title: document.getElementById("q-title").value,
    board: document.getElementById("board").value,
    class: document.getElementById("class").value,
    subject: document.getElementById("subject-q").value,
    chapter: document.getElementById("chapter").value,
    slug: document.getElementById("slug-q").value,
    question: questionQuill.root.innerHTML,
    solution: solutionQuill.root.innerHTML,
    createdAt: new Date()
  };
  await addDoc(collection(db,"boardQuestions"), data);
  alert("Question Published!");
  loadQuestions();
};

// Load Articles for Edit
async function loadArticles(){
  const list = document.getElementById("articleList");
  list.innerHTML="";
  const snap = await getDocs(collection(db,"articles"));
  snap.forEach(d=>{
    const div=document.createElement("div");
    div.innerHTML=`<span>${d.data().title}</span>
    <div>
      <button data-edit="${d.id}">Edit</button>
      <button data-del="${d.id}">Delete</button>
    </div>`;
    div.querySelector("[data-edit]").onclick=()=>editArticle(d.id);
    div.querySelector("[data-del]").onclick=()=>deleteArticle(d.id);
    list.appendChild(div);
  });
}

// Load Questions for Edit
async function loadQuestions(){
  const list = document.getElementById("questionList");
  list.innerHTML="";
  const snap = await getDocs(collection(db,"boardQuestions"));
  snap.forEach(d=>{
    const div=document.createElement("div");
    div.innerHTML=`<span>${d.data().title}</span>
    <div>
      <button data-edit="${d.id}">Edit</button>
      <button data-del="${d.id}">Delete</button>
    </div>`;
    div.querySelector("[data-edit]").onclick=()=>editQuestion(d.id);
    div.querySelector("[data-del]").onclick=()=>deleteQuestion(d.id);
    list.appendChild(div);
  });
}

// EDIT Article
async function editArticle(id){
  const d = await getDoc(doc(db,"articles",id));
  const data = d.data();
  document.getElementById("title").value = data.title;
  document.getElementById("slug").value = data.slug;
  document.getElementById("category").value = data.category;
  document.getElementById("subject").value = data.subject;
  document.getElementById("image").value = data.image;
  quill.root.innerHTML = data.content;
}

// EDIT Question
async function editQuestion(id){
  const d = await getDoc(doc(db,"boardQuestions",id));
  const data = d.data();
  document.getElementById("q-title").value = data.title;
  document.getElementById("board").value = data.board;
  document.getElementById("class").value = data.class;
  document.getElementById("subject-q").value = data.subject;
  document.getElementById("chapter").value = data.chapter;
  document.getElementById("slug-q").value = data.slug;
  questionQuill.root.innerHTML = data.question;
  solutionQuill.root.innerHTML = data.solution;
}

// DELETE Article
async function deleteArticle(id){
  if(!confirm("Delete Article?")) return;
  await deleteDoc(doc(db,"articles",id));
  loadArticles();
}

// DELETE Question
async function deleteQuestion(id){
  if(!confirm("Delete Question?")) return;
  await deleteDoc(doc(db,"boardQuestions",id));
  loadQuestions();
}

// Auth Guard
onAuthStateChanged(auth, user=>{
  if(!user) location.href="/index.html";
  else { loadArticles(); loadQuestions(); }
});
