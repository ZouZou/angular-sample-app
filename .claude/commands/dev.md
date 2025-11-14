---
description: Start development servers for frontend and backend
---

Start both the Angular frontend development server and the backend API server concurrently.

## Steps

1. **Check Prerequisites**
   - Verify Node.js is installed
   - Check if PostgreSQL is running (for backend)
   - Verify dependencies are installed

2. **Start Both Servers**
   - Execute: `npm run start:all`
   - This should start:
     - Frontend on http://localhost:4200
     - Backend on http://localhost:3000

3. **Monitor Startup**
   - Watch for compilation success/errors
   - Check for port conflicts
   - Verify database connection (backend)
   - Report when both servers are ready

4. **Provide Information**
   - Frontend URL: http://localhost:4200
   - Backend URL: http://localhost:3000
   - Any startup warnings or errors
   - Tips for testing the application

**Note:** This runs in the foreground. Use Ctrl+C to stop both servers.

**Alternative Commands:**
- Frontend only: `npm run start:frontend`
- Backend only: `npm run start:backend`
