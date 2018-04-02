// import the clas
const sleep = require('sleep');
const fs = require('fs-extra');
const uuid = require('uuid-random');
const debug = require('debug');

//GOOGLE Speech to TEXT
const recognizer = require('./recognize');
//DialoGFlow Client + Webhook to WikiParser
const dflow = require('./detect');
// AMAZON Text to speech
const {
    checkUsage,
    generateSpeech,
    getSpinner,
    readText,
    sanitizeOpts,
    splitText,
    readString
  } = require('./lib') 

const args = require('minimist')(process.argv.slice(2))
const maxCharacterCount = 1500
debug('called with arguments', JSON.stringify(sanitizeOpts(args)))

let [input, outputFilename] = args._

// If only 1 argument was given, use that for the output filename.
if (!outputFilename) {
  outputFilename = input
  input = null
}
debug('input:', input)
debug('output:', outputFilename)

let spinner = getSpinner()

//-------------------------


// Async function google speach to text 
recognizer.streamingMicRecognize('LINEAR16', 16000, 'en-US', function(results_stt) {
    console.log(`Results from google-stt : ${results_stt}`);
    //sleep.sleep(3);
    //console.log('Im done sleeping');

    // async function dialog flow client
    var resultsDflow = dflowPromise(results_stt);
    
        
    readString(resultsDflow).then(text => {
        return splitText(text, maxCharacterCount, args)
      }).then(parts => {
        return generateSpeech(parts, args)
      }).then(tempFile => {
        debug(`copying ${tempFile} to ${outputFilename}`)
        fs.move(tempFile, outputFilename, { overwrite: true }, () => {
          spinner.succeed(`Done. Saved to ${outputFilename}`)
        })
      }).catch(err => {
        spinner.info(err.message)
      })
                  
    
    
    
});

//convert dialogflow function to promise structure
function dflowPromise(resultsFromSTT) {
  return new Promise((resolve,reject) => {
    dflow.detectTextIntent('enso-pts', uuid(), [resultsFromSTT], 'en-US',function(results_dflow){
      resolve(results_dflow.fulfillmentText)
    })
  }).then((text) => {
    return text;
  })
}

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


