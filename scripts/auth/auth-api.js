// functions.js/
var bcrypt = require('bcryptjs');
var q = require('q');
var db = require('./../dao/authentication-dao');
var registrationQueue = require('./../queue/actions-queue');

//used in local-signup strategy
exports.registerNewUser = function (username, password) {
  function registerUser(userName, password) {
    if (username.length > MAX_LENGTH || password.length > MAX_LENGTH) {
      return q.reject(`User name and password must not excees ${MAX_LENGTH} chars`);
    }
    var hash = bcrypt.hashSync(password, 8);
    //check if username is already assigned in our database
    return db.getUser(username)
      .then(function (result) { //case in which user already exists in db
        console.log('username already exists');
        return q.reject('username already exists');
      })
      .catch(function (result) {//case in which user does not already exist in db
          return db.createNewUser(username, hash);
      });
  }

  return registrationQueue.runLater(registerUser, [username, password]);
};

//check if user exists
    //if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
      //if password matches take into website
  //if user doesn't exist or password doesn't match tell them it failed
exports.authenticateUser = function (username, password) {
  var deferred = q.defer();

  db.get('local-users', username)
  .then(function (result){
    console.log("FOUND USER");
    var hash = result.body.password;
    console.log(hash);
    console.log(bcrypt.compareSync(password, hash));
    if (bcrypt.compareSync(password, hash)) {
      deferred.resolve(result.body);
    } else {
      console.log("PASSWORDS NOT MATCH");
      deferred.resolve(false);
    }
  }).fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
          console.log("COULD NOT FIND USER IN DB FOR SIGNIN");
          deferred.resolve(false);
    } else {
      deferred.reject(new Error(err));
    }
  });

  return deferred.promise;
}