var mongoose = require('mongoose')

var Schema = mongoose.Schema

var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
)

// next define some virtual properties of author
// these get and set properties are not persisted to the database
// useful for combining values into responses

// virtual for author's full name
AuthorSchema.virtual('name').get(function () {
  return this.family_name + ',' + this.first_name
})

// virtual for author's URL
AuthorSchema.virtual('url').get(function () {
  return 'catalog/author/' + this._id
})

//Export model
module.exports = mongoose.model('Author', AuthorSchema)
