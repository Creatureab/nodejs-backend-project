# Node.js Backend Setup Commands

## Step 1: Create a new project

```bash
mkdir backend
cd backend
npm init -y
```

## Step 2: Create project files and folders

### Windows PowerShell

```powershell
New-Item -ItemType Directory -Force controllers, middleware, models, routes, config, locales
New-Item -ItemType File -Force index.js, .env, .gitignore
```

### Linux / macOS / WSL

```bash
mkdir -p controllers middleware models routes config locales
touch index.js .env .gitignore
```

## Step 3: Install backend packages

```bash
npm install dotenv express express-jwt express-validator i18next i18next-fs-backend i18next-http-middleware jsonwebtoken jwt-decode mongoose multer
```

> Note: Use `jsonwebtoken`, not `jsonwebtokens`.

## Step 4: Install Nodemon

```bash
npm install -D nodemon
```

## Step 5: Add package.json scripts

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

## Step 6: Run the development server

```bash
npm run dev
```

## Step 7: Run the production/start command

```bash
npm start
```

## Complete command list

If you already created the project folder and only need the commands:

```bash
npm init -y
npm install dotenv express express-jwt express-validator i18next i18next-fs-backend i18next-http-middleware jsonwebtoken jwt-decode mongoose multer
npm install -D nodemon
```

Then:

```bash
npm run dev
```

## Recommended project structure

```text
backend/
├── config/
├── controllers/
├── locales/
├── middleware/
├── models/
├── routes/
├── .env
├── .gitignore
├── index.js
└── package.json
```
