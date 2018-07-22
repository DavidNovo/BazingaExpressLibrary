const it = require('mocha').it;
const describe = require('mocha').describe;

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();

chai.use(chaiHttp);

describe('bookController', function () {
  it('should list ALL blobs on /catalog GET', function (done) {
    chai.request(app)
      .get('/catalog')
      .end(function (err, res) {
        console.log(res);
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('<title>Local Library Home</title>');
        done();
      });
  });
  it('should list ALL books on /catalog/books GET', function (done) {
    chai.request(app)
      .get('/catalog/books')
      .end(function (err, res) {
        res.should.have.status(200);
        res.should.be.html;
        res.text.should.contain('<title>Book List</title>');
        done();
      });
  });
});
