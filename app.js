// import the class
const sleep = require('sleep');
const fs = require('fs');
const uuid = require('uuid-random');

//GOOGLE Speech to TEXT
const recognizer = require('./recognize');
//DialoGFlow Client + Webhook to WikiParser
const dflow = require('./detect');
// AMAZON Text to speech


// Async function google speach to text 
recognizer.streamingMicRecognize('LINEAR16', 16000, 'en-US', function(results_stt) {
    console.log(`Results from google-stt : ${results_stt}`);
    //sleep.sleep(3);
    //console.log('Im done sleeping');
});

// async function dialog flow client
dflow.detectTextIntent('enso-pts',uuid(), 'let me know about paper', 'en-US', function(results_dflow){
    console.log('Obtained from dialogFlow: '+ results_dflow.fulfillmentText);
});



// call search function and results return via callback

/*var answerFile = fs.createWriteStream('context.txt', {
    flags: 'w' // 'a' means appending (old data will be preserved)
  }) 
searcher.search('Violin', function(results){
    var obtained = results;
    console.log('results:' +obtained);
    
    answerFile.write(obtained);
    answerFile.end();
});*/


