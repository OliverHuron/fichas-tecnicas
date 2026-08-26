# SIAF Fichas Técnicas — Runbook de Despliegue en Producción

Servidor físico compartido con `siaf-nominas` y `siaf-solicitudes`. Arquitectura:

```
Internet → Cloudflare Tunnel → cloudflared (systemd) → nginx :80
                                                            ├─ /var/www/siaf-fichatecnica/client/dist (estático, SPA)
                                                            └─ /api → localhost:5003 → PM2 → Express → PostgreSQL (fichatecnica_db)
```

Despliegue automático: `push` a `main` → GitHub Actions → runner self-hosted en el servidor (label `siaf`,
el mismo runner ya usado por los otros proyectos SIAF) → `rsync` + build + migraciones + `pm2 restart`.
No hay SSH manual en el flujo normal, pero el setup inicial sí se hace a mano, paso por paso, abajo.

Todos los comandos van por **SSH al servidor**, como usuario `oliver`, salvo que se indique otra
cosa. Ejecuta los pasos en orden.

---

## Paso 1 — Verificar dependencias del sistema

Si ya desplegaste `siaf-nominas` o `siaf-solicitudes` en este servidor, todo esto ya está instalado:

```bash
node -v          # esperado: v20+
psql --version   # esperado: 16
nginx -v
pm2 -v
cloudflared --version
```

---

## Paso 2 — Crear la carpeta de despliegue con permisos correctos

```bash
sudo mkdir -p /var/www/siaf-fichatecnica
sudo chown -R oliver:oliver /var/www/siaf-fichatecnica
```

```bash
ls -ld /var/www/siaf-fichatecnica   # debe mostrar "oliver oliver"
```

---

## Paso 3 — Permisos `sudo` sin contraseña (si no se agregaron ya para otro proyecto)

```bash
sudo visudo -f /etc/sudoers.d/siaf-fichatecnica
```

```
oliver ALL=(ALL) NOPASSWD: /bin/chown -R oliver\:oliver /var/www/siaf-fichatecnica
oliver ALL=(postgres) NOPASSWD: /usr/bin/psql
```

```bash
sudo visudo -c
```

---

