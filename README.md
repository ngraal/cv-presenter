# CV Presenter

> **Disclaimer:** This application was partially created with the assistance of AI. No warranty is provided — use at your own risk.

A modern, token-based CV presentation web app. Share your resume as a digital business card with QR-code-enabled access tokens.

## Features

- **Token-based access** — JWT or compact tokens as query parameters or manual entry
- **Compact tokens** — Short, binary-encoded tokens optimized for QR codes (~50 chars vs ~200 for JWT)
- **QR Code generation** — Create shareable QR codes for each token
- **Admin panel** — Generate tokens, edit CV data, upload PDF and profile image
- **Dynamic links** — Configurable list of links (website, LinkedIn, GitHub, etc.)
- **Profile image** — Upload a profile photo displayed on the CV card
- **PDF download** — Serve a static PDF resume (filename includes your name)
- **No database** — Stateless signed tokens + filesystem storage
- **Docker ready** — Multi-stage build, volume for data persistence
- **Login logging** — Token usage logged to stdout with name, role, and expiration

## Quick Start

### Prerequisites
- Node.js 22+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Set JWT secret (min 32 characters)
export JWT_SECRET="your-secret-key-at-least-32-characters-long"
export DATA_DIR="./data"

# Start dev server
npm run dev
```

On startup, a **default admin token** (valid 24h) is printed to the console. Use it to access the admin panel.

### Docker

```bash
# Set your JWT secret
export JWT_SECRET="your-secret-key-at-least-32-characters-long"

# Build and run
docker compose up -d

# View logs (includes default admin token)
docker compose logs cv-presenter
```

## Usage

1. **First start:** Copy the default admin token from the logs
2. **Access the app:** Visit `http://localhost:3000/?token=<your-token>` or paste the token in the login form
3. **Admin panel:** Click "Admin Panel" link (visible for admin tokens)
4. **Generate tokens:** Go to Tokens tab, set name/role/expiry/format, generate
5. **Share:** Copy the URL or scan the QR code
6. **Edit CV:** Go to Editor tab, modify fields, save
7. **Upload PDF:** Go to Editor tab, upload a PDF file
8. **Upload profile image:** Go to Editor tab, upload a JPEG/PNG/WebP image

## Token Formats

| Format | Length | Best for |
|--------|--------|----------|
| Compact | ~45–65 chars | QR codes, short URLs |
| JWT | ~200–250 chars | Standard tooling, debugging |

Both formats are always accepted — format is auto-detected.

## Token Roles

| Role | CV View | PDF Download | Admin Panel | Generate Tokens | Edit CV |
|------|---------|--------------|-------------|-----------------|---------|
| `viewer` | Yes | Yes | No | No | No |
| `admin` | Yes | Yes | Yes | Yes | Yes |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | — | Signing secret for tokens (min 32 chars) |
| `DATA_DIR` | No | `/app/data` | Directory for CV data, PDF, and image storage |

## Data Storage

All data is stored on the filesystem (Docker volume):

| File | Description |
|------|-------------|
| `cv.json` | Structured CV data (personal info, links, experience, education, skills) |
| `cv.pdf` | Static PDF resume for download |
| `profile-image.*` | Profile photo (JPEG, PNG, or WebP) |

Default example data is created automatically on first start.

## Architecture

- **Framework:** Next.js (App Router)
- **Auth:** HS256-signed tokens via `jose` library + custom compact format
- **Storage:** JSON file + PDF + image on filesystem
- **Styling:** Tailwind CSS
- **Container:** Docker with multi-stage build (Node.js Alpine)
