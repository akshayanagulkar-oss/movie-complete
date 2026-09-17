const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const config = require('./config');

const app = express();
const client = new MongoClient(config.MONGODB_URI);

let db;
let movies;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function validObjectId(id) {
  return ObjectId.isValid(id);
}

function toMovieDocument(body) {
  return {
    name: (body.name || '').trim(),
    releaseYear: Number(body.releaseYear) || 0,
    productionCompany: (body.productionCompany || '').trim(),
    genre: (body.genre || '').trim(),
    rating: Number(body.rating) || 0,
    runtime: Number(body.runtime) || 0,
    director: (body.director || '').trim(),
    description: (body.description || '').trim(),
    poster: (body.poster || '').trim() || '/images/poster-default.jpg',
    createdAt: new Date(),
    reviews: []
  };
}

async function getMovie(id) {
  if (!validObjectId(id)) return null;
  return movies.findOne({ _id: new ObjectId(id) });
}

// Home page: Movie Hunter style landing page
app.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { genre: { $regex: q, $options: 'i' } },
            { director: { $regex: q, $options: 'i' } },
            { productionCompany: { $regex: q, $options: 'i' } }
          ]
        }
      : {};

    const latest = await movies.find(filter).sort({ createdAt: -1 }).limit(8).toArray();
    const topRated = await movies.find(filter).sort({ rating: -1, releaseYear: -1 }).limit(8).toArray();
    const mostCommented = await movies.find(filter).sort({ reviewCount: -1, rating: -1 }).limit(8).toArray();

    res.render('index', { latest, topRated, mostCommented, q });
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to load movies. Make sure MongoDB is running.');
  }
});

// Table page similar to the course screenshot
app.get('/moviepage', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const filter = q
      ? { name: { $regex: q, $options: 'i' } }
      : {};
    const movieList = await movies.find(filter).sort({ createdAt: -1 }).toArray();
    res.render('moviepage', { movieList, q });
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to load movie page.');
  }
});

// Add movie form
app.get('/add', (req, res) => {
  res.render('addmoviepage', { error: null, movie: {} });
});

app.post('/add', async (req, res) => {
  try {
    const movie = toMovieDocument(req.body);
    if (!movie.name || !movie.releaseYear || !movie.genre) {
      return res.status(400).render('addmoviepage', {
        error: 'Movie name, release year and genre are required.',
        movie: req.body
      });
    }

    movie.reviewCount = 0;
    await movies.insertOne(movie);
    res.redirect('/moviepage');
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to add movie.');
  }
});

