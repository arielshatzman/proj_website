import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!getApps().length) initializeApp(firebaseConfig);

const auth = getAuth();
const db = getDatabase();

const navFeedback = document.getElementById("nav-feedback");
const navAuth = document.getElementById("nav-auth");

// Page elements
const contactCards = document.getElementById("contactCards");

const ADMINS = ["arielsh2006@gmail.com", "gil.agmon1@gmail.com"];

window.updateStatus = (id, status) => update(ref(db, `contacts/${id}`), { status });
window.deleteContact = (id) => remove(ref(db, `contacts/${id}`));

const renderContacts = () => {
  const contactsRef = ref(db, "contacts");

  onValue(contactsRef, (snapshot) => {
    contactCards.innerHTML = "";
    if (!snapshot.exists()) {
      contactCards.innerHTML = `<div class="text-muted">No messages yet.</div>`;
      return;
    }

    snapshot.forEach((childSnap) => {
      const data = childSnap.val();
      const id = childSnap.key;

      const card = document.createElement("div");
      card.className = "contact-card";

      const ts = data.timestamp ? new Date(data.timestamp).toLocaleString() : "";

      card.innerHTML = `
        <div class="card-header">
          ${data.firstName} ${data.lastName} 
          <small class="text-muted">${ts ? `(${ts})` : ""}</small>
        </div>
        <div class="card-body">
          <p class="mb-1"><strong>Email:</strong> ${data.email}</p>
          <p class="mb-1"><strong>Topic:</strong> ${data.topic}</p>
          <p class="mb-1"><strong>Message:</strong> ${data.message}</p>
          <p class="mb-1"><strong>Preferred Contact:</strong> ${data.preferredContactMethod}</p>
          <p class="mb-1"><strong>Updates:</strong> ${data.updates ? "Yes" : "No"}</p>
          <p class="mb-2"><strong>Status:</strong> ${data.status || "pending"}</p>

          <button class="btn btn-sm btn-success" onclick="updateStatus('${id}','done')">Mark as done</button>
          <button class="btn btn-sm btn-danger" onclick="deleteContact('${id}')">Delete</button>
        </div>
      `;

      contactCards.appendChild(card);
      setTimeout(() => card.classList.add("show"), 50);
    });
  });
};

onAuthStateChanged(auth, (user) => {
  navFeedback?.classList.remove("d-none");
  if (navAuth) {
    navAuth.innerHTML = `<a class="nav-link" href="#" id="nav-logout">Logout (${user.email})</a>`;
    document.getElementById("nav-logout")?.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  if (!ADMINS.includes(user.email)) {
    alert("Access denied. Admins only.");
    window.location.href = "index.html";
    return;
  }

  renderContacts();
});