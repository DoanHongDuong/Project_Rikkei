# Project_Rikkei AI Instructions

## Project Overview

This project is an Internal Task Management System.

Technology Stack:

* React
* TypeScript
* React Router
* Axios
* TailwindCSS
* NodeJS
* ExpressJS
* Prisma ORM
* MySQL
* Socket.io
* JWT Authentication

## Context Documents

Read these documents before implementing features:

@./docs/project-overview.md
@./docs/architecture.md
@./docs/database.md

## Coding Rules

@./.agent/rules/backend.md
@./.agent/rules/frontend.md
@./.agent/rules/gitflow.md

## Current Project State

@./.agent/context/current-state.md

## Development Workflow

@./.agent/workflows/create-feature.md

## General Instructions

* Follow existing architecture.
* Do not introduce new frameworks without justification.
* Reuse existing modules whenever possible.
* Always inspect existing code before generating new code.
* Prefer consistency over cleverness.
* Keep code simple and maintainable.
* Generate production-ready code.
* Follow RBAC permissions (Admin, PM, Member).
* Follow database design in docs/database.md.
* If requirements are unclear, ask before coding.

## When Creating New Features

1. Read existing implementation.
2. Check database relationships.
3. Check Product Backlog.
4. Create backend first.
5. Create frontend after API design.
6. Add validation.
7. Add authorization.
8. Suggest test cases.
