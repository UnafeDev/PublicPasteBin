import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyDhOrB6WUE3E4ErhmzTkQgZnlp_GsWiQ8s",
    authDomain: "pastebin-19b76.firebaseapp.com",
    projectId: "pastebin-19b76",
    storageBucket: "pastebin-19b76.firebasestorage.app",
    messagingSenderId: "547472639751",
    appId: "1:547472639751:web:316a8bc764887b225e27a2",
    measurementId: "G-WGMVVYV9GE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- AUTH ---
window.signup = async function () {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signed up!");
  } catch (e) {
    alert("Signup error: " + e.message);
  }
};

window.login = async function () {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in!");
  } catch (e) {
    alert("Login error: " + e.message);
  }
};

window.logout = async function () {
  try {
    await signOut(auth);
    alert("Logged out!");
    document.getElementById("pasteContent").textContent = "No paste selected";
  } catch (e) {
    alert("Logout error: " + e.message);
  }
};

onAuthStateChanged(auth, user => {
  document.getElementById("authStatus").textContent = user ? `Logged in as ${user.email}` : "Not logged in";
});

// --- CREATE PRIVATE PASTE ---
window.addPrivatePaste = async function () {
  try {
    const text = document.getElementById("pasteInput").value.trim();
    const customCode = document.getElementById("customCodeInput").value.trim();

    if (!text) return alert("Paste cannot be empty");
    if (!auth.currentUser) return alert("Login required");
    if (!customCode) return alert("You must enter a code for your paste");

    // Check if code already exists
    const q = query(collection(db, "privatePastes"), where("code", "==", customCode));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return alert("That code is already taken. Try another.");

    // Add paste
    const docRef = await addDoc(collection(db, "privatePastes"), {
      text,
      ownerId: auth.currentUser.uid,
      code: customCode,
      created: new Date()
    });

    console.log("Document written with ID:", docRef.id);
    alert(`Private paste created! Access code: ${customCode}`);
    document.getElementById("pasteInput").value = "";
    document.getElementById("customCodeInput").value = "";
  } catch (err) {
    console.error("Error adding paste:", err);
    alert("Failed to create paste. Check console for details.");
  }
};

// --- VIEW PRIVATE PASTE BY CODE ---
window.getPasteByCode = async function () {
  try {
    if (!auth.currentUser) return alert("You must be logged in to view private pastes.");

    const code = document.getElementById("pasteCodeInput").value.trim();
    if (!code) return alert("Enter a code");

    const q = query(collection(db, "privatePastes"), where("code", "==", code));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      document.getElementById("pasteContent").textContent = "Paste not found or invalid code";
      return;
    }

    const paste = snapshot.docs[0].data();
    document.getElementById("pasteContent").textContent = paste.text;
  } catch (err) {
    console.error("Error fetching paste:", err);
    alert("Failed to fetch paste. Check console for details.");
  }
};