// import the clas
const sleep = require('sleep');
const fs = require('fs-extra');
const uuid = require('uuid-random');
const debug = require('debug');

// audio streaming library
const audiostream = require('./components/stream-audio');
//GOOGLE Speech to TEXT
const recognizer = require('./components/recognize');
//DialoGFlow Client + Webhook to WikiParser
const dflow = require('./components/detect');
// AMAZON Text to speech functions
const {
    checkUsage,
    generateSpeech,
    getSpinner,
    readText,
    sanitizeOpts,
    splitText,
    readString
  } = require('./components/lib') 

const args = require('minimist')(process.argv.slice(2))
const maxCharacterCount = 1500
debug('called with arguments', JSON.stringify(sanitizeOpts(args)))

//specify input file if readFromFile method is used
let  [input ,outputFilename] = args._

// If only 1 argument was given, use that for the output filename.
if (!outputFilename) {
  outputFilename = input
  input = null
}

debug('input:', input)
debug('output:', outputFilename)

//spinner used for displaying aws-tts progress
let spinner = getSpinner()

//-------------------------

//start streaming and recognize audio using google stt
recognizer.streamingMicRecognize('LINEAR16', 16000, 'en-US', function(results_stt) {
  console.log(`Results from google-stt : ${results_stt}`);
  
  // send result from stt to dialogFlow and then take the resolved output and convert it to an mp3 file
  dflowPromise(results_stt).then(text =>{
    //convertToAudio(text);
    audiostream.startAudio("Humble");
  })
})


//DialogFlow Promise, handles the textRequests to the client js module
function dflowPromise(resultsFromSTT) {
  return new Promise((resolve,reject) => {
    dflow.detectTextIntent('enso-pts', uuid(), [resultsFromSTT], 'en-US',function(results_dflow){
      resolve(results_dflow.fulfillmentText)
    })
  }).then((text) => {
    return text;
  })
}

//AWS-TTS convert dialogFlow response to an mp3 file
function convertToAudio(textInput){
  readString(textInput).then(text => {
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
}

