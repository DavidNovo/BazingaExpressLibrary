// Controller for the URIs related to an Author

// Import the Author db model, use expression
// this is required to access and update data
var Author = require('../models/author');

var async = require('async');
var Book = require('../models/book');


// add packages for form processing and validation
const {body, validationResult} = require('express-validator/check');
const { sanitizeBody  } = require('express-validator/filter');

// Define the callback functions
// they have the standard form of an Express middleware function
// a function with args for request, response, and
// the next function to be called

// Display list of all Authors.
exports.author_list = function(req, res) {
  Author.find()
  .sort([['family_name', 'ascending']])
  .exec(function (err, list_authors) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('author_list', { title: 'Author List', author_list: list_authors });
  });
};

// Display detail page for a specific Author.
exports.author_detail = function(req, res) {
  async.parallel({
    author: function(callback) {
      Author.findById(req.params.id)
      .exec(callback)
    },
    authors_books: function(callback) {
      Book.find({ 'author': req.params.id },'title summary')
      .exec(callback)
    },
  }, function(err, results) {
    if (err) { return next(err); } // Error in API usage.
    if (results.author==null) { // No results.
      var err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
  });};

// Display Author create form on GET.
exports.author_create_get = function(req, res, next) {
  res.render('author_form', {title: 'Create Author'});
};

// Handle Author create on POST.
exports.author_create_post = [
  //1st validate
  //    if invalid the form is re-displayed with user entered data and
  //    error messages are displayed
  // I am daisy chaining validators using withMessage()
  body('first_name').isLength({ min:1}).trim().withMessage("First name must be specified.")
      .isAlphanumeric().withMessage('First name has non-alphamumeric characters.'),
  body('family_name').isLength({ min: 1}).trim().withMessage('Family name must be specified')
    .isAlphanumeric().withMessage("Family name has non-alphanumeric characters."),

  // the option() used to run  the next validation only
  // if a field has been entered
  body('date_of_birth', 'Invalid date of birth').optional({
    checkFalsy: true
  }).isISO8601(),
  body('date_of_death', 'Invalid date of death').optional({
    checkFalsy: true
  }).isISO8601(),

  // then sanitize fields. and cast to Javascript types
  sanitizeBody('first_name').trim().escape(),
  sanitizeBody('family_name').trim().escape(),
  sanitizeBody('date_of_birth').trim().toDate(),
  sanitizeBody('date_of_death').trim().toDate(),

  // Process request after validation and sanitization
  (req, res, next) => {

    // extract and check there are no validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // there are errors so render form again with errors messages
      res.render('author_form', {title: 'Create Author', author: req.body,
      errors: errors.array()});
      return;
    } else {
      // data from form is valid
      //2nd save new author data
      var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      });
      author.save(function(err){
        if (err) { return next(err); }
        //3rd redirect to the author detail page to display new author
        res.redirect(author.url);
      });
    }
  }
];


// Display Author delete form on GET.
exports.author_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author update POST');
};