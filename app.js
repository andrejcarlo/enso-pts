const SimpleWikiSearcher = require('./searcher');
const searcher = new SimpleWikiSearcher();

searcher.search('Pneumonia', function(results){
    var obtained = results;
    console.log('results:' +obtained);
});
