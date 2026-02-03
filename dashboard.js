import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// === OneSignal Notification Helper (Updated) ===
async function sendOneSignalNotification(title, slug, imageUrl) {
    const APP_ID = "182391e8-72ab-419b-a920-6f7d4f697de6";

    const data = {
        app_id: APP_ID,
        included_segments: ["All"], // "All" এর বদলে "Subscribed Users" ব্যবহার করা ভালো
        headings: { "en": "New Article Published! 📢" },
        contents: { "en": title },
        url: `https://boardques.vercel.app{slug}`,
        chrome_web_image: imageUrl, 
        chrome_web_icon: "https://boardques.vercel.app"
    };

    try {
        // সরাসরি OneSignal এর বদলে আপনার /api/notify লিঙ্ক কল হবে
        const response = await fetch("/api/notify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log("Push Notification Sent Successfully!", result);
        } else {
            console.error("Failed to send notification:", result);
        }
    } catch (error) {
        console.error("Connection Error:", error);
    }
}


// === Quill Editors Initialization ===
let quill, questionQuill, solutionQuill;
document.addEventListener("DOMContentLoaded", () => {
    quill = new Quill('#editor', { theme: 'snow' });
    questionQuill = new Quill('#questionEditor', { theme: 'snow' });
    solutionQuill = new Quill('#solutionEditor', { theme: 'snow' });
});

// === Sidebar Menu Toggling ===
const sections = {
    "add-article-btn": "add-article-section",
    "add-question-btn": "add-question-section",
    "edit-article-btn": "edit-article-section",
    "edit-question-btn": "edit-question-section"
};

Object.keys(sections).forEach(btnId => {
    const btn = document.getElementById(btnId);
    if(btn) {
        btn.onclick = () => showSection(sections[btnId]);
    }
});

function showSection(sectionId) {
    document.querySelectorAll(".cms-section").forEach(s => s.style.display = "none");
    document.getElementById(sectionId).style.display = "block";
}

// === Custom Dropdown Logic ===
function setupDropdown(divId, optionsId) {
    const div = document.getElementById(divId);
    const options = document.getElementById(optionsId);
    if(!div || !options) return;

    div.onclick = (e) => {
        e.stopPropagation();
        options.style.display = options.style.display === "block" ? "none" : "block";
    };

    options.querySelectorAll("div").forEach(opt => {
        opt.onclick = () => {
            div.innerText = opt.innerText;
            div.dataset.value = opt.getAttribute("data-value");
            options.style.display = "none";
        };
    });
}
setupDropdown("exam-div", "exam-options");
setupDropdown("board-div", "board-options");

window.onclick = () => {
    document.querySelectorAll(".custom-select-options").forEach(opt => opt.style.display = "none");
};

let editArticleId = null;
let editQuestionId = null;

// === Publish/Update Article ===
document.getElementById("publish-article-btn").onclick = async () => {
    const data = {
        title: document.getElementById("title").value,
        slug: document.getElementById("slug").value,
        category: document.getElementById("category").value,
        subject: document.getElementById("subject").value,
        image: document.getElementById("image").value,
        content: quill.root.innerHTML,
        updatedAt: new Date()
    };

    if (!data.title || !data.slug) { alert("Fill title & slug"); return; }

    try {
        if (editArticleId) {
            await updateDoc(doc(db, "articles", editArticleId), data);
            alert("Article Updated!");
            editArticleId = null;
            document.getElementById("publish-article-btn").innerText = "Publish Article";
        } else {
            data.createdAt = new Date();
            await addDoc(collection(db, "articles"), data);
            
            // 🔥 Push Notification Sent here
            await sendOneSignalNotification(data.title, data.slug, data.image);
            alert("Article Published & Notification Sent!");
        }
        resetArticleForm();
        loadArticles();
    } catch (err) {
        alert("Action failed: " + err.message);
    }
};

