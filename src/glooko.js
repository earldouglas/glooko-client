(function() {
  'use strict';

  const getGlookoCookie = (glookoEmail, glookoPassword) =>
    fetch('https://us.api.glooko.com/api/v2/users/sign_in', {
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

  const getGlookoCode = (glookoCookie) => {

    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json; charset=UTF-8',
      },
    };

    if (glookoCookie) {
      options.headers['Cookie'] = glookoCookie;
    } else {
      options.credentials = 'include';
    }

    return fetch(
      'https://us.api.glooko.com/api/v3/session/users',
      options,
    ).then((response) =>
      response.json()
    ).then((responseJson) =>
      responseJson.currentPatient.glookoCode
    );
  };

  const exports = {
    getGlookoCookie: getGlookoCookie,
    getGlookoCode: getGlookoCode,
  };

  if (typeof module !== 'undefined') {
    module.exports = exports;
  } else {
    window.glookoClient = exports;
  }

})();