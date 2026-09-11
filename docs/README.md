# Guía Práctica de Ejercicios: Docker Compose

Esta guía contiene 7 ejercicios orientados a la práctica de orquestación de servicios mediante Docker Compose. Incluye la creación de imágenes personalizadas con Dockerfile, interconexión de contenedores (API y base de datos), resolución DNS interna, persistencia mediante volúmenes, separación de ambientes (QA y Producción) sobre redes independientes y comandos de limpieza del entorno.

**Consideración técnica:** Todos los ejercicios deben realizarse utilizando versiones específicas de las imágenes (tags). No se debe utilizar la etiqueta `latest`.



### Ejercicio 1: Creación de Dockerfile para API Node.js
**Objetivo:** Construir un archivo Dockerfile para empaquetar una aplicación Node.js / Express y preparar su imagen para su posterior orquestación.
**Instrucciones:**
1. Ingresar al directorio `ejercicios_compose/node_mysql_api`.
2. Crear un archivo `Dockerfile` con las siguientes instrucciones:
   - Utilizar `node:20-alpine` como imagen base (`FROM`).
   - Establecer `/app` como directorio de trabajo (`WORKDIR`).
   - Copiar el archivo `package.json` (`COPY`).
   - Instalar las dependencias de producción ejecutando `RUN npm install --production`.
   - Copiar el resto de los archivos del proyecto al contenedor (`COPY`).
   - Exponer el puerto 3000 (`EXPOSE 3000`).
   - Definir el comando de inicio (`CMD ["node", "server.js"]`).
3. Construir la imagen con la etiqueta `node-api:1.0` utilizando `docker build` para validar que no existan errores de sintaxis.



### Ejercicio 2: Orquestación de API Node.js y MySQL
**Objetivo:** Desplegar una aplicación Node.js interconectada con una base de datos MySQL 8.4 mediante un archivo `docker-compose.yml`.
**Instrucciones:**
1. En el directorio `ejercicios_compose/node_mysql_api`, crear el archivo `docker-compose.yml`.
2. Definir un servicio para la base de datos denominado `db`:
   - Utilizar la imagen `mysql:8.4`.
   - Configurar las variables de entorno `MYSQL_ROOT_PASSWORD=rootpassword` y `MYSQL_DATABASE=testdb`.
   - Crear y asociar un volumen con nombre `mysql_data` hacia la ruta `/var/lib/mysql`.
3. Definir un servicio para la aplicación denominado `api`:
   - Indicar la construcción a partir del directorio actual (`build: .`).
   - Mapear el puerto 3000 del contenedor al puerto 3000 local.
   - Declarar la dependencia hacia la base de datos (`depends_on`).
   - Configurar las variables de entorno para la conexión:
     - `DB_HOST=db` (nombre del servicio de base de datos dentro de la red interna).
     - `DB_USER=root`.
     - `DB_PASSWORD=rootpassword`.
     - `DB_NAME=testdb`.
     - `PORT=3000`.
4. Levantar los servicios en segundo plano mediante `docker compose up -d --build`.
5. Comprobar el estado de ejecución con `docker compose ps` e inspeccionar los logs de la API con `docker compose logs -f api`.
6. Enviar una petición POST utilizando `curl` para registrar un dato:
   ```bash
   curl -X POST http://localhost:3000/items -H "Content-Type: application/json" -d "{\"text\": \"Primer registro\"}"
   ```
7. Consultar los registros almacenados en `http://localhost:3000/items`.
8. Detener los servicios mediante `docker compose down`.



