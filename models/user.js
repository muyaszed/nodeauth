const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeauth');

const db = mongoose.connection;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  name: {
    type: String,
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  profileimage: {
    type: String
  }
});

const User = module.exports = mongoose.model('User', UserSchema);
// module.exports.getUserById = function(id, callback){
// 	User.findById(id, callback);
// }
//
// module.exports.getUserByUsername = function(username, callback){
// 	var query = {username: username};
// 	User.findOne(query, callback);
// }
//
// module.exports.comparePassword = function(candidatePassword, hash, callback){
// 	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
//     	callback(null, isMatch);
// 	});
// }


module.exports.createUser = (newUser, callBack) => {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;
        newUser.save(callBack);
    });
  });

}


module.exports.validPassword = (password, user) => {
console.log(`${user}  ${password}`);
  return bcrypt.compare(password, user.password);
}
