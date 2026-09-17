# Movie Hunter — Node.js + MongoDB Case Study

A complete beginner-friendly full-stack Movie App built with **Node.js, Express, EJS and MongoDB**. The UI is inspired by the Movie Hunter course screenshots: dark movie-home page, movie table, Add Movie page, movie detail page and a Write Your Review modal.

## 1. Requirements

Install these before running:

- Node.js (Node 18+; Node 24 is also fine)
- MongoDB Community Server, OR a MongoDB Atlas account
- VS Code (recommended)

Check Node/npm:

```bash
node -v
npm -v
```

Check MongoDB if installed locally:

```bash
mongosh
```

## 2. Folder structure

```text
movieapp/
│
├── index.js
├── config.js
├── package.json
├── README.md
│
├── views/
│   ├── index.ejs
│   ├── moviepage.ejs
│   ├── addmoviepage.ejs
│   ├── editmoviepage.ejs
│   ├── movie.ejs
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
│
└── public/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── main.js
    └── images/
        ├── poster-default.svg
        ├── mughal.svg
        ├── harry.svg
        ├── iceage.svg
        ├── spiderman.svg
        ├── gladiator.svg
        ├── valkyrie.svg
        ├── panda.svg
        └── matrix.svg
```

**Important:** Keep `config.js` in the project root beside `index.js`. Keep `views` and `public` beside them too.

## 3. Put the project in VS Code

Recommended Windows location:

```text
C:\Users\<your-name>\Documents\movieapp
```

Extract the ZIP first. Then open the **movieapp folder itself** in VS Code:

`File → Open Folder → movieapp`

Do not open only the `views` or `public` folder.

## 4. Install packages

Open VS Code Terminal:

`Terminal → New Terminal`

Make sure the terminal is inside the project folder. Then run:

```bash
npm install
```

This creates `node_modules`. You do NOT need to put `node_modules` in the ZIP.

## 5. Start MongoDB

### Local MongoDB

Start MongoDB service first. On many Windows installations MongoDB runs as a Windows service automatically. If it does not, start the MongoDB server from your MongoDB installation.

Then optionally test:

```bash
mongosh
```

You should be able to connect to `mongodb://127.0.0.1:27017`.

### MongoDB Atlas

Open `config.js` and replace:

```js
MONGODB_URI: 'mongodb://127.0.0.1:27017'
```

with your Atlas connection string. Keep the database name as `movieapp` unless you want another name.

## 6. Run the application

From the project folder:

```bash
npm start
```

You should see approximately:

```text
1. index.js started
3. MongoDB connected
5. Inserted 8 sample movies
4. Listening to port 5050
Open http://localhost:5050
Movie table: http://localhost:5050/moviepage
```

Open your browser:

```text
http://localhost:5050
```

Movie table:

```text
http://localhost:5050/moviepage
```

## 7. What to test

1. Home page — movie sections and search.
2. Movie List — MongoDB records shown in a table.
3. Add Movie — enter a movie and click Save Movie.
4. Edit — edit any existing movie.
5. Delete — delete a movie.
6. Click a movie name — opens movie details.
7. Write Your Review — opens the review popup.
8. Save a review — review count increases and the review appears.
9. API — open `http://localhost:5050/api/movies` to see JSON.

## 8. MongoDB data

The application creates this database/collection automatically:

```text
movieapp
└── movies
```

The first time the app starts on an empty collection, it inserts sample records. If records already exist, it does not insert them again.

Useful mongosh commands:

```javascript
show dbs
use movieapp
show collections
db.movies.find()
db.movies.countDocuments()
```

To clear all movie data and allow the app to seed again:

```javascript
db.movies.deleteMany({})
```

Then restart the Node server.

## 9. Common errors

### `Cannot find module 'express'`
Run:

```bash
npm install
```

### `MongoDB connection failed`
MongoDB server is probably not running, or your Atlas URI is wrong.

### `EADDRINUSE: address already in use :::5050`
Another program is using port 5050. Either stop that program or change `PORT` in `config.js`.

### `Cannot GET /add`
Make sure you are running this complete `index.js` and open:

```text
http://localhost:5050/add
```

### Browser shows old page
Stop Node with `Ctrl + C`, start again with `npm start`, and refresh the browser.

## 10. Stop the server

In the terminal where Node is running:

```text
Ctrl + C
```

## 11. Important project concept

The flow is:

```text
Browser
   ↓
Express route in index.js
   ↓
EJS page in views/
   ↓
MongoDB collection: movieapp.movies
   ↓
Data returned to Express
   ↓
EJS renders HTML
   ↓
Browser displays the page
```

For adding a movie:

```text
Add Movie form
      ↓ POST /add
Express receives req.body
      ↓
movies.insertOne()
      ↓
MongoDB
      ↓
redirect to /moviepage
```

For reviews:

```text
Movie detail
      ↓
Write Your Review
      ↓
POST /movie/:id/reviews
      ↓
$push review + $inc reviewCount
      ↓
MongoDB
      ↓
Movie detail page
```
