import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZpdtDkHAmCz9GosbJ-PkO4KM2iaNTfHQ",
  authDomain: "freecart11.firebaseapp.com",
  projectId: "freecart11",
  databaseURL: "https://freecart11-default-rtdb.europe-west1.firebasedatabase.app",
  appId: "1:369725415465:web:8beecb3baf985ddddb7c38"
};

if (!getApps().length) initializeApp(firebaseConfig);

const db = getDatabase(undefined, firebaseConfig.databaseURL);
const auth = getAuth();

// Navbar auth
const navFeedback = document.getElementById("nav-feedback");
const navAuth = document.getElementById("nav-auth");

onAuthStateChanged(auth, (user) => {
  if (user) {
    navFeedback?.classList.remove("d-none");
    if (navAuth) {
      navAuth.innerHTML = `<a class="nav-link" href="#" id="nav-logout">Logout (${user.email})</a>`;
      document.getElementById("nav-logout")?.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "index.html";
      });
    }
  } else {
    navFeedback?.classList.add("d-none");
    if (navAuth) navAuth.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
  }
});

// Form submission
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const data = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    topic: document.getElementById("topic").value,
    preferredContactMethod: document.querySelector('input[name="contactMethod"]:checked').value,
    message: document.getElementById("message").value,
    updates: document.getElementById("updates").checked,
    status: "pending",
    timestamp: Date.now()
  };

  push(ref(db, "contacts"), data)
    .then(() => {
      submitBtn.disabled = true;
      const original = submitBtn.textContent;

      submitBtn.textContent = "Sent!";
      submitBtn.classList.add("btn-success", "shadow-lg");

      setTimeout(() => {
        submitBtn.textContent = original;
        submitBtn.classList.remove("btn-success", "shadow-lg");
        submitBtn.disabled = false;
      }, 2000);

      form.reset();
      form.classList.remove("was-validated");
    })
    .catch((err) => {
      console.error(err);
      alert("Error sending message. Please try again.");
    });
});

// Animate card entrance
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".contact-card")?.classList.add("show");
});