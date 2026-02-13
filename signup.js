import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
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

const form = document.getElementById("signupForm");
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
      navAuth.innerHTML = `<a class="nav-link" href="#" id="nav-logout">Logout (${user.email || user.uid})</a>`;
      document.getElementById("nav-logout")?.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "/proj_website/index.html";
      });
    }
  } else {
    loggedInBox?.classList.add("d-none");
    form?.classList.remove("d-none");

    navFeedback?.classList.add("d-none");
    if (navAuth) navAuth.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
  }
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const first = document.getElementById("firstName").value.trim();
  const last = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;
  const terms = document.getElementById("terms").checked;

  if (password !== confirm) return alert("Passwords do not match.");
  if (!terms) return alert("You must agree to the Terms.");

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (err) {
    alert(err?.message || "Signup failed");
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
});