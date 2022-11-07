const loginRequireErrorResponse = `<html><body><div style="text-align: center; font-size: x-large;">Please <b><a href='/login'>Login</a></b> or <b><a href='/register'>Register</a></b></div></body></html>`;
const loginBeforeShortenUrlErrorResponse = `<html><body>Please login before shorten Urls <b><a href='/login'>Click here to Login</a></b></body></html>`;
const accessDeniedError = `<html><body><div style="text-align: center; font-size: x-large;">Do not have access to this Url</div></body></html>`;
const idDoesNotExistError = `<html><body>Requested Id doesn't Exist</body></html>\n`;
const invalidShortenUrlResponse = `<html><body><div style="text-align: center; font-size: x-large;">Invalid shorten url. Please recheck!</div></body></html>`;

module.exports = { loginBeforeShortenUrlErrorResponse, loginRequireErrorResponse, accessDeniedError, idDoesNotExistError, invalidShortenUrlResponse };