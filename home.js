import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const fbAuthConfig = {
  apiKey: "AIzaSyAZpdtDkHAmCz9GosbJ-PkO4KM2iaNTfHQ",
  authDomain: "freecart11.firebaseapp.com",
  projectId: "freecart11",
  messagingSenderId: "369725415465",
  appId: "1:369725415465:web:8beecb3baf985ddddb7c38"
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
      navAuth.innerHTML = `<a class="nav-link" href="#" id="nav-logout">Logout (${user.email || user.uid})</a>`;
      document.getElementById("nav-logout")?.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(fbAuth);
        window.location.href = "home.html";
      });
    }
  } else {
    navFeedback?.classList.add("d-none");
    if (navAdmin) navAdmin.style.display = "none";
    if (navAuth) navAuth.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
  }

  // mark active link
  document.querySelectorAll(".nav-link").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;
    if (location.pathname.toLowerCase().endsWith(href.toLowerCase())) a.classList.add("active");
  });
});

// Reveal cards on scroll
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