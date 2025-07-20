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

  describe('getGlookoCode', () => {
    describe('(glookoCookie)', () => {
      it('should return a glookoCode', function() {

        if (GLOOKO_COOKIE === null) {
          this.skip();
        }

        const glookoCodePromise =
          glooko.getGlookoCode(GLOOKO_COOKIE);

        return glookoCodePromise.then((glookoCode) => {

          const regex = /^\w+-\w+-\d+$/;
          const match = glookoCode.match(regex);

          assert.ok(match);

          GLOOKO_CODE = glookoCode;
        });
      });
    });
  });

});