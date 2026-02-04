import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZpdtDkHAmCz9GosbJ-PkO4KM2iaNTfHQ",
  authDomain: "freecart11.firebaseapp.com",
  projectId: "freecart11",
  databaseURL: "https://freecart11-default-rtdb.europe-west1.firebasedatabase.app/",
  appId: "1:369725415465:web:8beecb3baf985ddddb7c38"
};

if (!getApps().length) initializeApp(firebaseConfig);

const auth = getAuth();
const db = getDatabase();

// Navbar elements
const navFeedback = document.getElementById("nav-feedback");
const navAuth = document.getElementById("nav-auth");

// Page elements
const contactCards = document.getElementById("contactCards");

const ADMINS = ["arielsh2006@gmail.com", "gil.agmon1@gmail.com"];

// Expose actions for the inline buttons
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

  // Admin gate
  if (!ADMINS.includes(user.email)) {
    alert("Access denied. Admins only.");
    window.location.href = "index.html";
    return;
  }

  renderContacts();
});