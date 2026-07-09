# System Architecture

## Architecture Style

Layered Architecture

Request
→ Route
→ Controller
→ Service
→ Repository/Prisma
→ Database

## Backend Structure

src/
├── routes/
├── controllers/
├── services/
├── repositories/
├── middlewares/
├── validations/
├── prisma/
└── utils/

## Responsibilities

### Controller

* Receive HTTP request
* Validate input
* Return response

### Service

* Business logic
* Permission checking
* Workflow processing

### Repository

* Database access only

### Middleware

* JWT Authentication
* Authorization
* Error handling

## Realtime Communication

Socket.io is used for:

* Task updates
* Deadline notifications
* Comment notifications
* Project updates
