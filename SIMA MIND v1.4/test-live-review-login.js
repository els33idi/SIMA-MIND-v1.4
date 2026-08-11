const fetch = require('node-fetch');

(async () => {
  const url = 'http://127.0.0.1:4000/api/auth/login';
  const payload = {
    email: 'googleplay@sima-mind.app',
    password: 'g00gleplay$#%1234',
    deviceId: 'test-device-1',
    deviceName: 'ReviewTest',
    deviceType: 'web'
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await res.text();
  console.log('status', res.status);
  console.log('body', body);
})();
