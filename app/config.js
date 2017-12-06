'use strict';

module.exports = {
  Authentication: {
    Local: {
      Enabled: true
    },

    // NOTE: https://developers.facebook.com/apps/
    Facebook: {
      Enabled: true,
    },

    // NOTE: https://console.developers.google.com/apis
    Google: {
      Enabled: true,
    },
  },

  Server: {
    Port: {
      Customer: 80,
      Employee: 3000
    }
  }
};
