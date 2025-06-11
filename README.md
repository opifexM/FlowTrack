[![Actions Status](https://github.com/opifexM/backend-project-6/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/opifexM/backend-project-6/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=opifexM_FlowTrack&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=opifexM_FlowTrack)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=opifexM_FlowTrack&metric=bugs)](https://sonarcloud.io/summary/new_code?id=opifexM_FlowTrack)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=opifexM_FlowTrack&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=opifexM_FlowTrack)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=opifexM_FlowTrack&metric=coverage)](https://sonarcloud.io/summary/new_code?id=opifexM_FlowTrack)

# FlowTrack

**FlowTrack** is a web-based task management system built with Node.js and Fastify. It provides core features such as task tracking, user authentication, status workflows, and label-based filtering. The application is designed with modular architecture, ORM-based data modeling, and production-ready deployment tooling.

## Description

FlowTrack is structured as a full-stack web application that implements common patterns used in modern task management platforms. The backend is developed using the Fastify framework and includes support for relational databases through an ORM with explicit entity relationships (one-to-many, many-to-many).

Key components include:

- RESTful resource-based routing for CRUD operations
- Form handling and validation on both client and server sides
- Session-based authentication and access control
- Dynamic filtering and sorting for tasks
- Server-side rendering with templating engine
- Integration with Rollbar for runtime error reporting
- Frontend bundling via Webpack and CSS preprocessing with PostCSS

The application supports user registration, login, and session management. Authenticated users can create and assign tasks, change statuses, and filter results using various criteria such as status or labels.

## Features

- User authentication (registration, login, logout)
- Role-based access control (authorization of actions)
- CRUD operations for tasks, users, statuses, and labels
- Task filtering and sorting by status, label, or assignee
- Many-to-many associations (tasks ↔ labels)
- Server-rendered UI using templating engine
- Environment-based configuration (.env support)
- Error tracking with Rollbar
- Responsive UI with Bootstrap
- Asset bundling with Webpack, CSS handled via PostCSS

## Technology Stack and Libraries

### Core Technologies

- **Node.js**: JavaScript runtime environment for backend logic.
- **Fastify**: High-performance web framework for Node.js focused on speed and low overhead.
- **Knex.js**: SQL query builder used for database migrations and query abstraction.
- **Objection.js**: Lightweight ORM built on top of Knex, supporting rich data models and relations.
- **PostgreSQL / SQLite**: Supported relational databases.

### Fastify Plugins

- `@fastify/view`: Renders server-side views using Pug templating engine.
- `@fastify/formbody`: Parses `application/x-www-form-urlencoded` form bodies.
- `@fastify/cookie`, `@fastify/secure-session`: Handle session and cookie management securely.
- `@fastify/middie`: Enables middleware support (like Express).
- `@fastify/flash`: Provides flash messages for UI feedback.
- `@fastify/static`: Serves static assets.
- `@fastify/swagger` & `@fastify/swagger-ui`: Automatically generate and serve OpenAPI documentation.

### Frontend and Styling

- **Pug**: Templating engine used for server-side rendering.
- **Bootstrap**: Frontend framework for responsive UI design.

### Validation and Localization

- **Yup**: Schema validation for form data on client and server.
- **fastify-yup-schema**: Integration between Yup and Fastify.
- **i18next**, **i18next-fs-backend**: Internationalization framework with filesystem backend support.

### Tooling and Testing

- **ESLint**: Code linter ensuring consistent coding standards.
- **Jest**: JavaScript testing framework.
- **Playwright**: End-to-end testing framework for modern browsers.
- **dotenv**: Loads environment variables from `.env` file.
- **Rollbar**: Real-time error monitoring and alerting.

### Additional Utilities

- **qs**: Query string parser with nested object support.
- **fastify-method-override**: Middleware for HTTP method overriding via query or form field.

## Scripts

Run DB migrations and start the app
```bash
npm run start
```

Run in watch mode for development
```bash
npm run dev 
```

Execute latest database migrations
```bash
npm run db:migrate
```

Run ESLint checks
```bash
npm run lint
```

Execute all tests using Jest
```bash
npm run test
```
