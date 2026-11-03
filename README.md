# Clínica Online - Sistema de Gestión de Turnos

Proyecto desarrollado en Angular 18 y Firebase (Auth, Firestore y Storage) para la administración de turnos médicos, historias clínicas y usuarios de una clínica.

---

## 👨‍💻 Roles y accesos

* **Paciente:**
  * Registro con datos personales, obra social y 2 fotos de perfil.
  * Requiere verificación de mail para ingresar.
  * Puede solicitar turnos (hasta 15 días a futuro), cancelarlos con motivo, calificar la atención, completar encuestas y descargar su historia clínica en PDF.

* **Especialista:**
  * Registro con especialidades (predefinidas o personalizadas) y 1 foto.
  * Requiere verificación de mail y habilitación previa por un Administrador.
  * Configura sus días y horarios de atención, gestiona sus turnos (aceptar, cancelar, rechazar o finalizar) y carga la historia clínica del paciente.

* **Administrador:**
  * Habilita o deshabilita especialistas.
  * Da de alta usuarios (admin, especialista o paciente).
  * Accede a todos los turnos del sistema, historial de pacientes y módulo de estadísticas/logs.

---

## ⚙️ Características principales

* **Gestión de turnos en tiempo real:** Franjas horarias automáticas según la jornada del médico, con estados (`Pendiente`, `Aceptado`, `Cancelado`, `Rechazado`, `Finalizado`).
* **Historia clínica:** Datos fijos (altura, peso, presión, temperatura) y hasta 6 campos dinámicos personalizables por el médico.
* **Filtros avanzados:** Búsqueda rápida sobre tablas por cualquier campo mediante pipes personalizados.
* **Seguridad y Guards:** Rutas protegidas según el perfil activo (`authGuard`, `adminGuard`, `especialistaGuard`, `pacienteGuard`).
* **Reportes:** Exportación de historias clínicas a PDF (`jsPDF`) y listados/estadísticas a Excel (`xlsx`).
* **Captcha y directivas:** Validación de seguridad humana en registro y acciones clave.

---

## 📸 Capturas

### Login con accesos rápidos
![Login](https://github.com/user-attachments/assets/53c2d203-97cb-4343-b6b5-a09d367fde79)

### Registro de usuarios y captcha
![Selección de rol](https://github.com/user-attachments/assets/df552fcf-4143-4016-be15-0ce0e1484a1f)
![Registro con captcha](https://github.com/user-attachments/assets/ddf3d0b4-e9d0-4def-b714-f6b97e65a595)

### Panel de turnos del especialista
![Gestión de turnos](https://github.com/user-attachments/assets/51d195c4-e5e0-4c83-9822-4b9be8c99d29)
![Horarios configurados](https://github.com/user-attachments/assets/4a9c7ba8-cadc-454e-be2f-11bb65899e57)

### Panel de turnos del paciente y solicitud
![Turnos paciente](https://github.com/user-attachments/assets/b6bab0e6-4184-493c-a6cc-91e93c6ef707)
![Solicitar turno](https://github.com/user-attachments/assets/4129a2e1-33ad-483a-bb01-81a0bc3f92c9)

---

## 🛠️ Tecnologías

* **Frontend:** Angular 18 (Standalone components, Reactive Forms, Router, RxJS).
* **Backend as a Service:** Firebase Authentication, Cloud Firestore y Firebase Storage.
* **UI & Utilidades:** Bootstrap 5, PrimeNG (gráficos), SweetAlert2, jsPDF, SheetJS (xlsx).

---

## 🚀 Cómo correr el proyecto

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor local:**
   ```bash
   npm start
   ```
   Abrir en el navegador en `http://localhost:4200/`.

3. **Deploy a Firebase:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
