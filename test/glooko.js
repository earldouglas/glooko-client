const glooko = require('../src/glooko.js');
const assert = require('assert');

var GLOOKO_COOKIE = null;
var GLOOKO_CODE = null;

describe('glooko', () => {

  describe('getGlookoCookie', () => {
    describe('(GLOOKO_EMAIL, GLOOKO_PASSWORD)', () => {
      it('should return a cookie', function() {

        if (process.env['TEST_GLOOKO_AUTHN'] === undefined) {
          console.log('TEST_GLOOKO_AUTHN is unset; skipping');
          this.skip();
        }

        const glookoEmail = process.env['GLOOKO_EMAIL'];
        const glookoPassword = process.env['GLOOKO_PASSWORD'];

        const glookoCookiePromise =
          glooko.getGlookoCookie(glookoEmail, glookoPassword);

        return glookoCookiePromise.then((glookoCookie) => {

          const expected = '_logbook-web_session=';
          const obtained = glookoCookie.substring(0, expected.length);

          assert.equal(expected, obtained);

          GLOOKO_COOKIE = glookoCookie;
        });
      });
    });
  });

});