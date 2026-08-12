/* =========================================================================
   LISTA DE CORREOS AUTORIZADOS
   ---------------------------------------------------------------------
   Revisa, para cada persona que inicia sesión, si su correo existe como
   documento en la colección "allowedUsers" de Firestore. Si no existe,
   se considera NO autorizada — sin importar que haya iniciado sesión
   correctamente con Google, Microsoft o correo/contraseña.

   Para autorizar a alguien: Firebase Console → Firestore Database →
   colección "allowedUsers" → "Agregar documento" → como ID del documento
   escribe su correo tal cual (en minúsculas), y guarda (el contenido del
   documento puede quedar vacío, no importa).

   Para quitarle el acceso a alguien: elimina ese documento.
   ========================================================================= */
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function isAllowed(app, user){
  if (!user || !user.email) return false;
  const db = getFirestore(app);
  try {
    const snap = await getDoc(doc(db, "allowedUsers", user.email.toLowerCase()));
    return snap.exists();
  } catch (e){
    console.error("No se pudo verificar autorización:", e);
    return false;
  }
}
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
    await signOut(auth);
    location.replace("login.html?denied=1");
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
    <span class="auth-user">${name}</span>
    <button class="auth-logout" id="logoutBtn" type="button">Cerrar sesión</button>
  `;
  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth);
  });
}
/* =========================================================================
   ESTADO DE SESIÓN (versión "suave", no bloqueante)
   ---------------------------------------------------------------------
   A diferencia de auth-guard.js (que bloquea toda la página, usado en
   grupos-servicio.html y en las futuras páginas privadas), este módulo
   NO oculta ni redirige nada por sí solo: solo informa si hay una sesión
   activa Y autorizada, para que cada página decida qué mostrar.
   Se usa en index.html (para el "Área de miembros") y en territorios.html
   (para mostrar el nombre de la cuenta arriba, sin exigir sesión).
   ========================================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
import { isAllowed } from "./allowlist.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* onChange(allowed:boolean, user:object|null) se llama cada vez que
   cambia el estado de sesión. */
export function watchMemberStatus(onChange){
  onAuthStateChanged(auth, async (user) => {
    if (user){
      const allowed = await isAllowed(app, user);
      if (allowed){ onChange(true, user); return; }
      await signOut(auth);
    }
    onChange(false, null);
  });
}

export function logout(){
  return signOut(auth);
}
