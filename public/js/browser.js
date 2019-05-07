// Copyright 2017 Telefónica Digital España S.L.
//
// This file is part of UrboCore WWW.
//
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
//
// For those usages not covered by this license please contact with
// iot_support at tid dot es

'use strict';

/**
 * Get the data about the browser used by the user
 * 
 * @returns {Array} - Browser data
 */
function getBrowser() {
  var ua = navigator.userAgent;
  var tem;
  var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];

  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
    return 'IE ' + (tem[1] || '');
  }

  M = M[2]
    ? [M[1], M[2]]
    : [navigator.appName, navigator.appVersion, '-?'];

  if ((tem = ua.match(/version\/([\.\d]+)/i)) != null) {
    M[2] = tem[1];
  }

  return M;
};

/**
 * Is browser supported
 * 
 * @returns {Boolean}
 */
function isSupportedBrowser() {
  var dataBrowser = getBrowser();
  var browser = [];

  if (typeof dataBrowser === 'string') {
    browser[0] = dataBrowser;
  } else {
    browser = dataBrowser;
  }

  if (
    (browser[0].indexOf('IE') > -1)
    || (browser[0] == 'Firefox' &&  !isNaN(parseFloat(browser[1])) && parseFloat(browser[1]) < 38.0)
    || (browser[0] == 'Safari' && !isNaN(parseFloat(browser[2])) && parseFloat(browser[2]) < 9.0)
  ) {
    return false;
  }

  return true;
};

//if (!isSupportedBrowser()) {
  window.location.href = '/browser_error.html';
// }

