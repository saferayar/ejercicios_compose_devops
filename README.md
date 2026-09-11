# Ejercicios de Docker Compose - DevOps USM

Repositorio que contiene las aplicaciones base y la guía práctica de ejercicios sobre **Docker Compose**, cubriendo orquestación de servicios (API + Base de Datos), creación de imágenes mediante `Dockerfile`, persistencia de datos y aislamiento de ambientes (QA y Producción) en redes independientes.

---

## 📖 Visualizar la Documentación con Docsify

La documentación interactiva se encuentra en el directorio [`docs/`](./docs).

### Opción 1: Localmente con Node.js / NPX
Para levantar el servidor local de Docsify:

```bash
# Con npx (no requiere instalar nada globalmente):
npx docsify-cli serve docs

# O si tienes docsify instalado globalmente:
docsify serve docs
```

Luego abre tu navegador en: [http://localhost:3000](http://localhost:3000)

### Opción 2: Python (servidor HTTP simple)
```bash
python -m http.server 3000 --directory docs
```

### Opción 3: GitHub Pages
Este repositorio está estructurado para GitHub Pages:
1. Ve a **Settings** > **Pages** en tu repositorio de GitHub.
2. En **Build and deployment** selecciona:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` / carpeta `/docs`
3. Guarda los cambios y la documentación quedará publicada automáticamente en la web con el tema interactivo de Docsify.

---

## 📁 Estructura del Repositorio

```text
.
├── docs/                       # Sitio de documentación con Docsify
│   ├── index.html              # Entrada SPA de Docsify con buscador y plugins
│   ├── _sidebar.md             # Menú lateral navegable
│   ├── README.md               # Contenido principal de la guía de ejercicios
│   └── .nojekyll               # Desactiva Jekyll en GitHub Pages
├── node_mysql_api/             # API en Node.js (Express + MySQL)
│   ├── package.json
│   └── server.js
└── spring_postgres_api/        # API en Spring Boot (Java 17 + PostgreSQL)
    ├── pom.xml
    └── src/
        ├── main/java/com/example/demo/...
        └── main/resources/application.properties
```
