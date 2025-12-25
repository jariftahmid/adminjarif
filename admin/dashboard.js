import { db, storage } from "../firebase.js";
import { collection, addDoc } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

window.publish = async function () {
  const file = image.files[0];
  const imgRef = ref(storage, "images/" + file.name);

  await uploadBytes(imgRef, file);
  const imageURL = await getDownloadURL(imgRef);

  await addDoc(collection(db, "articles"), {
    title: title.value,
    category: category.value,
    image: imageURL,
    content: content.value,
    date: new Date()
  });

  alert("Article Published!");
};
