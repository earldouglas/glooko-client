// ==UserScript==
// @name         Glooko
// @namespace    https://earldouglas.com/
// @version      06f0391
// @description  Get TDI from Glooko
// @author       James Earl Douglas <james@earldouglas.com>
// @match        https://us.my.glooko.com/
// @icon         https://earldouglas.com/favicon.ico
// @grant        none
// @require      https://raw.githubusercontent.com/earldouglas/glooko-client/06f0391/src/glooko.js
// ==/UserScript==

(function() {
  'use strict';

  const showTdi = (values) => {

    const section = document.createElement('section');
    section.className = 'InfoPanelSection_InfoPanelSection';
    section.setAttribute('data-testid', 'info-panel-tdi');
    section.innerHTML = `
        <header class="InfoPanelSection_header">
          <h3 class="InfoPanelSection_title">Total Daily Insulin</h3>
        </header>
        <style>
          table.tdi {
            margin: 0 20px;
          }
          table.tdi th {
            font-weight: bold;
          }
          table.tdi th, table.tdi td {
            padding: 0.1em 1ex;
          }
        </style>
        <table class="tdi">
          <tr>
            <th>Date</th>
            <th>TDI</th>
          </tr>
        </table>
      `;

    const panel = document.querySelector('.InfoPanel_InfoPanel');
    panel.prepend(section);

    values.forEach((value) => {

      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${value.date}</td>
          <td style="text-align: right;">${value.tdi} units</td>
        `;

      const table = document.querySelector('table.tdi');
      table.appendChild(row);
    });
  };

  const getDateStrings = () => {

    const getYYYY = (date) =>
      (new Intl.DateTimeFormat('en-US', {
        year: 'numeric'
      })).format(date);

    const getMM = (date) =>
      (new Intl.DateTimeFormat('en-US', {
        month: '2-digit'
      })).format(date);

    const getDD = (date) =>
      (new Intl.DateTimeFormat('en-US', {
        day: '2-digit'
      })).format(date);


    const nowDate = new Date();
    const oneDayAgoDate = new Date(nowDate.getTime() - 1 * 24 * 60 * 60 * 1000);
    const twoDaysAgoDate = new Date(nowDate.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgoDate = new Date(nowDate.getTime() - 3 * 24 * 60 * 60 * 1000);

    const nowDateString = `${getYYYY(nowDate)}-${getMM(nowDate)}-${getDD(nowDate)}`;
    const oneDayAgoDateString = `${getYYYY(oneDayAgoDate)}-${getMM(oneDayAgoDate)}-${getDD(oneDayAgoDate)}`;
    const twoDaysAgoDateString = `${getYYYY(twoDaysAgoDate)}-${getMM(twoDaysAgoDate)}-${getDD(twoDaysAgoDate)}`;
    const threeDaysAgoDateString = `${getYYYY(threeDaysAgoDate)}-${getMM(threeDaysAgoDate)}-${getDD(threeDaysAgoDate)}`;

    return [
      nowDateString,
      oneDayAgoDateString,
      twoDaysAgoDateString,
      threeDaysAgoDateString,
    ];
  };

  const waitForPanel = () =>
    new Promise((resolve) => {
      const observer =
        new MutationObserver((mutations, observer) => {
          const panel = document.querySelector('.InfoPanel_InfoPanel');
          if (panel) {
            observer.disconnect();
            setTimeout(() => resolve(panel), 1000);
          }
        });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });

  window
    .glookoClient
    .getGlookoCode()
    .then((glookoCode) => {

      const tdiPromises =
        getDateStrings()
        .map((dateString) =>
          window
          .glookoClient
          .getTdi(null, glookoCode, dateString)
          .then((tdi) => {
            return {
              date: dateString,
              tdi: tdi,
            };
          })
        );

      Promise
        .all(tdiPromises)
        .then((values) =>
          waitForPanel()
          .then((panel) =>
            showTdi(values)
          )
        );

    });

})();