<<<<<<< HEAD
# NoraSol AI Chat Security Backend (Groq)

## 0) IMPORTANT
Do **not** put your Groq API key or your long system prompt in the browser.

## 1) Setup backend (Node.js)
From this folder:

```bash
npm install
```

Create a `.env` file (copy from example):

```bash
copy .env.example .env
```

Edit `.env` and set:
- `GROQ_API_KEY`
- (optional) `GROQ_MODEL`
- (optional) `PORT`

## 2) Run
```bash
node server.js
```

Server listens on:
- `http://localhost:3000/api/chat`

⚠️ You must set `GROQ_API_KEY` in a real `.env` file before running, otherwise the server will not be able to call Groq.


## 3) Frontend
Your `ai.html` now calls:
- `POST /api/chat`

It only sends the user's message (and minimal chat history).

## 4) Production hosting
You must deploy `server.js` to a public URL, and update `ai.html` to call the correct base URL if not using the same origin.

=======
# NoraSol AI Chat Security Backend (Groq)

## 0) IMPORTANT
Do **not** put your Groq API key or your long system prompt in the browser.

## 1) Setup backend (Node.js)
From this folder:

```bash
npm install
```

Create a `.env` file (copy from example):

```bash
copy .env.example .env
```

Edit `.env` and set:
- `GROQ_API_KEY`
- (optional) `GROQ_MODEL`
- (optional) `PORT`

## 2) Run
```bash
node server.js
```

Server listens on:
- `http://localhost:3000/api/chat`

⚠️ You must set `GROQ_API_KEY` in a real `.env` file before running, otherwise the server will not be able to call Groq.


## 3) Frontend
Your `ai.html` now calls:
- `POST /api/chat`

It only sends the user's message (and minimal chat history).

## 4) Production hosting
You must deploy `server.js` to a public URL, and update `ai.html` to call the correct base URL if not using the same origin.

>>>>>>> 02b027d79b6e9e92884fe737df17e32993b69a58
