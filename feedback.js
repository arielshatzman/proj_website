import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const fbAuthConfig = {
  apiKey: "AIzaSyAZpdtDkHAmCz9GosbJ-PkO4KM2iaNTfHQ",
  authDomain: "freecart11.firebaseapp.com",
  projectId: "freecart11",
  databaseURL: "https://freecart11-default-rtdb.europe-west1.firebasedatabase.app",
  messagingSenderId: "369725415465",
  appId: "1:369725415465:web:8beecb3baf985ddddb7c38"
};

if (!getApps().length) initializeApp(fbAuthConfig);

const fbAuth = getAuth();
const db = getDatabase();

// Navbar elements
const navFeedback = document.getElementById("nav-feedback");
const navControl = document.getElementById("nav-control");
const controlBtn = document.getElementById("controlBtn");
const navAuth = document.getElementById("nav-auth");
const navAdmin = document.getElementById("nav-admin");

// Admin emails
const ADMINS = ["arielsh2006@gmail.com", "gil.agmon1@gmail.com"];

// Navbar auth + admin link
onAuthStateChanged(fbAuth, (user) => {
  if (user) {
    navFeedback?.classList.remove("d-none");
    navControl?.classList.remove("d-none");
    controlBtn?.classList.remove("d-none");

    if (navAdmin) {
      navAdmin.style.display = ADMINS.includes(user.email) ? "block" : "none";
    }

    if (navAuth) {
      navAuth.innerHTML = `
        <a class="nav-link" href="#" id="nav-logout">
          Logout (${user.email || user.uid})
        </a>
      `;
      document.getElementById("nav-logout")?.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(fbAuth);
        window.location.href = "index.html";
      });
    }
  } else {
    navFeedback?.classList.add("d-none");
    navControl?.classList.add("d-none");
    controlBtn?.classList.add("d-none");
    if (navAdmin) navAdmin.style.display = "none";
    if (navAuth) navAuth.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
  }
});

// CARD HEIGHT SYNC
const equalizeCards = () => {
  const cards = Array.from(document.querySelectorAll(".custom-card"));
  if (!cards.length) return;

  cards.forEach((card) => (card.style.height = "auto"));
  const maxHeight = Math.max(...cards.map((card) => card.getBoundingClientRect().height));
  cards.forEach((card) => (card.style.height = `${maxHeight}px`));
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".hero, .hero-video, .hero-img, video.hero-video").forEach((el) => el.remove());
  equalizeCards();
});

window.addEventListener("resize", () => requestAnimationFrame(equalizeCards));

/* CAMERA LOGIC */
const cameraImg = document.getElementById("cameraFeed");

cameraImg?.addEventListener("load", equalizeCards);
cameraImg?.addEventListener("error", equalizeCards);

const videoServerIpRef = ref(db, "video_server/ip");

onValue(videoServerIpRef, (snapshot) => {
  const pcIp = snapshot.val();

  if (!pcIp) {
    cameraImg?.removeAttribute("src");
    equalizeCards();
    return; 
  }

  const url = `http://${pcIp}:5000/video`;
  if (cameraImg) cameraImg.src = url;

  equalizeCards();
});

/* SENSOR LOGIC */
const distanceEl = document.getElementById("distanceValue");
const distanceRef = ref(db, "fromAltera/A");

onValue(distanceRef, (snapshot) => {
  const raw = snapshot.val();
  const proxText = document.getElementById("proxPlaceholderText");
  const box = proxText?.closest(".placeholder-box");

  if (raw === null || raw === undefined) {
    if (distanceEl) distanceEl.textContent = "No sensor data";
    if (proxText) proxText.innerHTML = '<div style="font-weight:600">No sensor data</div>';
    if (box) box.style.background = "#0b61a7";
    equalizeCards();
    return;
  }

  // raw may be a number or an object; try to extract a numeric distance
  let candidate = raw;
  if (typeof raw === 'object' && raw !== null) {
    candidate = raw.distance ?? raw.dist ?? raw.prox ?? raw.value ?? raw.A ?? Object.values(raw)[0];
  }
  const dist = Number(candidate);
  if (Number.isNaN(dist)) {
    if (distanceEl) distanceEl.textContent = String(candidate);
    if (proxText) proxText.innerHTML = `<div style="font-weight:600">Distance: ${candidate}</div>`;
    if (box) box.style.background = "#0b61a7";
    equalizeCards();
    return;
  }

  let icon = "bi-check-circle";
  let label = "Clear";

  if (dist < 20) {
    icon = "bi-exclamation-octagon";
    label = "Too close";
  } else if (dist < 50) {
    icon = "bi-exclamation-triangle";
    label = "Near";
  }

  if (proxText) {
    proxText.innerHTML = `
      <div style="font-size:40px; font-weight:700;margin-top:0px;">
        <i class="bi ${icon}" style="margin-right:8px;"></i>
      </div>
      <div style="font-size:22px; font-weight:700;">
        Distance: ${dist} cm
      </div>
      <div style="font-size:14px; opacity:0.9; margin-top:.25rem;">
        ${label}
      </div>
    `;
  }

  if (box) {
    if (dist < 20) box.style.background = "#ff4d4d";
    else if (dist < 50) box.style.background = "#ffcc00";
    else box.style.background = "#0b61a7";
  }

  equalizeCards();
});