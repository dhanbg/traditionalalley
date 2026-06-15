const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`\n=== Received Request: ${req.method} ${req.url} ===`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    console.log('Body:', body);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: "0", message: "Mock Success", data: { ProcessId: "MOCK_PROCESS_ID" } }));
  });
});

server.listen(9999, '0.0.0.0', () => {
  console.log('Mock server listening on port 9999...');
});
