/* =========================================================================
   PERMISOS DE EDICIÓN POR PÁGINA
   ---------------------------------------------------------------------
   Revisa si el correo de la sesión actual puede EDITAR una página
   específica (no todo el sitio). Cada página tiene su propia lista de
   editores en Firestore, en la colección "editors".

   Para autorizar a alguien a editar una página:
   Firebase Console → Firestore Database → colección "editors" →
   documento con el nombre de la página (ej: "privilegios") → subcolección
   "emails" → agregar documento cuyo ID sea el correo de esa persona en
   minúsculas. No importa qué campos tenga el documento, solo que exista.

   Para quitarle el permiso de edición a alguien: elimina ese documento.

   Esto es independiente de "allowedUsers" (que controla si alguien puede
   entrar al sitio en general): una persona puede estar autorizada a
   entrar pero no a editar, y viceversa no aplica — solo pueden editar
   quienes también estén en allowedUsers, porque esta página además está
   protegida por auth-guard.js.
   ========================================================================= */
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function isEditor(app, user, pageKey){
  if (!user || !user.email) return false;
  const db = getFirestore(app);
  try {
    const snap = await getDoc(doc(db, "editors", pageKey, "emails", user.email.toLowerCase()));
    return snap.exists();
  } catch (e){
    console.error("No se pudo verificar permisos de edición:", e);
    return false;
  }
}
