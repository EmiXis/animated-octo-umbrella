# Sistema de Gestión Académica (React + json-server)

Este proyecto resuelve la necesidad de **procesar información académica** mediante tres entidades relacionadas:

- **Estudiantes**
- **Cursos**
- **Inscripciones**

La interfaz en React implementa CRUD completo (crear, leer, actualizar y eliminar) para cada entidad.
El backend se simula con `json-server` y los estilos se construyen con `w3css`.

##Equipo

Emiliano Narciso Peralta Barrientos 190537

## Requisitos

- Node.js 18+
- npm 9+

## Descarga

```bash
git clone https://github.com/EmiXis/animated-octo-umbrella.git
cd animated-octo-umbrella
npm install
```

## Ejecución

1. Iniciar backend simulado:

```bash
npm run server
```

2. En otra terminal, iniciar frontend:

```bash
npm run dev
```

3. Abrir en el navegador:

- Frontend: `http://localhost:5173`
- API json-server: `http://localhost:3001`

## Scripts disponibles

- `npm run dev`: inicia la aplicación React
- `npm run server`: inicia `json-server` con `db.json`
