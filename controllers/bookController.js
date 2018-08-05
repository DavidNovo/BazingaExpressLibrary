// This module  defining functions as variables.
// These are function expressions.
// Function Expressions are not subject to hoisting.

// Defining callback function used by routes

// / / defining the database models that are used by this controller
let Book = require('../models/book');
let Author = require('../models/author');
let Genre = require('../models/genre');
let BookInstance = require('../models/bookinstance');

// / / import validation and sanitisation methods
const {
  body,
  validationResult
} = require('express-validator/check');
const {
  sanitizeBody
} = require('express-validator/filter');

// need the async module for communication
let async = require('async');

// This is the index for the catalog...better name?
// TODO: make a better name for this page, index is not good
exports.index = function (req, res) {
  async.parallel({
    book_count: function (callback) {
      Book.count({}, callback);
      // Pass an empty object to find all doucments
    },
    book_instance_count: function (callback) {
      BookInstance.count({}, callback);
    },
    book_instance_available_count: function (callback) {
      BookInstance.count({
        status: 'Available'
      }, callback);
    },
    author_count: function (callback) {
      Author.count({}, callback);
    },
    genre_count: function (callback) {
      Genre.count({}, callback);
    }
  }, function (err, results) { // this is the callback function
    res.render('index', {
      title: 'Local Library Home',
      error: err,
      data: results
    });
  });
};

// Display list of all books.
exports.book_list = function (req, res) {
  Book.find({}, 'title author')
    .populate('author')
    .exec(function (err, list_books) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render('book_list', {
        title: 'Book List',
        book_list: list_books
      });
    });
};

// Display detail page for a specific book.
exports.book_detail = function (req, res) {
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    book_instance: function (callback) {
      BookInstance.find({
        'book': req.params.id
      }).exec(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.book == null) { // No results.
      var err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render('book_detail', {
      title: 'Title',
      book: results.book,
      book_instances: results.book_instance
    });
  });
};

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {
  // get all authors and genres that we can add to a book
  async.parallel({
    authors: function (callback) {
      Author.find(callback);
    },
    genres: function (callback) {
      Genre.find(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    // populate the page with these options
    // render the book_form page with all results and errors
    res.render('book_form', {
      title: 'Create Book',
      authors: results.authors,
      genres: results.genres
    });
  });
};

// Handle book create on POST.
exports.book_create_post = [
  // convert the genre to an array
  (req, res, next) => {
    if ((!(req.body.genre instanceof Array))) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },
  // validate the fields of the form
  body('title', 'Title must not be empty.').isLength({
    min: 1
  }).trim(),
  body('author', 'Author must not be empty.').isLength({
    min: 1
  }).trim(),
  body('summary', 'Summary must not be empty.').isLength({
    min: 1
  }).trim(),
  body('isbn', 'ISBN must not be empty.').isLength({
    min: 1
  }).trim(),

  // sanitize all fields in form with wildcard
  sanitizeBody('*').trim().escape(),
  // sanitize every item below key genre
  sanitizeBody('genre.*').trim().escape(),

  // process the request
  (req, res, next) => {
    // / / extract validation errors from the request
    const errors = validationResult(req);

    // / / create a book object with escaped and trimmed data
    let book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre
    });
    if (!errors.isEmpty()) {
      // / If there are errors. render form again with santized
      // values/error messages get all authors and genres from the form
      async.parallel({
        authors: function (callback) {
          Author.find(callback);
        },
        genres: function (callback) {
          Genre.find(callback);
        }
      }, function (results) {
        // / / mark our selected genres as checked
        for (let dropdownIndex = 0; dropdownIndex < results.genres.length; dropdownIndex++) {
          if (bood.genre.indexOf(results.genres[dropdownIndex]._id) > -1) {
            results.genres[dropdownIndex].checked = 'true';
          }
        }
        res.render('book_form', {
          title: 'Create Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array()
        });
      });
    } else {
      // // data from form is valid, save book
      book.save(function (err) {
        if (err) {
          return next(err);
        }
        // // if save is successful, redirect used to new book form
        res.redirect(book.url);
      });
    }
  } // end of process the request
];

// Display book delete form on GET.
exports.book_delete_get = function (req, res) {
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id).exec(callback);
    },
    book_instances: function (callback) {
      BookInstance.find({
        'book': req.params.id
      }).exec(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.book == null) { // No results.
      res.redirect('/catalog/books');
    }
    // Successful, so render.
    res.render('book_delete', {
      title: 'Delete Book',
      book: results.book,
      book_instances: results.book_instances
    });
  });
}; // end book_delete_get()

// Handle book delete on POST.
exports.book_delete_post = function (req, res) {
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id).exec(callback);
    },
    book_instances: function (callback) {
      Book.find({
        'genre': req.params.id
      }).exec(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    // Success
    if (results.book_instances.length > 0) {
      // Book has book instances. Render in same way as for GET route.
      res.render('book_delete', {
        title: 'Delete Book',
        genre: results.book,
        book_instances: results.book_instances
      });
    } else {
      // This Book has no associated Book Instances
      // Delete Book and redirect to the list of books.
      Book.findByIdAndRemove(req.body.id, function deleteBook(err) {
        if (err) {
          return next(err);
        }
        // Success - go to books list.
        res.redirect('/catalog/books');
      });
    }
  });
}; // end of book_delete_post

// Display book update form on GET.
exports.book_update_get = function (req, res, next) {
  // Get book, authors and genres for form.
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
    },
    authors: function (callback) {
      Author.find(callback);
    },
    genres: function (callback) {
      Genre.find(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.book == null) { // No results.
      var err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    // Mark our selected genres as checked.
    for (var genres_iterator = 0; genres_iterator < results.genres.length; genres_iterator++) {
      for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
        if (results.genres[genres_iterator]._id.toString() == results.book.genre[book_g_iter]._id.toString()) {
          results.genres[genres_iterator].checked = 'true';
        }
      }
    }
    res.render('book_form', {
      title: 'Update Book',
      authors: results.authors,
      genres: results.genres,
      book: results.book
    });
  });
};

// Handle book update on POST.
exports.book_update_post = [

  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },

  // Validate fields.
  body('title', 'Title must not be empty.').isLength({
    min: 1
  }).trim(),
  body('author', 'Author must not be empty.').isLength({
    min: 1
  }).trim(),
  body('summary', 'Summary must not be empty.').isLength({
    min: 1
  }).trim(),
  body('isbn', 'ISBN must not be empty').isLength({
    min: 1
  }).trim(),

  // Sanitize fields.
  sanitizeBody('title').trim().escape(),
  sanitizeBody('author').trim().escape(),
  sanitizeBody('summary').trim().escape(),
  sanitizeBody('isbn').trim().escape(),
  sanitizeBody('genre.*').trim().escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
      _id: req.params.id // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel({
        authors: function (callback) {
          Author.find(callback);
        },
        genres: function (callback) {
          Genre.find(callback);
        },
      }, function (err, results) {
        if (err) {
          return next(err);
        }

        // Mark our selected genres as checked.
        for (let genresIndex = 0; genresIndex < results.genres.length; genresIndex++) {
          if (book.genre.indexOf(results.genres[genresIndex]._id) > -1) {
            results.genres[genresIndex].checked = 'true';
          }
        }
        res.render('book_form', {
          title: 'Update Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array()
        });
      });

    } else {
      // Data from form is valid. Update the record.
      Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.redirect(thebook.url);
      });
    }
  }
];