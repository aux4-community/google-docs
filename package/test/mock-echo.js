// Echo mock API server for the community/google-docs tests.
// Usage: node mock-echo.js <port>
// Node is used instead of Python because Python 3.14's http.server leaves its
// listening socket unreachable on the macos-latest CI runner.
//
// Every request is echoed back as JSON so tests can assert exactly what aux4
// built: method, path, Authorization header, Content-Type and parsed body.

const http = require("http");

const port = parseInt(process.argv[2], 10);

// Self-destruct so a stray server never outlives the test run.
setTimeout(() => process.exit(0), 90000);

function readBody(req, cb) {
  const chunks = [];
  req.on("data", c => chunks.push(c));
  req.on("end", () => cb(Buffer.concat(chunks)));
}

const server = http.createServer((req, res) => {
  readBody(req, raw => {
    const text = raw.toString();
    let body = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (e) {
        body = text;
      }
    }
    const payload = {
      method: req.method,
      path: req.url,
      authorization: req.headers["authorization"] || null,
      contentType: req.headers["content-type"] || null,
      body: body
    };
    const data = JSON.stringify(payload, null, 2);
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data)
    });
    res.end(data);
  });
});

server.listen(port);
