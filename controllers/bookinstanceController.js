let BookInstance = require('../models/bookinstance');

// defining the database models that are referenced by this controller
let Book = require('../models/book');

// import validation and sanitisation methods
const {
  body,
  validationResult
} = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find().populate('book').exec(function (err, list_bookinstances) {
    if (err) {
      return next(err);
    }
    // Successful, so render
    res.render('bookinstance_list', {
      title: 'Book Instance List',
      bookinstance_list: list_bookinstances
    });
  });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) {
        return next(err);
      }
      if (bookinstance == null) { // No results.
        err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('bookinstance_detail', {
        title: 'Book:',
        bookinstance: bookinstance
      });
    });
}; // end of bookinstance_detail

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
  Book.find({}, 'title').exec(function (err, books) {
    if (err) {
      return next(err);
    }
    // successful, so to view
    res.render('bookinstance_form', {
      title: 'create BookInstance',
      book_list: books
    });
  });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // validate fields of form, uses name of form elements
  body('book', 'Book must be specified').isLength({
    min: 1
  }).trim(),
  body('imprint', 'Imprint must be specified').isLength({
    min: 1
  }).trim(),
  body('due_back', 'Book ').optional({
    checkFalsy: true
  }).isISO8601(),

  // sanitize the fields of the form
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // process the request after valication and sanitization
  (req, res, next) => {
    //  extract the validation errors from the request
    const errors = validationResult(req);

    //  create a BookInstance object with user defined data
    var bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back
    });

    //   if data from form is valid, save the book instance and redirect
    if (errors.isEmpty()) {
      bookInstance.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(bookInstance.url);
      });
    } else {
      //   if data from form invalid, render form again with error messages
      Book.find({}, 'title').exec(function (err, books) {
        if (err) {
          return next(err);
        }
        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance
        });
      });
    }
  }
]; // end of bookinstance_create_post

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance update POST');
};
