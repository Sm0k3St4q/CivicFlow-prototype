# CivicFlow Architecture Overview

## Current System

Frontend:
- React (Vite)
- Runs on localhost:5173

Backend:
- Node.js + Express
- Runs on localhost:3000

Database:
- PostgreSQL
- Table: permits

---

## Core Flow ("Handshake")

1. User submits permit data (frontend form)
2. Frontend sends POST request to backend
3. Backend validates and stores data in PostgreSQL
4. Frontend fetches updated permit data
5. Dashboard reflects real-time workflow state

---

## Data Model (Current)

permits:
- applicant_name
- municipality
- business_type
- permit_type
- status
- progress
- due_date
- current_department
- missing_items

---

## Design Direction

The system is being built as a **configurable workflow engine**, not a hardcoded municipal system.

Goal:
- Build once
- Configure per municipality
- Scale across multiple cities

---

## Current MVP Scope

- Single municipality (Paterson)
- Permit intake
- Permit tracking
- Basic workflow visibility

---

## Next Steps

- Update permit status + progress
- Add editing capabilities
- Introduce municipality configuration layer
- Begin rule-based logic system