import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZpdtDkHAmCz9GosbJ-PkO4KM2iaNTfHQ",
  authDomain: "freecart11.firebaseapp.com",
  projectId: "freecart11",
  messagingSenderId: "369725415465",
  appId: "1:369725415465:web:8beecb3baf985ddddb7c38"
};

if (!getApps().length) initializeApp(firebaseConfig);

const auth = getAuth();

// Page elements
const form = document.getElementById("loginForm");
const loggedInBox = document.getElementById("loggedInBox");
const logoutBtn = document.getElementById("logoutBtn");

// Navbar elements
const navFeedback = document.getElementById("nav-feedback");
const navAuth = document.getElementById("nav-auth");

// Auth state (controls both navbar + page)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Page UI
    loggedInBox?.classList.remove("d-none");
    form?.classList.add("d-none");

    // Navbar UI
    navFeedback?.classList.remove("d-none");
    if (navAuth) {
      navAuth.innerHTML = `<a class="nav-link" href="#" id="nav-logout">Logout (${user.email})</a>`;
      document.getElementById("nav-logout")?.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "index.html";
      });
    }
  }
});

// Login submit
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const remember = document.getElementById("remember").checked;

  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (err) {
    alert(err?.message || "Login failed");
  }
});