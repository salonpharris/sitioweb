/* =========================================================================
   CONFIGURACIÓN DE FIREBASE — EDITA AQUÍ
   ---------------------------------------------------------------------
   1. Ve a https://console.firebase.google.com y crea un proyecto (gratis).
   2. Dentro del proyecto: ⚙️ Configuración del proyecto → pestaña
      "General" → sección "Tus apps" → ícono </> (Agregar app web).
   3. Copia el objeto "firebaseConfig" que te entrega Firebase y pégalo
      reemplazando el de abajo.
   4. En el menú lateral entra a "Authentication" → pestaña "Sign-in method"
      y activa los proveedores: Google, Microsoft y Correo electrónico/contraseña.
   5. En "Authentication" → "Settings" → "Authorized domains", agrega el
      dominio de tu sitio (ej: tuusuario.github.io).
   6. En el menú lateral entra a "Firestore Database" → "Crear base de
      datos" → elige modo "producción" y la región más cercana (southamerica-east1).
   7. Ve a la pestaña "Reglas" de Firestore y reemplaza todo por esto,
      luego "Publicar":

      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /allowedUsers/{email} {
            allow get: if request.auth != null && request.auth.token.email == email;
            allow list, write: if false;
          }
        }
      }

   8. Para autorizar a alguien: pestaña "Datos" → "Iniciar colección" →
      nombre "allowedUsers" → como ID del primer documento escribe el
      correo de esa persona en minúsculas (ej: "juan.perez@gmail.com") →
      guarda con cualquier campo (no importa el contenido). Repite para
      cada persona que quieras autorizar. Para quitarle el acceso a
      alguien, simplemente elimina su documento.
   ========================================================================= */
export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxxxx"
};