## Paso 4 — Crear la base de datos y el usuario de PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE fichatecnica_db;
CREATE USER fichatecnica_admin WITH ENCRYPTED PASSWORD 'CAMBIA_ESTA_CONTRASEÑA';
GRANT ALL PRIVILEGES ON DATABASE fichatecnica_db TO fichatecnica_admin;
\c fichatecnica_db
GRANT ALL ON SCHEMA public TO fichatecnica_admin;
\q
```

- No hace falta correr `001_initial.sql` a mano — el workflow lo ejecuta solo en el primer deploy
  (Paso 10), vía `npm run migrate`, que además siembra las 4 comisiones y los usuarios iniciales
  con `npm run seed` (ver Paso 11).

---

## Paso 5 — Crear el archivo `.env` de producción (backup fuera del repo)

```bash
sudo mkdir -p /var/www
sudo nano /var/www/.env.siaf-fichatecnica
```

- Contenido exacto (ajustar la contraseña al valor real del Paso 4, y `JWT_SECRET` a un string
  largo y aleatorio, no el mismo que uses en desarrollo local ni el de otros proyectos SIAF):
```
NODE_ENV=production
PORT=5003
CLIENT_URL=https://fichatecnica.siafsystem.online
DB_HOST=localhost
DB_PORT=5432
DB_USER=fichatecnica_admin
DB_PASSWORD=CAMBIA_ESTA_CONTRASEÑA
DB_NAME=fichatecnica_db
JWT_SECRET=GENERA_UN_STRING_LARGO_Y_ALEATORIO
JWT_EXPIRE=7d
```

```bash
sudo chown oliver:oliver /var/www/.env.siaf-fichatecnica
sudo chmod 600 /var/www/.env.siaf-fichatecnica
```

---

## Paso 6 — Runner de GitHub Actions (label `siaf`)

```bash
systemctl list-units --type=service | grep -i actions.runner
```

- Si ya existe un runner con label `siaf` corriendo en este servidor (compartido entre proyectos
  SIAF), no hace falta registrar otro: solo agrega este repo a los que ese runner atiende. Si no
  existe, sigue el mismo procedimiento documentado en el runbook de `siaf-nominas` (Paso 6),
  cambiando la URL del repo a `siaf-fichatecnica` y el `--name` a `siaf-fichatecnica`.

---

## Paso 7 — Server block de nginx

```bash
sudo nano /etc/nginx/sites-available/siaf-fichatecnica
```

```nginx
server {
    listen 80;
    server_name fichatecnica.siafsystem.online;

    root /var/www/siaf-fichatecnica/client/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSE: el directivo mantiene esta conexión abierta para ver en tiempo real
    # cuándo cada comisión abre su ficha. Sin esto, nginx bufferea la
    # respuesta y el navegador nunca recibe los eventos.
    location ~ ^/api/solicitudes/[0-9]+/stream$ {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 24h;
        chunked_transfer_encoding off;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/siaf-fichatecnica /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

> `client/dist` todavía no existe en este punto (se crea en el Paso 10) — es normal que nginx
> devuelva error hasta entonces.

---

## Paso 8 — Agregar el hostname al Cloudflare Tunnel existente

```bash
sudo nano /etc/cloudflared/config.yml
```

- Agregar la línea de `ingress` para fichas técnicas, **antes** de la línea `service: http_status:404`:
```yaml
ingress:
  - hostname: staging.siafsystem.online
    service: http://localhost:80
  - hostname: solicitudes.siafsystem.online
    service: http://localhost:80
  - hostname: nominas.siafsystem.online
    service: http://localhost:80
  - hostname: fichatecnica.siafsystem.online
    service: http://localhost:80
  - service: http_status:404
```

```bash
cloudflared tunnel route dns <nombre-o-id-del-tunnel> fichatecnica.siafsystem.online
sudo systemctl restart cloudflared
sudo systemctl status cloudflared
```

---

## Paso 9 — Confirmar dueño único de PM2 (`oliver`, no `root`)

```bash
whoami
pm2 list
sudo pm2 list   # si esto también muestra procesos, hay un daemon de root corriendo
```

---

## Paso 10 — Disparar el primer despliegue

Desde tu máquina local (no en el servidor):
```bash
git push origin main
```

- Esto dispara `.github/workflows/deploy.yml`, que hace: `rsync` → `npm install` (server) →
  `npm install && npm run build` (client) → restaura `.env` → `npm run migrate` → `pm2 start
  src/index.js --name siaf-fichatecnica` (o `pm2 restart` si ya existe).

- Seguir el progreso en GitHub: pestaña **Actions** del repo `siaf-fichatecnica`.

---

## Paso 11 — Sembrar comisiones y usuarios iniciales (solo la primera vez)

```bash
cd /var/www/siaf-fichatecnica/server
npm run seed
```

- Crea los 4 coordinadores de comisión y un directivo inicial (usuario `directivo`), todos con la
  contraseña temporal `FichaTecnica2026!` — deben cambiarla desde **Mi cuenta** al ingresar por
  primera vez. Si ya existen (por un deploy previo), el script no los duplica.

---

## Paso 12 — Verificar que el despliegue funcionó

En el servidor:
```bash
pm2 list                                          # siaf-fichatecnica debe estar "online"
pm2 logs siaf-fichatecnica --lines 50
curl -s http://localhost:5003/api/health          # debe responder {"status":"OK",...}
```

Desde cualquier máquina:
```bash
curl -sI https://fichatecnica.siafsystem.online
curl -s https://fichatecnica.siafsystem.online/api/health
```

---

## Paso 13 — Persistencia tras reinicio del servidor

Como `oliver` (si `pm2 startup` ya se configuró para otro proyecto SIAF en este servidor, solo hace
falta el `pm2 save`):
```bash
pm2 startup   # copiar y ejecutar el comando sudo que imprime, si aún no se hizo
pm2 save
cat ~/.pm2/dump.pm2 | grep siaf-fichatecnica
```