### Ejercicio 3: Ambientes independientes QA y PROD en Node.js y MySQL
**Objetivo:** Configurar en un mismo `docker-compose.yml` dos entornos completos (QA y Producción), cada uno con su propia API y base de datos, aislados mediante redes independientes.
**Instrucciones:**
1. En `ejercicios_compose/node_mysql_api`, modificar `docker-compose.yml` definiendo dos redes de tipo bridge: `net_qa` y `net_prod`.
2. Configurar los servicios del ambiente QA asociados exclusivamente a `net_qa`:
   - `db_qa`: Imagen `mysql:8.4`, variables `MYSQL_ROOT_PASSWORD=qa_pass` y `MYSQL_DATABASE=db_qa`, volumen `mysql_qa_data:/var/lib/mysql`.
   - `api_qa`: `build: .`, mapeo del puerto 3000 del contenedor al puerto 3001 local, variables `DB_HOST=db_qa`, `DB_PASSWORD=qa_pass`, `DB_NAME=db_qa`, `NODE_ENV=qa`. Depende de `db_qa`.
3. Configurar los servicios del ambiente PROD asociados exclusivamente a `net_prod`:
   - `db_prod`: Imagen `mysql:8.4`, variables `MYSQL_ROOT_PASSWORD=prod_pass` y `MYSQL_DATABASE=db_prod`, volumen `mysql_prod_data:/var/lib/mysql`.
   - `api_prod`: `build: .`, mapeo del puerto 3000 del contenedor al puerto 3000 local, variables `DB_HOST=db_prod`, `DB_PASSWORD=prod_pass`, `DB_NAME=db_prod`, `NODE_ENV=production`. Depende de `db_prod`.
4. Levantar los 4 contenedores con `docker compose up -d --build`.
5. Insertar un registro en QA (`http://localhost:3001/items`) y un registro distinto en PROD (`http://localhost:3000/items`).
6. Verificar que los datos de QA no están presentes en PROD consultando ambos endpoints.
7. Ejecutar una prueba de conectividad desde el contenedor `api_qa` hacia `db_prod`:
   ```bash
   docker compose exec api_qa ping -c 2 db_prod
   ```
   Comprobar que la resolución falla debido a que pertenecen a redes distintas.



### Ejercicio 4: Construcción Multi-Stage con Dockerfile (Spring Boot)
**Objetivo:** Elaborar un archivo Dockerfile de múltiples etapas para compilar el código Java de una API Spring Boot y generar una imagen final liviana.
**Instrucciones:**
1. Ingresar al directorio `ejercicios_compose/spring_postgres_api`.
2. Crear un archivo denominado `Dockerfile` con las siguientes dos etapas:
   - **Etapa de compilación:**
     - Utilizar `maven:3.9.6-eclipse-temurin-17-alpine` con el alias `builder` (`FROM ... AS builder`).
     - Establecer `/app` como directorio de trabajo.
     - Copiar `pom.xml` y ejecutar `mvn dependency:go-offline -B`.
     - Copiar la carpeta `src` al contenedor.
     - Compilar el proyecto omitiendo pruebas unitarias: `mvn clean package -DskipTests`.
   - **Etapa final de ejecución:**
     - Utilizar `eclipse-temurin:17-jre-alpine` como imagen base.
     - Establecer `/app` como directorio de trabajo.
     - Copiar el archivo JAR resultante desde la etapa anterior: `COPY --from=builder /app/target/*.jar app.jar`.
     - Exponer el puerto 8080 (`EXPOSE 8080`).
     - Establecer el comando de ejecución: `ENTRYPOINT ["java", "-jar", "app.jar"]`.
3. Probar la compilación de la imagen localmente con `docker build -t spring-api:1.0 .`.



### Ejercicio 5: Orquestación de API Spring Boot y PostgreSQL
**Objetivo:** Desplegar una aplicación Spring Boot interconectada con una base de datos PostgreSQL 16 y verificar la persistencia de datos relacionales.
**Instrucciones:**
1. En el directorio `ejercicios_compose/spring_postgres_api`, crear el archivo `docker-compose.yml`.
2. Definir un servicio para la base de datos denominado `postgres_db`:
   - Utilizar la imagen `postgres:16-alpine`.
   - Configurar las variables de entorno: `POSTGRES_DB=taskdb`, `POSTGRES_USER=postgres` y `POSTGRES_PASSWORD=postgres`.
   - Asociar un volumen con nombre `postgres_data` a la ruta `/var/lib/postgresql/data`.
