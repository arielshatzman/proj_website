import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const log = (...args) => console.log(...args);

const fbAuthConfig = {
  apiKey: "AIzaSyAZpdtDkHAmCz9GosbJ-PkO4KM2iaNTfHQ",
  authDomain: "freecart11.firebaseapp.com",
  projectId: "freecart11",
  databaseURL: "https://freecart11-default-rtdb.europe-west1.firebasedatabase.app",
  messagingSenderId: "369725415465",
  appId: "1:369725415465:web:8beecb3af985ddddb7c38"
};

if (!getApps().length) initializeApp(fbAuthConfig);
const db = getDatabase();
let firebaseEnabled = true;

// Auth: show/hide navbar items when signed in (mirrors feedback.js behavior)
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const fbAuth = getAuth();
const navControl = document.getElementById('nav-control');
const navAuth = document.getElementById('nav-auth');
const navAdmin = document.getElementById('nav-admin');
const ADMINS = ["arielsh2006@gmail.com", "gil.agmon1@gmail.com"];

onAuthStateChanged(fbAuth, (user) => {
  if (user) {
    navControl?.classList.remove('d-none');
    if (navAdmin) {
      navAdmin.style.display = ADMINS.includes(user.email) ? 'block' : 'none';
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
    navControl?.classList.add('d-none');
    if (navAdmin) navAdmin.style.display = 'none';
    if (navAuth) navAuth.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
  }
});

async function clearExistingHistory() {
  try {
    await set(ref(db, 'control/history'), null);
    await set(ref(db, 'photoData/history'), null);
    console.log('Cleared existing control/photoData history.');
  } catch (err) {
    console.log('Failed to clear history:', err);
  }
}

// Attempt to clear any existing history entries on load
clearExistingHistory();

// Keep last control state and forward as a single decimal code to /toAltera
const controlLastRef = ref(db, 'control/last');
const lastControl = { action: null, speed: null };

function speedValToIndex(s) {
  if (s === 0.25) return 0;
  if (s === 0.5) return 1;
  if (s === 0.75) return 2;
  if (s === 1.0) return 3;
  // fallback: try to map numbers close to those
  if (s > 0.875) return 3;
  if (s > 0.625) return 2;
  if (s > 0.375) return 1;
  return 0;
}

function computeDecimalCode(action, speedVal) {
  // Servo / box codes
  if (!action) return 0;
  const a = action.toString().toLowerCase();
  if (a === 'open') return 130; // 180°
  if (a === 'half') return 130; // 90°
  if (a === 'closed') return 128; // 0°

  // DC motor codes
  // speedVal maps to index 0..3 (25/50/75/100)
  const idx = speedValToIndex(speedVal === undefined ? currentSpeed : speedVal);
  if (a === 'backward') return 74 + 16 * idx;
  if (a === 'forward' || a === 'left' || a === 'right') return 69 + 16 * idx;
  if (a === 'stop') return 63;
  return 0;
}

onValue(controlLastRef, (snapshot) => {
  const val = snapshot.val();
  if (!val) return;
  lastControl.action = val.action || null;
  lastControl.speed = val.speed || null;

  const code = computeDecimalCode(lastControl.action, lastControl.speed);
  set(ref(db, 'toAltera'), code)
    .then(() => log('Set /toAltera to code', code))
    .catch(err => log('Failed to set /toAltera code:', err));
});



// Initialization from pasted JSON removed — this page uses the site's Firebase configuration (same as Feedback).

function disableFirebase() {
  firebaseEnabled = false;
  log('Firebase disabled');
}

async function sendToFirebase(path, payload) {
  if (!firebaseEnabled || !db) return log('Firebase not initialized');
  try {
    // Only update the /last entry - do not save history
    await set(ref(db, `${path}/last`), payload);
    log('Firebase TX: ' + JSON.stringify(payload));
  } catch (err) {
    log('Firebase send error: ' + err);
  }
}

// No extra UI listeners in minimalist mode

// Joystick and command sending
let currentSpeed = 0.5;

function setSpeed(val) {
  currentSpeed = val;
  // update UI active state
  ['speed25','speed50','speed75','speed100'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });
  const id = val === 0.25 ? 'speed25' : val === 0.5 ? 'speed50' : val === 0.75 ? 'speed75' : 'speed100';
  const activeBtn = document.getElementById(id);
  if (activeBtn) activeBtn.classList.add('active');

  // Compute code using last action + new speed and set as single decimal to /toAltera
  const action = lastControl.action || null;
  const code = computeDecimalCode(action, val);
  set(ref(db, 'toAltera'), code)
    .then(() => log('Speed change -> set /toAltera to', code))
    .catch(err => log('Failed to set /toAltera code on speed change:', err));
}

