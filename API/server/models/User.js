var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	user_type: {
		type: String,
		default: "user"
	},
	auth_token: {
		type: String
	},
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		lowercase: true,
		unique: true, 
		required: true
	},
	password: {
		type: String,
		required: true
	},
	phone_number: {
		type: String,
		required: true
	},
	address: {
		type: Array,
		required: true
	},
	affiliation: {
		type: String,
		required: true
	},
	payment_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	}
});

module.exports = UserSchema;
