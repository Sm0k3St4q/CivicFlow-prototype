# CivicFlow Prototype

## Overview
CivicFlow is a municipal permitting and workflow platform prototype.

This project currently includes:
- a React frontend
- a Node/Express backend
- a PostgreSQL database
- permit intake and tracking

## Current Features
- View permit records from PostgreSQL
- Create new permit records from the frontend
- Track permit status, progress, department, due date, and missing items

## Project Structure

- `frontend/` → React app (Vite)
- `backend/` → Node.js + Express API
- PostgreSQL → local database (`civicflow_dev`)

## Local Development

### Backend
Open terminal in `backend/` and run:

```bash
npm install
node server.js