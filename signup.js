import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
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
const form = document.getElementById("signupForm");
const loggedInBox = document.getElementById("loggedInBox");
const logoutBtn = document.getElementById("logoutBtn");

// Navbar elements
const navFeedback = document.getElementById("nav-feedback");
const navAuth = document.getElementById("nav-auth");

// Auth state controls page + navbar
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
        window.location.href = "home.html";
      });
    }
  } else {
    loggedInBox?.classList.add("d-none");
    form?.classList.remove("d-none");

    navFeedback?.classList.add("d-none");
    if (navAuth) navAuth.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
  }
});

// Signup submit
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
    window.location.href = "home.html";
  } catch (err) {
    alert(err?.message || "Signup failed");
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
});