// === Publish/Update Question ===
document.getElementById("publish-question-btn").onclick = async () => {
    const data = {
        exam: document.getElementById("exam-div")?.dataset.value,
        board: document.getElementById("board-div")?.dataset.value,
        year: document.getElementById("year").value,
        subject: document.getElementById("subject-q").value,
        slug: document.getElementById("slug-q").value,
        question: questionQuill.root.innerHTML,
        solution: solutionQuill.root.innerHTML,
        updatedAt: new Date()
    };

    if (!data.exam || !data.board || !data.year || !data.slug) {
        alert("Fill all fields");
        return;
    }

    try {
        if (editQuestionId) {
            await updateDoc(doc(db, "boardQuestions", editQuestionId), data);
            alert("Question Updated!");
            editQuestionId = null;
            document.getElementById("publish-question-btn").innerText = "Publish Question";
        } else {
            data.createdAt = new Date();
            await addDoc(collection(db, "boardQuestions"), data);
            // Optional: Question publish holeo notification chaitay paren
            // await sendOneSignalNotification(`New Question: ${data.exam} ${data.year}`, data.slug, "");
            alert("Question Published!");
        }
        resetQuestionForm();
        loadQuestions();
    } catch (err) {
        alert("Action failed: " + err.message);
    }
};

// === Load, Edit, Delete & Auth Functions remain same as your original code ===
async function loadArticles() {
    const list = document.getElementById("articleList");
    if(!list) return;
    list.innerHTML = "Loading...";
    const snap = await getDocs(collection(db, "articles"));
    list.innerHTML = "";
    snap.forEach(d => {
        const item = d.data();
        const div = document.createElement("div");
        div.className = "cms-list-item";
        div.innerHTML = `<span>${item.title}</span><div><button class="edit-btn">Edit</button><button class="del-btn">Delete</button></div>`;
        div.querySelector(".edit-btn").onclick = () => editArticle(d.id);
        div.querySelector(".del-btn").onclick = () => deleteArticle(d.id);
        list.appendChild(div);
    });
}

async function loadQuestions() {
    const list = document.getElementById("questionList");
    if(!list) return;
    list.innerHTML = "Loading...";
    const snap = await getDocs(collection(db, "boardQuestions"));
    list.innerHTML = "";
    snap.forEach(d => {
        const item = d.data();
        const div = document.createElement("div");
        div.className = "cms-list-item";
        div.innerHTML = `<span>${item.exam} - ${item.board} (${item.year})</span><div><button class="edit-btn">Edit</button><button class="del-btn">Delete</button></div>`;
        div.querySelector(".edit-btn").onclick = () => editQuestion(d.id);
        div.querySelector(".del-btn").onclick = () => deleteQuestion(d.id);
        list.appendChild(div);
    });
}

async function editArticle(id) {
    const d = await getDoc(doc(db, "articles", id));
    const data = d.data();
    document.getElementById("title").value = data.title;
    document.getElementById("slug").value = data.slug;
    document.getElementById("category").value = data.category;
    document.getElementById("subject").value = data.subject;
    document.getElementById("image").value = data.image;
    quill.root.innerHTML = data.content;
    editArticleId = id;
    document.getElementById("publish-article-btn").innerText = "Update Article";
    showSection("add-article-section");
}

async function editQuestion(id) {
    const d = await getDoc(doc(db, "boardQuestions", id));
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
    editQuestionId = id;
    document.getElementById("publish-question-btn").innerText = "Update Question";
    showSection("add-question-section");
}

async function deleteArticle(id) { if (confirm("Are you sure?")) { await deleteDoc(doc(db, "articles", id)); loadArticles(); } }
async function deleteQuestion(id) { if (confirm("Are you sure?")) { await deleteDoc(doc(db, "boardQuestions", id)); loadQuestions(); } }

function resetArticleForm() { document.getElementById("title").value = ""; document.getElementById("slug").value = ""; quill.setContents([]); editArticleId = null; }
function resetQuestionForm() { document.getElementById("year").value = ""; document.getElementById("slug-q").value = ""; questionQuill.setContents([]); solutionQuill.setContents([]); editQuestionId = null; }

document.getElementById("logoutBtn").onclick = () => signOut(auth).then(() => location.href = "index.html");

onAuthStateChanged(auth, user => {
    if (!user) location.href = "index.html";
    else { loadArticles(); loadQuestions(); }
});