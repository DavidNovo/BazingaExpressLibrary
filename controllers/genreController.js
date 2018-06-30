const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

let Genre = require('../models/genre');
let Book = require('../models/book');
let async = require('async');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {
  Genre.find().sort([['name', 'ascending']]).exec(function (err, list_genre) {
    if (err) {
      return next(err);
    }
    // Successful, so render
    res.render('genre_list', {title: 'Genre List', genre_list: list_genre});
  });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id).exec(callback);
    },

    genre_books: function (callback) {
      Book.find({'genre': req.params.id}).exec(callback);
    }

  }, function (err, results, next) {
    if (err) {
      return next(err);
    }
    if (results.genre == null) { // No results.
      var err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render
    res.render('genre_detail', {
      title: 'Genre Detail',
      genre: results.genre,
      genre_books: results.genre_books
    });
  });
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
  res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST.
// Making an array of functions in a function - each function is called in order
exports.genre_create_post = [
  // 1st function Validate that the name field is not empty.
  body('name', 'Genre name required').isLength({min: 1}).trim(),

  // 2nd function Sanitize (trim and escape) the name field.
  sanitizeBody('name').trim().escape(),

  // 3rd function Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre(
      {name: req.body.name}
    );

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre_form',
        {title: 'Create Genre', genre: genre, errors: errors.array()});
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({'name': req.body.name}).exec(function (err, found_genre) {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save(function (err) {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {
  // get genre record and all associated books in parallel
  async.parallel({
    author: function (callback) {
      // using the id from the req to get the author
      Genre.findById(req.params.id).exec(callback);
    },
    genre_books: function (callback) {
      Book.find({
        'genre': req.params.id
      }).exec(callback);
    }
  },
  // this is the callback function
  function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.genre == null) { // if no genre list all genres
      res.redirect('/catalog/genres');
    }
    // happy path, genre and genre's books found
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: results.genre,
      genre_books: results.genre_books
    });
  }); // close parallel processing
}; // end genre_delete_get

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
  // check if author has books
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.body.authorid).exec(callback);
    },
    genre_books: function (callback) {
      Book.find({
        'genre': req.body.authorid
      }).exec(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.genre_books.length > 0) {
      // genre has books, redirect to genre_delete page and
      // ask to delete books first
      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genre_books: results.genre_books
      });
    } else {
      // author has no books, delete author
      Genre.findByIdAndRemove(req.body.authorid, function deleteGenre (err) {
        if (err) {
          return next(err);
        }
        // remember without the leading '/' the path is appended to current URL
        res.redirect('/catalog/genres');
      });
    }
  }); // end parallel processing
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update POST');
};
