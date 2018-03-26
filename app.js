const https = require('https');
const fs = require('fs');

var logger = fs.createWriteStream('log.txt', {
    flags: 'w' // 'a' means appending (old data will be preserved)
  })

var searchedKeyword = 'Pneumoconiosis';
let reqUrl = encodeURI('https://simple.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&formatversion=2&titles=' + searchedKeyword);

https.get(reqUrl, (res) => {
  const { statusCode } = res;
  const contentType = res.headers['content-type'];

  let error;
  if (statusCode !== 200) {
    error = new Error('Request Failed.\n' +
                      `Status Code: ${statusCode}`);
  } else if (!/^application\/json/.test(contentType)) {
    error = new Error('Invalid content-type.\n' +
                      `Expected application/json but received ${contentType}`);
  }
  if (error) {
    console.error(error.message);
    // consume response data to free up memory
    res.resume();
    return;
  }

  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData)['query']['pages'][0];
      //let dataTosend = parsedData.extract;
      console.log(parsedData.extract);
      logger.write(parsedData.extract);
      logger.end();
    } catch (e) {
      console.error(e.message);
    }
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});