<script type="module">
import { collection, addDoc } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { ref, uploadBytes, getDownloadURL } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

window.publish = async function () {
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const content = document.getElementById("content").value;
  const file = document.getElementById("image").files[0];

  const imgRef = ref(storage, "articles/" + Date.now());
  await uploadBytes(imgRef, file);
  const imageURL = await getDownloadURL(imgRef);

  await addDoc(collection(db, "articles"), {
    title,
    category,
    content,
    image: imageURL,
    date: new Date()
  });

  alert("Article Published Successfully!");
};
</script>
