# Frontend (React + Vite)

This repository contains the frontend application built with React and Vite. It provides role-based dashboards, authentication, and services for managing users, vacancies, and applications.

## Features

- Role-based dashboards (Administrador, Coder, Gestor)
- Authentication and session management
- API services for users, vacancies, applications, and auth (axios-based)
- Reusable components and UI utilities

## Tech Stack

- React (JSX) with Vite
- Axios for HTTP requests
- ESLint for linting
- Plain CSS modules and global styles

## Requirements

- Node.js (16+ recommended)
- npm or yarn

## Quick Start

1. Install dependencies:

```
npm install
```

2. Start the development server with hot reload:

```
npm run dev
```

3. Build for production:

```
npm run build
```

4. Preview the production build locally:

```
npm run preview
```

Check `package.json` for additional available scripts (linting, formatting, etc.).

## Project Structure (high level)

- `src/` — main application source
	- `api/` — API service modules (`usersService.js`, `vacanciesService.js`, etc.)
	- `components/` — shared and layout components
	- `contexts/` — React contexts such as `AuthContext`
	- `hooks/` — custom hooks (e.g., `useAuth`)
	- `pages/` — route pages including auth and dashboards
	- `styles/` — global and component styles

- `public/` — static assets
- `plain/` — a minimal plain HTML/CSS/JS example

## Environment

If the app needs a backend API base URL, configure it in `src/api/axiosConfig.js` or an environment file such as `.env` with a variable like `VITE_API_BASE_URL`.

## Contributing

If you'd like to contribute, open an issue or submit a pull request describing your change. Keep changes focused and add tests where appropriate.

## License

This project does not include a license file. Add one if you plan to publish or share this repository.