// Edit movie
app.get('/edit/:id', async (req, res) => {
  try {
    const movie = await getMovie(req.params.id);
    if (!movie) return res.status(404).send('Movie not found.');
    res.render('editmoviepage', { movie, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to load edit page.');
  }
});

app.post('/edit/:id', async (req, res) => {
  try {
    if (!validObjectId(req.params.id)) return res.status(400).send('Invalid movie id.');

    const update = {
      name: (req.body.name || '').trim(),
      releaseYear: Number(req.body.releaseYear) || 0,
      productionCompany: (req.body.productionCompany || '').trim(),
      genre: (req.body.genre || '').trim(),
      rating: Number(req.body.rating) || 0,
      runtime: Number(req.body.runtime) || 0,
      director: (req.body.director || '').trim(),
      description: (req.body.description || '').trim(),
      poster: (req.body.poster || '').trim() || '/images/poster-default.jpg'
    };

    await movies.updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    res.redirect('/moviepage');
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to update movie.');
  }
});

// Delete movie
app.post('/delete/:id', async (req, res) => {
  try {
    if (!validObjectId(req.params.id)) return res.status(400).send('Invalid movie id.');
    await movies.deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect('/moviepage');
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to delete movie.');
  }
});

// Movie detail page + review modal
app.get('/movie/:id', async (req, res) => {
  try {
    const movie = await getMovie(req.params.id);
    if (!movie) return res.status(404).send('Movie not found.');
    res.render('movie', { movie });
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to load movie.');
  }
});

app.post('/movie/:id/reviews', async (req, res) => {
  try {
    if (!validObjectId(req.params.id)) return res.status(400).send('Invalid movie id.');

    const name = (req.body.name || '').trim();
    const title = (req.body.title || '').trim();
    const review = (req.body.review || '').trim();
    const likeDislike = req.body.likeDislike === 'Dislike' ? 'Dislike' : 'Like';

    if (!name || !title || !review) {
      return res.status(400).send('All review fields are required.');
    }

    const newReview = {
      name,
      title,
      review,
      likeDislike,
      createdAt: new Date()
    };

    await movies.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $push: { reviews: newReview },
        $inc: { reviewCount: 1 }
      }
    );

    res.redirect(`/movie/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to save review.');
  }
});

// Simple JSON endpoint for API practice
app.get('/api/movies', async (req, res) => {
  try {
    const movieList = await movies.find({}).sort({ releaseYear: -1 }).toArray();
    res.json(movieList);
  } catch (err) {
    res.status(500).json({ error: 'Unable to fetch movies.' });
  }
});

async function seedMovies() {
  const count = await movies.countDocuments();
  if (count > 0) return;

  const sampleMovies = [
    {
      name: 'Mughal-e-Azam', releaseYear: 1960, productionCompany: 'Sterling Investment Corporation', genre: 'Historical Drama', rating: 5, runtime: 197, director: 'K. Asif',
      description: 'An Indian epic historical drama about Prince Salim and his love for Anarkali.', poster: '/images/mughal.jpg', reviewCount: 25, reviews: []
    },
    {
      name: 'Harry Potter', releaseYear: 2001, productionCompany: 'David Heyman', genre: 'Fantasy', rating: 4, runtime: 154, director: 'Chris Columbus',
      description: 'A young wizard begins his journey at Hogwarts and discovers a world of magic and adventure.', poster: '/images/harry.jpg', reviewCount: 25, reviews: []
    },
    {
      name: 'Ice Age', releaseYear: 2002, productionCompany: 'Lori Forte', genre: 'Comedy', rating: 4, runtime: 81, director: 'Chris Wedge',
      description: 'A group of prehistoric animals work together to return a human baby to his family.', poster: '/images/iceage.jpg', reviewCount: 25, reviews: []
    },
    {
      name: 'Spider-Man', releaseYear: 2002, productionCompany: 'Laura Ziskin', genre: 'Action Drama', rating: 5, runtime: 121, director: 'Sam Raimi',
      description: 'Peter Parker gains extraordinary abilities and learns that great power comes with responsibility.', poster: '/images/spiderman.jpg', reviewCount: 25, reviews: []
    },
    {
      name: 'Gladiator', releaseYear: 2000, productionCompany: 'DreamWorks', genre: 'Action', rating: 5, runtime: 155, director: 'Ridley Scott',
      description: 'A Roman general is forced into the arena and fights for freedom and justice.', poster: '/images/gladiator.jpg', reviewCount: 18, reviews: []
    },
    {
      name: 'Valkyrie', releaseYear: 2008, productionCompany: 'United Artists', genre: 'Thriller', rating: 4, runtime: 121, director: 'Bryan Singer',
      description: 'A historical thriller centered on a conspiracy against Hitler during World War II.', poster: '/images/valkyrie.jpg', reviewCount: 12, reviews: []
    },
    {
      name: 'Kung Fu Panda', releaseYear: 2008, productionCompany: 'DreamWorks Animation', genre: 'Animation', rating: 5, runtime: 92, director: 'Mark Osborne',
      description: 'Po, an enthusiastic panda, unexpectedly becomes the Dragon Warrior.', poster: '/images/panda.svg', reviewCount: 30, reviews: []
    },
    {
      name: 'The Matrix', releaseYear: 1999, productionCompany: 'Warner Bros.', genre: 'Sci-Fi', rating: 5, runtime: 136, director: 'The Wachowskis',
      description: 'A computer programmer discovers that reality is not what it appears to be.', poster: '/images/matrix.svg', reviewCount: 35, reviews: []
    }
  ].map(movie => ({ ...movie, createdAt: new Date() }));

  await movies.insertMany(sampleMovies);
  console.log(`5. Inserted ${sampleMovies.length} sample movies`);
}

async function startServer() {
  try {
    console.log('1. index.js started');
    await client.connect();
    console.log('3. MongoDB connected');

    db = client.db(config.DB_NAME);
    movies = db.collection('movies');

    // Create useful indexes for search/sorting.
    await movies.createIndex({ name: 1 });
    await movies.createIndex({ rating: -1 });
    await movies.createIndex({ reviewCount: -1 });

    await seedMovies();

    app.listen(config.PORT, () => {
      console.log(`4. Listening to port ${config.PORT}`);
      console.log(`Open http://localhost:${config.PORT}`);
      console.log(`Movie table: http://localhost:${config.PORT}/moviepage`);
    });
  } catch (err) {
    console.error('MongoDB connection failed. Is MongoDB running?');
    console.error(err.message);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});
