import { collection, addDoc } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { ref, uploadBytes, getDownloadURL } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

const publishBtn = document.getElementById("publish-btn");

publishBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const content = document.getElementById("content").value;
  const file = document.getElementById("image").files[0];

  if (!title || !category || !content || !file) {
    alert("All fields are required!");
    return;
  }

  try {
    // Upload image
    const imgRef = ref(storage, "articles/" + Date.now());
    await uploadBytes(imgRef, file);
    const imageURL = await getDownloadURL(imgRef);

    // Add doc to Firestore
    await addDoc(collection(db, "articles"), {
      title,
      category,
      content,
      image: imageURL,
      date: new Date()
    });

    alert("Article Published Successfully!");
    // Clear form
    document.getElementById("title").value = "";
    document.getElementById("category").value = "";
    document.getElementById("content").value = "";
    document.getElementById("image").value = "";
  } catch (err) {
    alert("Error: " + err.message);
  }
});
