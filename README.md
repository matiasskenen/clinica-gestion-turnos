# 🏥 Clínica Online — Sistema de Gestión de Turnos y Pacientes

> **Trabajo Práctico Final — Laboratorio de Computación IV**  
> **Desarrollador:** Matias Skenen  
> **Tecnologías:** Angular 18 (Standalone & Routing Modular), Firebase Auth, Cloud Firestore, Firebase Storage, PrimeNG, Bootstrap.

---

## 📌 Tabla de Contenidos
1. [Descripción General](#-descripción-general)
2. [Roles de Usuario y Permisos](#-roles-de-usuario-y-permisos)
3. [Funcionalidades Principales](#-funcionalidades-principales)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Seguridad y Validaciones](#-seguridad-y-validaciones)
6. [Reportes y Exportaciones](#-reportes-y-exportaciones)
7. [Capturas de Pantalla](#-capturas-de-pantalla)
8. [Instalación y Configuración](#-instalación-y-configuración)
9. [Despliegue (Firebase Hosting)](#-despliegue-firebase-hosting)

---

## 📖 Descripción General

**Clínica Online** es una Single Page Application (SPA) para la administración integral de una institución médica. El sistema permite coordinar la interacción entre **Pacientes**, **Especialistas de la Salud** y **Administradores**, contemplando:

* Gestión y reserva de turnos en tiempo real con validación de franjas horarias y días hábiles.
* Historias clínicas con parámetros fijos (peso, altura, presión, temperatura) y dinámicos personalizables por cada profesional.
* Panel estadístico con gráficos y logs exportables a **PDF** y **Excel**.
* Verificación de cuentas por correo electrónico y habilitación administrativa previa para profesionales de la salud.

---

## 👥 Roles de Usuario y Permisos

| Rol | Registro | Acceso y Verificaciones Requeridas | Capacidades en el Sistema |
| :--- | :--- | :--- | :--- |
| **Paciente** | Formulario propio con 2 fotos de perfil, obra social, DNI y datos personales. | Requiere **correo verificado** vía Firebase Auth. | Solicitar turnos (hasta 15 días a futuro), cancelar turnos propios con motivo, calificar atención, responder encuestas de satisfacción, consultar y descargar su historia clínica en PDF. |
| **Especialista** | Formulario con especialidades médicas (predefinidas o personalizadas) y 1 foto de perfil. | Requiere **correo verificado** y **habilitación del Administrador**. | Configurar horarios y días de atención, aceptar/rechazar/cancelar/finalizar turnos, redactar reseñas/diagnósticos y cargar la historia clínica del paciente. |
| **Administrador** | Creado por administración / preconfigurado. | Acceso total mediante credenciales. | Habilitar o inhabilitar especialistas, dar de alta nuevos usuarios, visualizar todos los turnos de la clínica, descargar historiales y consultar el módulo de estadísticas y logs. |

---

## 🚀 Funcionalidades Principales

### 1. Autenticación y Onboarding
* **Login rápido:** Accesos directos con perfiles predeterminados para agilizar pruebas y corrección.
* **Flujo estricto de login:** Bloqueo y deslogueo automático si el usuario no tiene correo validado o si el especialista no fue autorizado.
* **Captcha:** Componente y directiva personalizada para verificar interacciones humanas en el registro y solicitud de turnos.

### 2. Circuito Completo de Turnos
* **Disponibilidad dinámica:** Los turnos se calculan en base a la jornada configurada por el especialista (en bloques de 20/30 minutos).
* **Estados del turno:**
  * `Pendiente`: Esperando confirmación del especialista.
  * `Aceptado`: Confirmado por el médico.
  * `Cancelado`: Cancelado por el paciente, especialista o admin (con motivo obligatorio).
  * `Rechazado`: Rechazado por el especialista con justificación.
  * `Diagnosticado / Finalizado`: Con historia clínica y reseña registrada.
* **Filtros inteligentes:** Búsqueda en tablas y listados por múltiples criterios (especialidad, médico, paciente, fecha, parámetros clínicos) mediante Custom Pipes (`FilterPipe`).

### 3. Historia Clínica y Atención Médica
* Campos clínicos estándar: **Altura (cm)**, **Peso (kg)**, **Presión arterial (mmHg)**, **Temperatura (°C)**.
* Hasta **6 pares clave/valor dinámicos** adicionales (ej.: *Glucemia*, *Colesterol*, *Alergias*, etc.).
* Historial consultable por paciente y descargable en documento PDF formal.

---

## 📂 Estructura del Proyecto

```text
src/
├── app/
│   ├── components/
│   │   ├── directivas/             # Directivas personalizadas (Captcha, Scroll, AuthCheck)
│   │   ├── estadisticas/           # Gráficos de PrimeNG (Turnos por día, especialidad, logs)
│   │   ├── header/                 # Barra de navegación reactiva al rol autenticado
│   │   ├── home/                   # Vista principal de bienvenida y acceso
│   │   ├── login/                  # Inicio de sesión con accesos directos
│   │   ├── pacientes-atendidos/    # Vista de pacientes atendidos para especialistas
│   │   ├── perfiles/               # Perfiles específicos (Paciente, Especialista, Admin)
│   │   ├── pipes/                  # Pipes personalizados para filtrado de datos y ayuda
│   │   ├── register/               # Formularios reactivos de registro y captcha
│   │   ├── seccionusuarios/        # Gestión y habilitación de usuarios por parte del Admin
│   │   └── turnos/                 # Módulo de gestión y solicitud de turnos
│   │       ├── admin/
│   │       ├── especialistas/
│   │       └── pacientes/
│   ├── guards/                     # Navigation Guards de Angular (canActivate por rol)
│   │   └── auth.guard.ts           # authGuard, adminGuard, especialistaGuard, pacienteGuard
│   ├── services/                   # Servicios que integran Firebase y la lógica de negocio
│   │   ├── authUsers/              # Manejo del estado de sesión y usuario activo
│   │   ├── turnos/                 # Operaciones CRUD sobre Firestore (turnos, logs, encuestas)
│   │   └── usuarios/               # Creación y consulta de pacientes, especialistas y admins
│   ├── app.config.ts               # Proveedores de Angular 18 (Router, Firestore, Auth, Storage)
│   ├── app.routes.ts               # Definición de rutas protegidas por Guards
│   └── environmentConfig.ts        # Credenciales de conexión a Firebase
```

---

## 🛡️ Seguridad y Validaciones

* **Protección de Rutas (`Guards`):** Ninguna ruta sensible (`/seccionusuarios`, `/estadisticas`, `/turnoAdmin`, `/turnosEspecialistas`, `/turnoPaciente`) puede ser accedida por usuarios no autenticados o con roles no autorizados.
* **Credenciales protegidas:** Las contraseñas se administran exclusivamente a través de **Firebase Authentication**; no se persisten en texto plano en la base de datos Firestore.
* **Control de Fugas de Memoria:** Manejo de suscripciones RxJS con cierre explícito mediante `firstValueFrom`, `take(1)` y `Subscription.unsubscribe()` en los hooks de ciclo de vida (`ngOnDestroy`).

---

## 📊 Reportes y Exportaciones

* **Descarga de Historias Clínicas en PDF:** Generación estructurada con `jsPDF` filtrada por paciente o por especialidad.
* **Exportación de Datos a Excel:** Generación de planillas de pacientes, turnos y logs mediante `xlsx` (SheetJS) y `file-saver`.
* **Gráficos Estadísticos:**
  * Turnos por día.
  * Turnos por especialidad.
  * Turnos por médico.
  * Turnos finalizados por médico.
  * Logs de ingresos de usuarios al sistema.

---

## 🖼️ Capturas de Pantalla

### Acceso y Autenticación
![Login con accesos rápidos](https://github.com/user-attachments/assets/53c2d203-97cb-4343-b6b5-a09d367fde79)
*Pantalla de Login con autocompletado rápido de perfiles para testing.*

---

### Registro de Usuarios
![Selección de Rol en Registro](https://github.com/user-attachments/assets/df552fcf-4143-4016-be15-0ce0e1484a1f)
*Selección del tipo de cuenta: Paciente o Especialista.*

![Formulario Especialista con Captcha](https://github.com/user-attachments/assets/ddf3d0b4-e9d0-4def-b714-f6b97e65a595)
*Formulario reactivo con selección múltiple de especialidades y validación de Captcha.*

---

### Gestión y Reserva de Turnos
![Manejo de Turnos](https://github.com/user-attachments/assets/51d195c4-e5e0-4c83-9822-4b9be8c99d29)
*Panel del Especialista: opciones para aceptar, cancelar, rechazar o finalizar turnos.*

![Disponibilidad de Turnos](https://github.com/user-attachments/assets/4a9c7ba8-cadc-454e-be2f-11bb65899e57)
*Franjas horarias autogeneradas según la disponibilidad declarada por el profesional.*

![Panel Paciente](https://github.com/user-attachments/assets/b6bab0e6-4184-493c-a6cc-91e93c6ef707)
*Panel del Paciente: seguimiento de turnos pendientes, finalizados y acceso a encuesta.*

![Solicitud de Turno](https://github.com/user-attachments/assets/4129a2e1-33ad-483a-bb01-81a0bc3f92c9)
*Módulo interactivo para selección de médico, especialidad y fecha del turno.*

---

## ⚙️ Instalación y Configuración

### Prerrequisitos
* [Node.js](https://nodejs.org/) (versión 18 o 20 LTS recomendada)
* [Angular CLI](https://angular.dev/) (`npm install -g @angular/cli`)

### Pasos para ejecutar localmente

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd clinica-gestion-turnos-master
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Verificar configuración de Firebase:**
   Revisar o configurar las credenciales en `src/app/environmentConfig.ts`:
   ```typescript
   export const environmentConfig = {
     apiKey: "TU_API_KEY",
     authDomain: "TU_PROYECTO.firebaseapp.com",
     projectId: "TU_PROJECT_ID",
     storageBucket: "TU_PROYECTO.firebasestorage.app",
     messagingSenderId: "SENDER_ID",
     appId: "APP_ID",
     measurementId: "MEASUREMENT_ID"
   };
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm start
   # O alternativamente:
   ng serve
   ```
   Abrir en el navegador en `http://localhost:4200/`.

---

## 🚀 Despliegue (Firebase Hosting)

1. Compilar la aplicación en modo producción:
   ```bash
   npm run build
   ```
   *(La salida se generará en `dist/tplabo4final/browser`).*

2. Iniciar sesión e inicializar Firebase CLI (si no se realizó previamente):
   ```bash
   firebase login
   ```

3. Desplegar únicamente a Hosting:
   ```bash
   firebase deploy --only hosting
   ```
