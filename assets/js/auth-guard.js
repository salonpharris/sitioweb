/* =========================================================================
   AUTH GUARD — protege esta página: exige sesión iniciada Y que el correo
   de esa sesión esté en la lista de autorizados (ver allowlist.js). Si
   cualquiera de las dos condiciones falla, redirige a login.html.
   No edites este archivo salvo que sepas lo que haces — la configuración
   editable vive en firebase-config.js, y la lista de acceso se administra
   desde la consola de Firestore (ver instrucciones en allowlist.js).
   ========================================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
import { isAllowed } from "./allowlist.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Si el navegador restaura esta página desde su caché de "atrás/adelante"
// (por ejemplo al volver con el botón atrás), el estado de sesión de
// Firebase puede quedar congelado o desactualizado. Forzamos una recarga
// real para que vuelva a confirmarse correctamente y no parezca que se
// cerró la sesión.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) location.reload();
});

onAuthStateChanged(auth, async (user) => {
  if (!user){
    const here = location.pathname.split("/").pop() || "index.html";
    location.replace(`login.html?redirect=${encodeURIComponent(here)}`);
    return;
  }

  const allowed = await isAllowed(app, user);
  if (!allowed){
    const deniedEmail = user.email || "";
    await signOut(auth);
    location.replace(`login.html?denied=1&email=${encodeURIComponent(deniedEmail)}`);
    return;
  }

  document.documentElement.classList.remove("auth-pending");
  renderAuthSlot(user, auth);
});

function renderAuthSlot(user, auth){
  const slot = document.getElementById("authSlot");
  if (!slot) return;
  slot.innerHTML = `<button class="auth-logout" id="logoutBtn" type="button">Cerrar sesión</button>`;
  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth);
  });
}
