const { assert } = require('chai');

const { getUserByEmail, urlsForUser, getUserLogin, getUserById } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

describe('getUserByEmail', function() {
  it('should return true with valid email', function() {
    const result = getUserByEmail("user@example.com", testUsers);
    assert.equal(result, true);
  });
  it('should return false with invalid email', function() {
    const result = getUserByEmail("user@user.com", testUsers);
    assert.equal(result, false);
  });
});

describe('getUserById', function() {
  it('should return true with valid id', function() {
    const result = getUserById("userRandomID", testUsers);
    assert.equal(result, true);
  });
  it('should return false with invalid id', function() {
    const result = getUserById("invaliduserRandomID", testUsers);
    assert.equal(result, false);
  });
});

describe('urlsForUser', function() {
  it('should return user owned urls', function() {
    const result = urlsForUser("aJ48lW", testUrlDatabase);
    const expectedUrls = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      }
    };
    assert.deepEqual(result, expectedUrls);
  });

});