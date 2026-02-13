import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const fbAuthConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!getApps().length) initializeApp(fbAuthConfig);

const fbAuth = getAuth();
const db = getDatabase();

const navFeedback = document.getElementById("nav-feedback");
const controlBtn = document.getElementById("controlBtn");
const navAuth = document.getElementById("nav-auth");
const navAdmin = document.getElementById("nav-admin");

const ADMINS = ["arielsh2006@gmail.com", "gil.agmon1@gmail.com"];

onAuthStateChanged(fbAuth, (user) => {
  if (user) {
    navFeedback?.classList.remove("d-none");
    controlBtn?.classList.remove("d-none");
    if (navAdmin) navAdmin.style.display = ADMINS.includes(user.email) ? "block" : "none";
    if (navAuth) {
      navAuth.innerHTML = `<a class="nav-link" href="#" id="nav-logout">Logout (${user.email || user.uid})</a>`;
      document.getElementById("nav-logout")?.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(fbAuth);
        window.location.href = "/proj_website/index.html";
      });
    }
  } else {
    navFeedback?.classList.add("d-none");
    controlBtn?.classList.add("d-none");
    if (navAdmin) navAdmin.style.display = "none";
    if (navAuth) navAuth.innerHTML = `<a class="nav-link" href="/proj_website/login.html">Login</a>`;
  }
});

const equalizeCards = () => {
  const cards = Array.from(document.querySelectorAll(".custom-card"));
  if (!cards.length) return;
  cards.forEach(c => c.style.height = "auto");
  const max = Math.max(...cards.map(c => c.getBoundingClientRect().height));
  cards.forEach(c => c.style.height = `${max}px`);
};

document.addEventListener("DOMContentLoaded", equalizeCards);
window.addEventListener("resize", () => requestAnimationFrame(equalizeCards));

const cameraImg = document.getElementById("cameraFeed");
const videoServerIpRef = ref(db, "video_server/ip");

onValue(videoServerIpRef, (snapshot) => {
  const pcIp = snapshot.val();
  if (!pcIp) {
    console.warn("No Camera IP found in Firebase");
    cameraImg?.removeAttribute("src");
    return;
  }

  let finalUrl;
  const cleanIp = pcIp.trim().replace(/\/$/, ""); 

  if (cleanIp.startsWith("http")) {
    finalUrl = `${cleanIp}/video`;
  } else {
    finalUrl = `http://${cleanIp}:5000/video`;
  }

  if (cameraImg) {
    cameraImg.src = finalUrl + "?t=" + new Date().getTime();
    console.log("Loading Stream:", finalUrl);
  }
  
  equalizeCards();
});

const distanceEl = document.getElementById("distanceValue");
const distanceRef = ref(db, "fromAltera/A");

onValue(distanceRef, (snapshot) => {
  const raw = snapshot.val();
  const proxText = document.getElementById("proxPlaceholderText");
  const box = proxText?.closest(".placeholder-box");

  if (raw === null || raw === undefined) {
    if (distanceEl) distanceEl.textContent = "No data";
    if (box) box.style.background = "#0b61a7";
    return;
  }

  let dist = Number(typeof raw === 'object' ? (raw.A || Object.values(raw)[0]) : raw);
  
  if (isNaN(dist)) {
    if (distanceEl) distanceEl.textContent = "Error";
    return;
  }

  let icon = "bi-check-circle", label = "Clear", color = "#0b61a7";
  if (dist < 20) { icon = "bi-exclamation-octagon"; label = "Too close"; color = "#ff4d4d"; }
  else if (dist < 50) { icon = "bi-exclamation-triangle"; label = "Near"; color = "#ffcc00"; }

  if (proxText) {
    proxText.innerHTML = `
      <div style="font-size:40px; font-weight:700;"><i class="bi ${icon}"></i></div>
      <div style="font-size:22px; font-weight:700;">Distance: ${dist} cm</div>
      <div style="font-size:14px; opacity:0.9;">${label}</div>
    `;
  }
  if (box) box.style.background = color;
  equalizeCards();
});