const base = document.getElementById('joystickBase');
const knob = document.getElementById('joystickKnob');
let pointerId = null;
let center = { x: 0, y: 0 };
let maxRadius = 70; // px
let currentDir = null;

function setKnobPosition(x, y) {
  knob.style.transform = `translate(${x}px, ${y}px)`;
}

function calcDirection(dx, dy) {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (absX < 10 && absY < 10) return 'stop';
  if (absX > absY) return dx > 0 ? 'right' : 'left';
  return dy < 0 ? 'forward' : 'backward';
}

async function sendCommand(payload) {
  // Include selected speed in payload (if provided use payload.speed, otherwise currentSpeed)
  const speed = (payload && payload.speed !== undefined) ? payload.speed : currentSpeed;
  // normalize action to lowercase string to avoid accidental casing issues
  const action = payload && payload.action ? String(payload.action).toLowerCase() : null;
  const toSend = { device: payload.device, action: action, speed };
  await sendToFirebase('control', toSend);
}

function onPointerDown(e) {
  base.setPointerCapture(e.pointerId);
  pointerId = e.pointerId;
  const rect = base.getBoundingClientRect();
  center = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
  onPointerMove(e);
}

function onPointerMove(e) {
  if (pointerId !== e.pointerId) return;
  const dx = e.clientX - center.x;
  const dy = e.clientY - center.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const r = Math.min(dist, maxRadius);
  const angle = Math.atan2(dy, dx);
  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;
  setKnobPosition(x, y);

  const dir = calcDirection(x, y);
  if (dir !== currentDir) {
    currentDir = dir;
    sendCommand({ device: 'motor', action: dir });
  }
}

function onPointerUp(e) {
  if (pointerId !== e.pointerId) return;
  base.releasePointerCapture(e.pointerId);
  pointerId = null;
  setKnobPosition(0,0);
  currentDir = 'stop';
  sendCommand({ device: 'motor', action: 'stop' });
}

// Guard and UI update on /control/last listener: only forward motor actions to /toAltera
onValue(controlLastRef, (snapshot) => {
  const val = snapshot.val();
  if (!val) return;
  const action = (val.action || '').toString().toLowerCase();
  lastControl.action = action || null;
  lastControl.speed = val.speed || null;

  const lastActionEl = document.getElementById('lastActionVal');
  if (lastActionEl) lastActionEl.textContent = action || '—';

  const motorActions = new Set(['forward', 'backward', 'left', 'right', 'stop']);
  if (!motorActions.has(action)) {
    log('Ignoring non-motor action in control/last:', action);
    return;
  }

  const code = computeDecimalCode(lastControl.action, lastControl.speed);
  set(ref(db, 'toAltera'), code)
    .then(() => log('Set /toAltera to code', code))
    .catch(err => log('Failed to set /toAltera code:', err));
});
base.addEventListener('pointerdown', onPointerDown);
base.addEventListener('pointermove', onPointerMove);
base.addEventListener('pointerup', onPointerUp);
base.addEventListener('pointercancel', onPointerUp);
base.addEventListener('touchstart', (e) => e.preventDefault(), { passive:false });

// Speed button handlers
['speed25','speed50','speed75','speed100'].forEach(id => {
  const map = { 'speed25':0.25,'speed50':0.5,'speed75':0.75,'speed100':1.0 };
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => setSpeed(map[id]));
});

// Box control handlers
function setBox(val) {
  ['boxOpen','boxHalf','boxClosed'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });
  const id = val === 'open' ? 'boxOpen' : val === 'half' ? 'boxHalf' : 'boxClosed';
  const activeBtn = document.getElementById(id);
  if (activeBtn) activeBtn.classList.add('active');

  // Map box states to servo decimal codes and set that number to /toAltera
  const code = computeDecimalCode(val, currentSpeed);
  set(ref(db, 'toAltera'), code)
    .then(() => log('Box change -> set /toAltera to', code))
    .catch(err => log('Failed to set /toAltera code for box change:', err));
}

['boxOpen','boxHalf','boxClosed'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => setBox(id === 'boxOpen' ? 'open' : id === 'boxHalf' ? 'half' : 'closed'));
});

// ensure default speed button is active
setTimeout(() => {
  const btn = document.getElementById('speed50');
  if (btn) btn.classList.add('active');
}, 50);

log('Control page ready. Minimal joystick UI loaded.');

// Live /toAltera indicator for debugging: show the numeric code written to DB
const toAlteraRef = ref(db, 'toAltera');
const toAlteraEl = document.getElementById('toAlteraVal');
onValue(toAlteraRef, (snap) => {
  const v = snap.val();
  if (toAlteraEl) toAlteraEl.textContent = (v === null || v === undefined) ? '—' : String(v);
  log('toAltera updated:', v);
});
