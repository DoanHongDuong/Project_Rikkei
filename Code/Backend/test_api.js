const http = require('http');

http.get('http://localhost:5000/api/departments', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Departments:', res.statusCode, data));
});

