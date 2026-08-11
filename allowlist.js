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
