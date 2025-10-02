import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDhOrB6WUE3E4ErhmzTkQgZnlp_GsWiQ8s",
  authDomain: "pastebin-19b76.firebaseapp.com",
  projectId: "pastebin-19b76",
  storageBucket: "pastebin-19b76.firebasestorage.app",
  messagingSenderId: "547472639751",
  appId: "1:547472639751:web:316a8bc764887b225e27a2",
  measurementId: "G-WGMVVYV9GE"
};
// Init Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
let pastes = [];
let currentIndex = -1;
// AUTH FUNCTIONS
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful!");
  } catch (e) {
    alert("Error: " + e.message);
  }
};
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
  } catch (e) {
    alert("Error: " + e.message);
  }
};
window.logout = async function () {
  await signOut(auth);
};
onAuthStateChanged(auth, (user) => {
  const status = document.getElementById("authStatus");
  if (user) {
    status.textContent = `Logged in as ${user.email}`;
  } else {
    status.textContent = "Not logged in";
  }
  renderContent();
});
// RENDERING
function renderTabs() {
  const tabsDiv = document.getElementById("tabs");
  tabsDiv.innerHTML = "";
  pastes.forEach((paste, i) => {
    const tab = document.createElement("div");
    tab.className = "tab" + (i === currentIndex ? " active" : "");
    tab.textContent = "Paste " + (i + 1);
    tab.onclick = () => {
      currentIndex = i;
      renderTabs();
      renderContent();
    };
    tabsDiv.appendChild(tab);
  });
}
function renderContent() {
  const contentDiv = document.getElementById("content");
  if (currentIndex >= 0) {
    const paste = pastes[currentIndex];
    let html = `<pre style="white-space:pre-wrap; word-wrap:break-word;">${paste.text}</pre>`;
    if (auth.currentUser && auth.currentUser.uid === paste.ownerId) {
      html += `<button onclick="deletePaste('${paste.id}')">Delete</button>`;
    }
    contentDiv.innerHTML = html;
  } else {
    contentDiv.textContent = "Pastes will appear here.";
  }
}
// FIRESTORE
window.addPaste = async function () {
  const text = document.getElementById("pasteInput").value.trim();
  if (text && auth.currentUser) {
    await addDoc(collection(db, "pastes"), {
      text: text,
      created: new Date(),
      ownerId: auth.currentUser.uid
    });
    document.getElementById("pasteInput").value = "";
  } else {
    alert("You must be logged in to submit a paste.");
  }
};
window.deletePaste = async function (id) {
  try {
    await deleteDoc(doc(db, "pastes", id));
  } catch (e) {
    alert("Delete failed: " + e.message);
  }
};
const q = query(collection(db, "pastes"), orderBy("created"));
onSnapshot(q, snapshot => {
  pastes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (currentIndex === -1 && pastes.length > 0) {
    currentIndex = 0;
  }
  renderTabs();
  renderContent();
});