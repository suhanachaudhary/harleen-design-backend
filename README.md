
# User Management Backend

Node.js + Express + MongoDB backend for User Management System.

## Features
- Register / Login (JWT access + refresh)
- Password hashing with bcrypt
- Image upload (multer) - stored in `uploads/`
- Admin-only user listing with pagination, sort & search
- RBAC, CORS, Helmet
- Swagger docs (basic) at `/api/docs`

## Requirements
- Node 18+
- MongoDB running (local or Atlas)

## Setup

1. Clone repo
2. Copy `.env.example` to `.env` and fill values:
