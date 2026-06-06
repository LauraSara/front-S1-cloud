# VitalGuard Frontend

Aplicación web para el monitoreo de signos vitales y gestión de alertas médicas hospitalarias. Forma parte del proyecto **VitalGuard** del curso Cloud Native (DSY2206, S3).

Permite a personal clínico autenticado consultar un panel resumen, administrar pacientes, registrar y monitorear signos vitales en tiempo real, y revisar o reconocer alertas generadas por el backend.

## Tecnologías

| Área | Stack |
|------|-------|
| Framework | Angular 19 (standalone components) |
| UI | Angular Material, SCSS |
| Gráficos | Chart.js + ng2-charts |
| Autenticación | Azure AD / Microsoft Entra ID (MSAL) |
| HTTP | Angular HttpClient con interceptores |
| Contenedor | Docker + Nginx |

## Requisitos previos

- **Node.js** 20 o superior (recomendado; usado en el `Dockerfile`)
- **npm** 10+
- **Angular CLI** 19 (opcional; los scripts de `package.json` usan `npx ng`)
- Backend BFF en ejecución (Spring Boot) en `http://localhost:8080/api`
- Registro de aplicación en Azure AD con los valores correspondientes en el entorno

## Configuración

Antes de levantar la app, edita los archivos de entorno según tu despliegue:

- Desarrollo local: `src/environments/environment.ts`
- Build Docker: `src/environments/environment.docker.ts`

Referencia de variables en `.env.example`:

```bash
API_URL=http://localhost:8080/api
AZURE_CLIENT_ID=TU_CLIENT_ID
AZURE_TENANT_ID=TU_TENANT_ID
AZURE_REDIRECT_URI=http://localhost:4200
AZURE_BFF_SCOPE=api://BFF_CLIENT_ID/access_as_user
POLLING_INTERVAL_VITALS=5000
POLLING_INTERVAL_DASHBOARD=10000
```

Los valores de Azure deben coincidir con el registro de la app en Entra ID y con la URL de redirección configurada allí.

## Cómo correr el proyecto

### Desarrollo local

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar el servidor de desarrollo:

```bash
npm start
```

Equivalente a `ng serve`. La app queda disponible en [http://localhost:4200](http://localhost:4200) y recarga automáticamente al guardar cambios.

3. Asegúrate de que el BFF esté corriendo en el puerto `8080` antes de iniciar sesión o consumir datos.

### Build de producción

```bash
npm run build
```

Genera los artefactos en `dist/vitalguard-frontend/`.

Build optimizado para contenedor Docker:

```bash
npm run build:docker
```

Usa `environment.docker.ts` en lugar del entorno de desarrollo.

### Docker

Construir y ejecutar con Docker Compose (expone la app en el puerto **4200**):

```bash
docker compose up --build
```

O manualmente:

```bash
docker build -t vitalguard-frontend .
docker run -p 4200:80 vitalguard-frontend
```

La imagen compila la app con Node 20 y la sirve con Nginx en el puerto 80 del contenedor.

### Tests

```bash
npm test
```

Ejecuta las pruebas unitarias con Karma y Jasmine.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo (`ng serve`) |
| `npm run build` | Build de producción |
| `npm run build:docker` | Build con configuración Docker |
| `npm run watch` | Build en modo watch (desarrollo) |
| `npm test` | Pruebas unitarias |

## Funcionalidades

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/login` | Auth | Inicio de sesión con Microsoft |
| `/dashboard` | Dashboard | Resumen de alertas y métricas (polling cada 10 s) |
| `/pacientes` | Pacientes | Listado y alta/edición de pacientes |
| `/pacientes/:id` | Pacientes | Detalle de un paciente |
| `/monitoreo` | Signos vitales | Monitoreo en tiempo real (polling cada 5 s) |
| `/alertas` | Alertas | Listado y reconocimiento de alertas |

Las rutas protegidas requieren sesión activa (`authGuard` + MSAL).

## Estructura del proyecto

```
src/
├── app/
│   ├── core/           # Auth (MSAL), guards, interceptores, ApiService
│   ├── features/       # Dashboard, pacientes, vitals, alertas, login
│   ├── models/         # Tipos e interfaces
│   ├── services/       # Servicios HTTP por dominio
│   └── shared/         # Layout, componentes y validadores reutilizables
├── environments/       # Configuración por entorno
└── styles.scss         # Estilos globales
public/                 # Assets estáticos (logo, etc.)
```

## Arquitectura

```
┌─────────────┐     MSAL      ┌──────────────┐     REST      ┌─────────────┐
│  VitalGuard │ ────────────► │  Azure AD    │               │  BFF API    │
│  (Angular)  │ ◄──────────── │  (Entra ID)  │               │  :8080/api  │
└─────────────┘               └──────────────┘               └─────────────┘
       │                                                              ▲
       └────────────────── HTTP + Bearer token ──────────────────────┘
```

## Recursos adicionales

- [Angular CLI](https://angular.dev/tools/cli)
- [MSAL Angular](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular)
- [Angular Material](https://material.angular.io/)
