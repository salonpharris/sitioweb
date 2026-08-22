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
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
import { isAllowed } from "./allowlist.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Ver la misma nota en auth-guard.js: evita que el botón "atrás" del
// navegador muestre un estado de sesión desactualizado.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) location.reload();
});

/* onChange(allowed:boolean, user:object|null) se llama cada vez que
   cambia el estado de sesión. Espera a que Firebase confirme el estado
   real antes de avisar "sin sesión", para que no parezca que se cerró
   la sesión por una fracción de segundo al cargar la página. */
export async function watchMemberStatus(onChange){
  await auth.authStateReady();
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
