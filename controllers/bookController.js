// This module  defining functions as variables.
// These are function expressions.
// Function Expressions are not subject to hoisting.

// Defining callback function used by routes

//// defining the database models that are used by this controller
var Book = require('../models/book')
var Author = require('../models/author')
var Genre = require('../models/genre')
var BookInstance = require('../models/bookinstance')

//// import validation and sanitisation methods
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// need the async module for communication
var async = require('async');

// This is the index for the catalog...better name?
// TODO: make a better name for this page, index is not good
exports.index = function (req, res) {
  async.parallel({
    book_count: function (callback) {
      Book.count({}, callback)
      //Pass an empty object to find all doucments
    },
    book_instance_count: function (callback) {
      BookInstance.count({}, callback)
    },
    book_instance_available_count: function (callback) {
      BookInstance.count({status: 'Available'}, callback)
    },
    author_count: function (callback) {
      Author.count({}, callback)
    },
    genre_count: function (callback) {
      Genre.count({}, callback)
    },
  }, function (err, results) { // this is the callback function
    res.render('index',
      {title: 'Local Library Home', error: err, data: results})
  })
}

// Display list of all books.
exports.book_list = function (req, res) {
  Book.find({}, 'title author')
  .populate('author')
  .exec(function (err, list_books) {
    if (err) { return next(err) }
    //Successful, so render
    res.render('book_list', {title: 'Book List', book_list: list_books})
  })
}

// Display detail page for a specific book.
exports.book_detail = function (req, res) {
  async.parallel({
    book: function (callback) {

      Book.findById(req.params.id)
      .populate('author')
      .populate('genre')
      .exec(callback)
    },
    book_instance: function (callback) {

      BookInstance.find({'book': req.params.id})
      .exec(callback)
    },
  }, function (err, results) {
    if (err) { return next(err) }
    if (results.book == null) { // No results.
      var err = new Error('Book not found')
      err.status = 404
      return next(err)
    }
    // Successful, so render.
    res.render('book_detail', {
      title: 'Title',
      book: results.book,
      book_instances: results.book_instance
    })
  })
}

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {
  // get all authors and genres that we can add to a book
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
    // populate the page with these options
    // render the book_form page with all results and errors
    res.render('book_form',{title: 'Create Book',
      authors: results.authors, genres: results.genres });
  });
};

// Handle book create on POST.
exports.book_create_post = [
  // convert the genre to an array
  (req, res, next) => {
    if ( (!req.body.genre instanceof Array) ){
      if(typeof req.body.genre==='undefined'){
        req.body.genre=[];
      } else {
        req.body.genre=new Array(req.body.genre);
      }
    }
    next();
  },
  // validate the fields of the form
  body('title', 'Title must not be empty.').isLength({ min: 1}).trim(),
  body('author', 'Author must not be empty.').isLength({ min: 1}).trim(),
  body('summary', 'Summary must not be empty.').isLength({ min: 1}).trim(),
  body('isbn', 'ISBN must not be empty.').isLength({ min: 1}).trim(),

  // sanitize all fields in form with wildcard
  sanitizeBody('*').trim().escape(),
  // sanitize every item below key genre
  sanitizeBody('genre.*').trim().escape(),

  // process the request
  (req, res, next) => {
    //// extract validation errors from the request
    const errors = validationResult(req);

    //// create a book object with escaped and trimmed data
    var book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre
      }
    );
    if (!errors.isEmpty()) {
      //// If there are errors. render form again with santized values/error messages
      //// get all authors and genres from the form
      async.parallel({
          authors: function (callback) {
            Author.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        }, function (err, results) {
          //// mark our selected genres as checked
          for (let dropdownIndex = 0; dropdownIndex < results.genres.length;
            dropdownIndex++) {
            if (bood.genre.indexOf(results.genres[dropdownIndex]._id) > -1) {
              results.genres[dropdownIndex].checked = 'true';
            }
          }
          res.render('book_form', {
            title: 'Create Book', authors: results.authors,
            genres: results.genres, book: book, errors: errors.array()
          });
          return;
        }
      )
    } else {
      //// data from form is valid, save book
      book.save(function(err) {
        if (err) {
          return next(err);
        }
        //// if save is successful, redirect used to new book form
        res.redirect(book.url);
      })
    }
  }// end of process the request
];

// Display book delete form on GET.
exports.book_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete GET')
}

// Handle book delete on POST.
exports.book_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete POST')
}

// Display book update form on GET.
exports.book_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update GET')
}

// Handle book update on POST.
exports.book_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update POST')
}