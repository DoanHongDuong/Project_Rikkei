---
trigger: always_on
---

# Branch Strategy

Main Branches

- main
- Project-Management

Feature Branches

feature/<feature-name>

Workflow

feature/*
    ↓
Project-Management
    ↓
main

Rules

- Create feature branches from Project-Management
- Merge feature branches into Project-Management
- Merge Project-Management into main when stable
- Do not commit directly to main