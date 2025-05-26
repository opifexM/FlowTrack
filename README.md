[![Actions Status](https://github.com/opifexM/backend-project-6/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/opifexM/backend-project-6/actions)


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
