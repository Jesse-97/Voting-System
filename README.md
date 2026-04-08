 # Vision Voting System

 A lightweight React + Express voting/polling app prototype. This repo contains a React frontend (root) and a small Express + MongoDB backend (in `backend/`). It's designed for local development and quick experimentation with creating polls, voting, searching (including tags), and basic per-user poll management.

 ## Highlights

 - React SPA using React Router (pages: Login, Register, Home, Create, User Menu).
 - Express backend with MongoDB (user registration + login endpoints).
 - Local persistence of polls in browser `localStorage` (simple prototype storage).
 - Features: create polls (options, tags, settings), search by question or tag, vote with popup UI, per-card pie chart preview, user-managed polls (edit/delete), owner-only edits.

 ## Project structure

 ```
 Voting-System/
 ├─ backend/            # Express server and Mongoose models
 │  ├─ server.js
 │  └─ models/
 │     └─ User.js
 ├─ public/             # static assets, index.html, media
 ├─ src/                # React app
 │  ├─ App.js
 │  ├─ index.js
 │  ├─ login.js
 │  ├─ register.js
 │  ├─ home.js
 │  ├─ create.js
 │  ├─ userMenu.js
 │  ├─ pollStorage.js    # shared browser persistence helpers
 │  └─ *.css
 ├─ package.json        # frontend scripts & deps
 └─ backend/package.json
 ```

 ## Quick setup (Windows PowerShell)

 1. Install dependencies for both frontend and backend

 ```powershell
 # from repo root (frontend)
 npm install

 # backend
 Set-Location .\backend
 npm install
 Set-Location ..\
 ```

 2. Backend configuration

 - Create a `.env` file in `backend/` with a MongoDB connection string:

 ```text
 MONGO_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/mydb?retryWrites=true&w=majority
 ```

 - Start the backend server (from `backend/`):

 ```powershell
 # in backend/
 node server.js
 # (or use nodemon if you have it installed)
 ```

 The server listens on port 5000 by default.

 3. Start the frontend (from repo root)

 ```powershell
 npm start
 ```

 Open http://localhost:3000 in your browser.

 ## Usage notes

 - Register a new user via the Register page (sends POST /register to backend).
 - Login with the registered user (POST /login). On success the user object is saved to `localStorage` and the app navigates to Home.
 - Create polls via the Create dialog. Polls are stored in browser `localStorage` for now. Each poll records its creator username and (if available) creator id.
 - Click a poll card on the Home page to open a voting popup. Votes are persisted in the poll object under `votesByUser`.
 - Use the search bar to find polls by question or tag (select mode). The tag mode supports suggestions gathered from existing polls.
 - Open User Menu from the sidebar to manage polls you created (Modify / Delete). The UI restricts modify/delete operations to the poll owner.

 ## Data persistence

 - Users: persisted in MongoDB (backend). Passwords are hashed with bcrypt.
 - Polls: persisted in the browser `localStorage` (key: `polls_all`). This was intentionally chosen for a quick prototype; for production you'd move polls to the server (MongoDB) and implement server-side authorization.

 ## Development tips and next steps

 - Move poll storage to the backend and add server-side access controls. Right now owner checks happen in the client using the stored `createdById` and `localStorage` user details.
 - Add stronger validation and error handling on backend endpoints.
 - Add tests for API endpoints and React components.

 ## Troubleshooting

 - If the frontend cannot reach the backend, ensure the backend is running on port 5000 and CORS is enabled (the server already uses `cors()` in `backend/server.js`).
 - For Mongo connection errors, confirm `MONGO_URI` is correct and network access to the cluster is allowed.
