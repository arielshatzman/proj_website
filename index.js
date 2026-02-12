import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const fbAuthConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!getApps().length) initializeApp(fbAuthConfig);

const fbAuth = getAuth();

const navFeedback = document.getElementById("nav-feedback");
const navAuth = document.getElementById("nav-auth");
const navAdmin = document.getElementById("nav-admin");

const ADMINS = ["arielsh2006@gmail.com", "gil.agmon1@gmail.com"];

onAuthStateChanged(fbAuth, (user) => {
  if (user) {
    navFeedback?.classList.remove("d-none");

    if (navAdmin) {
      navAdmin.style.display = ADMINS.includes(user.email) ? "block" : "none";
    }

    if (navAuth) {
      navAuth.innerHTML = `<a class="nav-link" href="#" id="nav-logout">Logout (${user.email})</a>`;
      document.getElementById("nav-logout")?.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(fbAuth);
        window.location.href = "index.html";
      });
    }
  } else {
    navFeedback?.classList.add("d-none");
    if (navAdmin) navAdmin.style.display = "none";
    if (navAuth) navAuth.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const reveal = (selector) => {
    const els = document.querySelectorAll(selector);
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("show"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("show")),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
  };

  reveal(".feature-card");
  reveal(".step-card");
});
