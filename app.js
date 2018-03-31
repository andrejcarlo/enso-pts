// import the class
const SimpleWikiSearcher = require('./searcher');
// create an object
const searcher = new SimpleWikiSearcher();
const fs = require('fs');
// call search function and results return via callback

var answerFile = fs.createWriteStream('context.txt', {
    flags: 'w' // 'a' means appending (old data will be preserved)
  }) 
searcher.search('Violin', function(results){
    var obtained = results;
    console.log('results:' +obtained);
    
    answerFile.write(obtained);
    answerFile.end();
});
