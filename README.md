# LinkVault

LinkVault is a full‑stack Pastebin‑style app for sharing either plain text or files through a unique, hard‑to‑guess link. Each upload gets its own URL, optional password protection, and an automatic expiry. Content is only accessible by the link—there’s no public listing or search.

## Features
1. Uploading text or files (one file or text per share).
2. Generating an unique link to access the file from anywhere. Also a delete key for the creator to delete the file.
3. Making a file password protected by the creator.
4. Making a file one‑time viewable by the creator.
5. Introducing max view/download limits for the file to be accessed.
6. Links only for the creator to view (after login).
5. Automatically deleting uploaded files after expiry period (10 mins in this case set as default).
6. Dashboard for singed in users to see, delete and copy the key of the created files.

## Tech Stack
1. Frontend: Made with React JS, Vite and Tailwind CSS
2. Backend: Made with Node.js and Express js.
3. Database: MongoDB is used. 
4. File storage: Uploaded files are stored locally (file path: `backend/uploads`)

## Architecture
1. After receiving, frontend submits the form-data (at `multipart/form-data`) to the API.
2. After receiving the form-data, backend validates input and generates a slug and a delete key and then stores metadata in MongoDB.
3. The uploaded text is stored directly in MongoDB; The uploaded files are stored on the local disk with the metadata stored in MongoDB.
4. While retrieval expiry, password, ownership, and limits are checked before returning content.
5. Cleanup job deletes expired or consumed uploads after a certain period (10 mins in his case set as default).

Data flow diagram: `docs/data-flow.mmd` (Mermaid flowchart).


## Setup
Prerequisites:
1. Node.js
2. MongoDB

## Dependencies
1. `npm --prefix backend install`
2. `npm --prefix frontend install`

## Environment Variables
**Backend** (`backend/.env`):
1. `PORT=4000`
2. `MONGODB_URI=your_mongodb_connection_string`
3. `JWT_SECRET=replace_with_secure_secret`
4. `TOKEN_EXPIRES_IN=30d`
5. `CORS_ORIGIN=http://localhost:5173`
6. `APP_BASE_URL=http://localhost:5173`
7. `API_BASE_URL=http://localhost:4000`
8. `UPLOAD_DIR=uploads`
9. `MAX_FILE_SIZE_MB=10`
10. `MAX_TEXT_LENGTH=100000`
11. `DEFAULT_EXPIRY_MINUTES=10`
12. `CLEANUP_INTERVAL_MS=60000`
13. `ALLOWED_MIME_TYPES=text/plain,application/pdf,image/png,image/jpeg,application/zip,application/json,text/csv,application/octet-stream`

**Frontend** (`frontend/.env`):
1. `VITE_API_BASE_URL=http://localhost:4000`
2. `VITE_MAX_FILE_SIZE_MB=10`



## Run Locally
1. Double click on `./run.command` (Only in Mac)

# API & System Overview


## Authentication

Authentication is only required if you want a dashboard or owner-only pastes. Anonymous uploads are fully supported.

- **Register:** `POST /api/auth/register`  
  Create a new user with an email and password.

- **Login:** `POST /api/auth/login`  
  Returns a JWT token for authenticated requests.

- **Current User:** `GET /api/auth/me`  
  Requires `Authorization: Bearer <token>` to fetch logged-in user details.


## Creating Pastes

- **Upload:** `POST /api/pastes` (multipart/form-data)  
  Either text or a file is to be uploaded. not both.

**Optional settings the user can control:**
- Title
- Password protection
- Expiry time
- One-time access on or off
- Maximum views or downloads
- Owner-only access (requires login to the creator's account)

## Accessing a Paste

- **Read:** `GET /api/pastes/:slug`  
  If the paste is password-protected, supply it via:
  - Query parameter: `?password=...`
  - Header: `x-paste-password`


## Downloading Files

- **Download:** `GET /api/pastes/:slug/download`  
  Only works for file uploads.  
  Passwords work the same way as read requests.



## Deleting a Paste

The user can delete a paste in two ways:

- Using the delete key:
  - `DELETE /api/pastes/:slug`
  - `POST /api/pastes/:slug/delete`
  - Delete key can be sent in body, query, or `x-delete-key` header
- In case of the creator, the upload can be deleted directly using the dashboard.



## Dashboard (Logged-in Users Only)

- **List Pastes:** `GET /api/pastes`  
  Shows all pastes created by the authenticated user, along with their metadata and delete options.



## Status Codes

- `201` – Paste successfully created  
- `400` – Invalid input or validation error  
- `401` – Authentication required  
- `403` – Invalid password, delete key, or expired/consumed paste  
- `404` – Route or paste not found  



## Database Design

### Paste (MongoDB)
Each paste stores:
- A unique slug ID
- Type (`text` or `file`)
- Text content and language (for text pastes)
- File metadata (name, type, size, path)
- Expiry and timestamps
- Delete key and optional password hash
- One-time and usage-limit settings
- View and download counters
- Owner reference and owner-only flag
- Access tracking (last accessed, consumed time)

### User
Stores basic account details:
- Email, name, and password hash
- Creation and update timestamps


## Design Choices

- Slugs are generated using `nanoid(16)` so URLs are hard to guess.
- Delete keys are longer (`nanoid(24)`) for extra safety.
- Files are stored locally to keep the system simple as of now. Will deploy.
- A background cleanup job removes expired or already-used pastes and their files.
- Rate limiting is applied to prevent abuse of upload and read endpoints on creator's choice.



## Assumptions & Limitations

- Files are stored locally, not on cloud storage.
- No virus scanning or content moderation is included.
- Links are hard but not end-to-end encrypted.



## Notes

- If you change the backend file size limit, make sure to update the frontend limit as well so the UI stays consistent.
- The `backend/uploads` directory is ignored by Git and is automatically cleaned by the cleanup job.