3. Definir un servicio para la aplicación denominado `spring_api`:
   - Indicar la construcción a partir del directorio actual (`build: .`).
   - Mapear el puerto 8080 del contenedor al puerto 8080 local.
   - Declarar la dependencia hacia la base de datos (`depends_on`).
   - Inyectar las variables de entorno de conexión:
     - `DB_HOST=postgres_db`
     - `DB_PORT=5432`
     - `DB_NAME=taskdb`
     - `DB_USER=postgres`
     - `DB_PASSWORD=postgres`
     - `PORT=8080`
4. Iniciar los contenedores con `docker compose up -d --build`.
5. Verificar mediante `docker compose logs -f spring_api` que la aplicación inicie y conecte con PostgreSQL.
6. Crear una tarea mediante una petición POST:
   ```bash
   curl -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d "{\"title\": \"Tarea Compose\", \"description\": \"Ejercicio 5\"}"
   ```
7. Consultar las tareas en `http://localhost:8080/tasks`.
8. Detener los contenedores con `docker compose down`, volver a levantarlos con `docker compose up -d` y verificar que las tareas registradas persisten.



### Ejercicio 6: Ambientes independientes QA y PROD en Spring Boot y PostgreSQL
**Objetivo:** Orquestar en un mismo archivo Compose dos pilas completas de Spring Boot y PostgreSQL sobre redes separadas, verificando el aislamiento entre ambos entornos.
**Instrucciones:**
1. En `ejercicios_compose/spring_postgres_api`, modificar `docker-compose.yml` declarando dos redes: `net_spring_qa` y `net_spring_prod`.
2. Configurar los servicios del ambiente QA vinculados únicamente a `net_spring_qa`:
   - `pg_qa`: Imagen `postgres:16-alpine`, variables `POSTGRES_DB=taskdb_qa`, `POSTGRES_USER=qa_user`, `POSTGRES_PASSWORD=qa_pass`, volumen `pg_qa_data:/var/lib/postgresql/data`.
   - `spring_qa`: `build: .`, mapear puerto local 8081 al 8080 del contenedor, variables `DB_HOST=pg_qa`, `DB_PORT=5432`, `DB_NAME=taskdb_qa`, `DB_USER=qa_user`, `DB_PASSWORD=qa_pass`. Depende de `pg_qa`.
3. Configurar los servicios del ambiente PROD vinculados únicamente a `net_spring_prod`:
   - `pg_prod`: Imagen `postgres:16-alpine`, variables `POSTGRES_DB=taskdb_prod`, `POSTGRES_USER=prod_user`, `POSTGRES_PASSWORD=prod_pass`, volumen `pg_prod_data:/var/lib/postgresql/data`.
   - `spring_prod`: `build: .`, mapear puerto local 8080 al 8080 del contenedor, variables `DB_HOST=pg_prod`, `DB_PORT=5432`, `DB_NAME=taskdb_prod`, `DB_USER=prod_user`, `DB_PASSWORD=prod_pass`. Depende de `pg_prod`.
4. Ejecutar el despliegue con `docker compose up -d --build`.
5. Crear un registro en QA (`http://localhost:8081/tasks`) y un registro en PROD (`http://localhost:8080/tasks`).
6. Comprobar que ambas APIs consultan bases de datos independientes y que no existe comunicación entre `spring_qa` y `pg_prod`.



### Ejercicio 7: Limpieza del entorno (Cleanup)
**Objetivo:** Detener servicios orquestados y eliminar contenedores, redes e imágenes intermedias, diferenciando la preservación o borrado de volúmenes persistentes.
**Instrucciones:**
1. Detener y remover los contenedores y redes manteniendo los volúmenes intactos:
   ```bash
   docker compose down
   ```
2. Listar los volúmenes para confirmar que la información sigue almacenada en el sistema anfitrión:
   ```bash
   docker volume ls
   ```
3. Detener y remover los contenedores eliminando al mismo tiempo los volúmenes declarados en el compose:
   ```bash
   docker compose down -v
   ```
4. Ejecutar el comando de limpieza general del sistema:
   ```bash
   docker system prune
   ```
