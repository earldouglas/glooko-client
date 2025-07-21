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

    const fetchOptions = {
      method: 'GET',
      headers: {
        Accept: 'application/json; charset=UTF-8',
      },
    };

    if (glookoCookie) {
      fetchOptions.headers['Cookie'] = glookoCookie;
    } else {
      fetchOptions.credentials = 'include';
    }

    return fetch(
      'https://us.api.glooko.com/api/v3/session/users',
      fetchOptions,
    ).then((response) =>
      response.json()
    ).then((responseJson) =>
      responseJson.currentPatient.glookoCode
    );
  };

  const getTdi = (glookoCookie, glookoCode, dateString) => {

    const startDate = `${dateString}T00:00:00.000Z`;
    const endDate = `${dateString}T23:59:59.999Z`;

    const url = `https://us.api.glooko.com/api/v3/graph/statistics/overall?patient=${glookoCode}&startDate=${startDate}&endDate=${endDate}&includeInsulin=true`;

    const fetchOptions = {
      method: 'GET',
      headers: {
        Accept: 'application/json; charset=UTF-8',
      },
    };

    if (glookoCookie) {
      fetchOptions.headers['Cookie'] = glookoCookie;
    } else {
      fetchOptions.credentials = 'include';
    }

    return fetch(
      url,
      fetchOptions,
    ).then((response) =>
      response.json()
    ).then((responseJson) =>
      responseJson.totalInsulinPerDay
    );
  };

  function getBoluses(glookoCookie, glookoCode) {

    const localDate = (timestampISOString, offsetString) => {

      const offsetRegex = /^([+-])(\d\d):(\d\d)$/;

      // HACK: fix the incorrect time zone provided by Glooko
      const offsetGroups =
        offsetString === "+00:00" ?
        "-07:00".match(offsetRegex) :
        offsetString.match(offsetRegex);

      const offsetSign = offsetGroups[1] === '+' ? -1 : 1;
      const offsetHours = Number(`${offsetGroups[2]}`)
      const offsetMins = Number(`${offsetGroups[3]}`)

      const totalOffsetInMillis =
        offsetSign * (offsetHours * 60 + offsetMins) * 60 * 1000;

      const offsetDate = new Date(timestampISOString);
      offsetDate.setTime(offsetDate.getTime() + totalOffsetInMillis);

      return offsetDate;
    };

    const twoDaysAgo = new Date().getTime() - (2 * 24 * 60 * 60 * 1000);
    const limit = Math.ceil(((new Date()).getTime() - twoDaysAgo) / (1000 * 60 * 5));

    const startDate = (new Date(twoDaysAgo)).toISOString();
    const lastGuid = '2a2fd078-2a20-4106-ba0f-8ec144f6a89b';

    const url = `https://api.glooko.com/api/v2/pumps/normal_boluses?patient=${glookoCode}&startDate=${startDate}&lastUpdatedAt=${startDate}&lastGuid=${lastGuid}&limit=${limit}`;

    const fetchOptions = {
      method: 'GET',
      headers: {
        Accept: 'application/json; charset=UTF-8',
      },
    };

    if (glookoCookie) {
      fetchOptions.headers['Cookie'] = glookoCookie;
    } else {
      fetchOptions.credentials = 'include';
    }

    return fetch(
      url,
      fetchOptions,
    ).then((response) =>
      response.json()
    ).then((responseJson) =>
      responseJson
      .normalBoluses
      .map((x) => {

        const timestamp =
          localDate(x.pumpTimestamp, x.pumpTimestampUtcOffset)
          .toISOString();

        return {
          eventType: 'Bolus',
          insulin: x.insulinDelivered,
          'created_at': timestamp,
        };
      })
    );
  }

  const exports = {
    getGlookoCookie: getGlookoCookie,
    getGlookoCode: getGlookoCode,
    getTdi: getTdi,
    getBoluses: getBoluses,
  };

  if (typeof module !== 'undefined') {
    module.exports = exports;
  } else {
    window.glookoClient = exports;
  }

})();