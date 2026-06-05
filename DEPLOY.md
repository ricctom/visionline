# Deploy OptiMundo en Railway

## Requisitos previos
- Cuenta en [railway.app](https://railway.app) (gratuita)
- Cuenta en [github.com](https://github.com) (gratuita)
- Git instalado

---

## Paso 1 — Subir el proyecto a GitHub

```bash
cd visionline

git init
git add .
git commit -m "OptiMundo inicial"

# Crear repo en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/visionline.git
git push -u origin main
```

---

## Paso 2 — Crear proyecto en Railway

1. Entrá a [railway.app](https://railway.app) → **New Project**
2. Elegí **Deploy from GitHub repo**
3. Conectá tu cuenta de GitHub y seleccioná el repo `visionline`
4. Railway detecta automáticamente el `railway.json` y arranca el build

---

## Paso 3 — Agregar volumen persistente (para SQLite)

Railway usa disco efímero por defecto — la base de datos se borra en cada deploy.
Para que persista necesitás un volumen:

1. En tu proyecto Railway → pestaña **Volumes**
2. Click **Add Volume**
3. Mount path: `/app/data`
4. Guardá

---

## Paso 4 — Configurar variables de entorno

En Railway → pestaña **Variables**, agregá:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `file:/app/data/visionline.db` |
| `JWT_SECRET` | (generá una clave larga y random, ej: `openssl rand -hex 32`) |
| `NODE_ENV` | `production` |

---

## Paso 5 — Cargar los datos demo (seed)

Una vez que el deploy esté arriba, entrá a la terminal de Railway:
Railway → tu servicio → pestaña **Shell**:

```bash
node seed-rusty.js
node seed-demo.js
```

---

## Paso 6 — Obtener la URL pública

Railway asigna una URL automáticamente del tipo:
`https://visionline-production-xxxx.up.railway.app`

Para tener un dominio propio: Railway → **Settings** → **Domains** → podés agregar un dominio custom o generar uno de Railway.

---

## PWA — Instalar como app en el celular

Una vez que tenés la URL pública:

**Android (Chrome):**
1. Abrí la URL en Chrome
2. Tocá el menú (⋮) → "Agregar a pantalla de inicio"
3. O aparece el banner automático de instalación

**iOS (Safari):**
1. Abrí la URL en Safari
2. Tocá el botón de compartir (□↑) → "Agregar a pantalla de inicio"

---

## Actualizaciones futuras

Cada vez que hagas `git push`, Railway redeploya automáticamente.
