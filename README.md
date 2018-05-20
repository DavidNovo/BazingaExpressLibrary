# The Bazinga Library Project

## Introduction to the Project

## Setting up the Project
 install dependencies:
     $ npm install

## Running the Project
To run the project in a production environment
   run the app:
     `$ DEBUG=bazingaexpresslibrary:* npm start`

To run the project in a development environment
     `$ DEBUG=express-locallibrary-tutorial:* npm run devstart`

Note, when scripts other than 'start' are created running them means we have
to call "npm run <scriptname>", not just "npm <scriptname>" because "start"
is an NPM command mapped to the named script. 

## Design Considerations
What do I want to get from the catalog and when?  What about security?
### Get information about the library, get meta information about the orginazation
/about/ - about the library
/volunteer/ - volunteer opportunities
/catalog/ - home index page
/events/ - events at the library

### Other information
catalog/<objects>/ - get list of items 
specific examples
catalog/books/, /catalog/genres/, and so on

### CRUD operations: create, update, delete
all start with this URI - catalog
the form to create a new book - catalog/<object>/create
the form to update a specific book - catalog/<object>/<id>/update
the form to delete a specific book - catalog/<object>/<id>/delete

## Open questions
question, should I be using the word 'book' so much?  does this limit 
the solutions?