const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/tests',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const tests = JSON.parse(data);
      if (tests.data && tests.data.length > 0) {
        const testId = tests.data[0]._id;
        console.log("Fetching test ID:", testId);
        
        const req2 = http.request({ ...options, path: `/api/v1/tests/${testId}` }, (res2) => {
          let data2 = '';
          res2.on('data', (chunk) => { data2 += chunk; });
          res2.on('end', () => {
             console.log("TEST DETAILS:", data2);
          });
        });
        req2.end();
      } else {
        console.log("No tests found:", data);
      }
    } catch(e) {
      console.log("Error:", e.message, data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
