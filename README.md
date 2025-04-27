![SocialReader Banner](./assets/img/logotipos/BannerReadMe.png)

# 📚 SocialReader

![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![OpenLibrary API](https://img.shields.io/badge/OpenLibrary-34A853?style=for-the-badge&logo=openlibrary&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-CC%20BY--NC--ND%204.0-blue.svg)

---

> **SocialReader** es una red social para lectores donde los usuarios pueden compartir sus lecturas, reseñas y conectar con otros amantes de los libros.  
> El objetivo es ofrecer una experiencia de lectura social, sencilla y atractiva, combinando exploración de libros, creación de contenido y comunidad.

---

## ✨ Características principales

- 🔐 Registro e inicio de sesión con correo electrónico, Google o GitHub.
- 📚 Búsqueda de libros usando OpenLibrary API.
- 💖 Guardar libros en **Favoritos** y **Mostrar más tarde**.
- 📝 Crear reseñas de libros con valoraciones, texto y opción de spoilers.
- 🧑‍🤝‍🧑 Añadir amigos, gestionar contactos y ver sus reseñas.
- 🧩 Gestión del perfil de usuario (nombre, correo, avatar, fecha de alta).
- ⚡ Notificaciones tipo **toast** y modales personalizados para errores.
- 📱 Diseño responsive adaptable a móviles, tablets y escritorio.

---

## 🛠️ Tecnologías utilizadas

- **Frontend:**
  - HTML5, CSS3, JavaScript (ES6+)
  - Animaciones CSS personalizadas
  - Responsive Web Design

- **Backend:**
  - Firebase Authentication (correo, Google, GitHub)
  - Firebase Firestore Database (usuarios, reseñas)

- **APIs externas:**
  - OpenLibrary API (búsqueda y detalles de libros)

---

## 🗂️ Estructura del proyecto

SocialReader/
│
├── assets/
│   ├── img/
│   │   ├── avatars/
│   │   │   └── [Avatares de usuario]
│   │   ├── interface/
│   │   │   └── [Íconos e imágenes de la interfaz]
│   │   └── logotipos/
│   │       └── LogoClaro.png
│
├── styles/
│   ├── login.css
│   ├── home.css
│   ├── search.css
│   ├── profile.css
│   ├── detalles.css
│   ├── resena.css
│
├── views/
│   ├── login.html
│   ├── home.html
│   ├── search.html
│   ├── profile.html
│   ├── detalles.html
│   ├── resena.html
│
├── js/
│   ├── login.js
│   ├── home.js
│   ├── search.js
│   ├── profile.js
│   ├── detalles.js
│   ├── resena.js
│   ├── router.js
│   ├── firebase.js
│   ├── services/
│   │   ├── firestoreService.js
│   │   ├── openlibrary.js
│
├── index.html
├── README.md
└── package.json (si lo hubieras añadido en algún momento)

---

## 🚀 Estado actual del proyecto

| Funcionalidad | Estado |
|:--------------|:------:|
| Registro e inicio de sesión | ✅ |
| Búsqueda de libros | ✅ |
| Guardar en favoritos y mostrar más tarde | ✅ |
| Crear y ver reseñas | ✅ |
| Gestión de amigos | ✅ |
| Responsive Design y animaciones | ✅ |
| Gestión de errores | ✅ |

---

## 🎯 Futuras mejoras

- 🔎 Ampliar la búsqueda por género, idioma o fecha.
- 📈 Añadir estadísticas de lectura por usuario.
- 🔔 Implementar notificaciones entre amigos.
- 📚 Seguimiento de progreso de lectura por libro.
- 🎨 Personalización avanzada del perfil de usuario.

---

## 🧑‍💻 Autor

- **Ángel Martínez Ordiales**  
  📅 Año: 2025  
  🚀 Proyecto: **SocialReader**  
  📫 Contacto: *(opcional, tu correo o GitHub si quieres)*

---

## 📜 Licencia

Este proyecto está bajo la licencia:

[![License](https://img.shields.io/badge/license-CC%20BY--NC--ND%204.0-blue.svg)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

**Creative Commons Atribución-NoComercial-SinDerivadas 4.0 Internacional (CC BY-NC-ND 4.0)**.  
Puedes consultar los términos completos aquí:  
➡️ [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/)

---

# ¡Gracias por visitar **SocialReader**! 🚀📖