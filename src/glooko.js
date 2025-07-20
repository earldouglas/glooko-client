(function() {
  'use strict';

  const getGlookoCookie = (glookoEmail, glookoPassword) =>
    fetch('https://api.glooko.com/api/v2/users/sign_in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        userLogin: {
          email: glookoEmail,
          password: glookoPassword,
        },
        deviceInformation: {
          applicationType: 'logbook',
        },
      }),
    }).then((response) =>
      response
      .headers
      .getSetCookie()[0]
      .split('; ')[0]
    );

  const exports = {
    getGlookoCookie: getGlookoCookie,
  };

  if (typeof module !== 'undefined') {
    module.exports = exports;
  } else {
    window.glookoClient = exports;
  }

})();
