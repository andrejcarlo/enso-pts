const https = require('https');
const fs = require('fs');


class SimpleWikiSearcher {
  /*var answerFile = fs.createWriteStream('context.txt', {
      flags: 'w' // 'a' means appending (old data will be preserved)
    }) */
  search(inputWord,callback) {
    var searchedKeyword = inputWord;
    let reqUrl = encodeURI('https://simple.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&formatversion=2&titles=' + searchedKeyword);
    var answerToSend = '';
    
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
          var parsedData = JSON.parse(rawData)['query']['pages'][0];
          //let dataTosend = parsedData.extract;
          
          // save to file
          //answerFile.write(parsedData.extract);
          //answerFile.end();
        } catch (e) {
          console.error(e.message);
        }
        answerToSend = parsedData.extract;
        return callback(answerToSend);
        
      });
      
      
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
    //console.log(answerToSend);
  } // end of search function

  
  
}


module.exports = SimpleWikiSearcher;