var mongoose = require('mongoose');

var QuestionSchema = new mongoose.model({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  }
}, {
	collection: 'comcast'
});

module.exports = QuestionSchema;
