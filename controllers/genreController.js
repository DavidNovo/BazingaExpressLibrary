const {
  body,
  validationResult
} = require('express-validator/check');
const {
  sanitizeBody
} = require('express-validator/filter');

let Genre = require('../models/genre');
let Book = require('../models/book');
let async = require('async');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {
  Genre.find().sort([
    ['name', 'ascending']
  ]).exec(function (err, listGenre) {
    if (err) {
      return next(err);
    }
    // Successful, so render
    res.render('genre_list', {
      title: 'Genre List',
      genre_list: listGenre
    });
  });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id).exec(callback);
    },

    genre_books: function (callback) {
      Book.find({
        'genre': req.params.id
      }).exec(callback);
    }

  }, function (err, results, next) {
    if (err) {
      return next(err);
    }
    if (results.genre == null) { // No results.
      err = new Error('Genre not found');
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
  res.render('genre_form', {
    title: 'Create Genre'
  });
};

// Handle Genre create on POST.
// Making an array of functions in a function - each function is called in order
exports.genre_create_post = [
  // 1st function Validate that the name field is not empty.
  body('name', 'Genre name required').isLength({
    min: 1
  }).trim(),

  // 2nd function Sanitize (trim and escape) the name field.
  sanitizeBody('name').trim().escape(),

  // 3rd function Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre({
      name: req.body.name
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array()
      });
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({
        'name': req.body.name
      }).exec(function (err, found_genre) {
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
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id).exec(callback);
    },
    genre_books: function (callback) {
      Book.find({
        'genre': req.params.id
      }).exec(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.genre == null) { // No results.
      res.redirect('/catalog/genres');
    }
    // Successful, so render.
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: results.genre,
      genre_books: results.genre_books
    });
  });
}; // end genre_delete_get

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id).exec(callback);
    },
    genre_books: function (callback) {
      Book.find({
        'genre': req.params.id
      }).exec(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    // Success
    if (results.genre_books.length > 0) {
      // Genre has books. Render in same way as for GET route.
      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genre_books: results.genre_books
      });
    } else {
      // Genre has no books. Delete object and redirect to the list of genres.
      Genre.findByIdAndRemove(req.body.id, function deleteGenre (err) {
        if (err) {
          return next(err);
        }
        // Success - go to genres list.
        res.redirect('/catalog/genres');
      });
    }
  });
}; // end of genre_delete_post

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id).exec(callback);
    },
    genre_books: function (callback) {
      Book.find({
        'genre': req.body.genreid
      }).exec(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.genre == null) {
      // genre not found
      err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    } else {
      // found genre
      res.render('genre_form', {
        title: 'Update Genre',
        genre: results.genre
      });
    } // found genre
  }); // end parallel processing
};

// Handle Genre update on POST.
exports.genre_update_post = [
  // validate fields
  body('name', 'Name of genre must not be empty').isLength({
    min: 1
  }).trim(),
  // sanitize fields
  sanitizeBody('name').trim().escape(),
  // process request
  (req, res, next) => {
    // Extract the validation errors
    const errors = validationResult(req);
    // Create object using existing ID and validated data
    var genre = new Genre({
      name: req.body.name,
      _id: req.params.id // This is required, or a new ID will be assigned!
    });
    // if there are no error, update the object
    if (errors.isEmpty()) {
      Genre.findByIdAndUpdate(req.params.id, genre, function (err, theGenre) {
        if (err) {
          return next(err);
        }
        // if successful, redirect to new page
        res.redirect(theGenre.url);
      });
    } else {
      // if there are errors re-render the form with error messages
      async.parallel({
        genre: function (callback) {
          Genre.find(callback);
        }
      }, function (err, result) {
        if (err) {
          return next(err);
        }
        res.render('genre_form', {
          title: 'Update Genre',
          genre: result.genre,
          errors: errors.array()
        });
      });
    }
  }
];
