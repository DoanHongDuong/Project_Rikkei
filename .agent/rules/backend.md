---
trigger: always_on
---

# Backend Rules

- Use ExpressJS
- Use Prisma ORM
- Use async/await
- Controller only handles request/response
- Business logic belongs to Service layer
- Database access only through Repository
- Return standard API response format

{
  success: boolean,
  data: object,
  message: string
}