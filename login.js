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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!getApps().length) initializeApp(firebaseConfig);

const auth = getAuth();

const form = document.getElementById("loginForm");
const loggedInBox = document.getElementById("loggedInBox");
const logoutBtn = document.getElementById("logoutBtn");

const navFeedback = document.getElementById("nav-feedback");
const navAuth = document.getElementById("nav-auth");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loggedInBox?.classList.remove("d-none");
    form?.classList.add("d-none");

    navFeedback?.classList.remove("d-none");
    if (navAuth) {
      navAuth.innerHTML = `<a class="nav-link" href="#" id="nav-logout">Logout (${user.email})</a>`;
      document.getElementById("nav-logout")?.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
    window.location.href = "/proj_website/index.html";
      });
    }
  }
});

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