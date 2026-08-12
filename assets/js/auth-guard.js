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
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
import { isAllowed } from "./allowlist.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
  const name = user.displayName || user.email || "Cuenta";
  slot.innerHTML = `
    <span class="auth-user">
      <span class="auth-name">${name}</span>
      ${user.displayName ? `<span class="auth-email">${user.email}</span>` : ""}
    </span>
    <button class="auth-logout" id="logoutBtn" type="button">Cerrar sesión</button>
  `;
  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth);
  });
}
