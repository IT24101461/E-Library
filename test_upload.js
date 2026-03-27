const fs = require('fs');
const http = require('http');

fs.writeFileSync('C:\\Users\\senal\\Downloads\\backend\\test_dummy.txt', 'dummy content');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
let postData = '';
postData += '--' + boundary + '\r\n';
postData += 'Content-Disposition: form-data; name="title"\r\n\r\nTest\r\n';
postData += '--' + boundary + '\r\n';
postData += 'Content-Disposition: form-data; name="author"\r\n\r\nTest\r\n';
postData += '--' + boundary + '\r\n';
postData += 'Content-Disposition: form-data; name="file"; filename="test_dummy.txt"\r\n';
postData += 'Content-Type: text/plain\r\n\r\n';
postData += 'dummy content\r\n';
postData += '--' + boundary + '--\r\n';

const req = http.request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/books',
    method: 'POST',
    headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': Buffer.byteLength(postData)
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Status: ' + res.statusCode);
        console.log('Body: ' + body);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
