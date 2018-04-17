// import the clas
const sleep = require('sleep');
const fs = require('fs-extra');
const uuid = require('uuid-random');
const debug = require('debug');
const structjson = require('./components/structjson.js');
const shortid = require('shortid');
const path = require('path');

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
/*
let  [input ,outputFilename] = args._

// If only 1 argument was given, use that for the output filename.
if (!outputFilename) {
  outputFilename = input
  input = null
}
*/
let input = null;
let fileNameUUID = shortid.generate(); //generate short uuid
//let outputFilename = "./testresources/" + fileNameUUID + ".mp3";
let outputFilename = "/Users/alex/Lipsync Raw Test 2/Assets/Crazy Minnow Studio/SALSA with RandomEyes/Resources/audio/" + fileNameUUID + ".mp3";
//let outputFilename = "/Users/alex/Lipsync Raw Test 2/resources/" + fileNameUUID + ".mp3";

debug('input:', input)
debug('output:', outputFilename)

//spinner used for displaying aws-tts progress
let spinner = getSpinner()

//-------------------------

//start streaming and recognize audio using google stt
recognizer.streamingMicRecognize('LINEAR16', 16000, 'en-US', function(results_stt) {
  console.log(`Results from google-stt : ${results_stt}`);
  console.log("Result_stt = " + results_stt.trim());
  if (results_stt.trim() != "stop") {
    // send result from stt to dialogFlow
    dflowPromise(results_stt).then(dflowResponse => {
      // Execute the appropiate command
      let intentName = dflowResponse["intentName"];
      let fulfillmentText = dflowResponse["fulfillmentText"];
      switch (intentName) {
        // search on simplewiki case
        case "keyword-intent":
          convertToAudio(fulfillmentText);
          break;
        
        // play audio case
        case "playSong-intent":
          audiostream.startAudio(fulfillmentText); //song name
          break;
        /*
        // stop Unity from playing file
        case "stop-intent":
          deleteMP3();
          break;
        */
        default:
          console.log("In default case -- not doing anything");
          break;

      }
    })
  } else {
    deleteMP3();
  }
})


//DialogFlow Promise, handles the textRequests to the client js module
function dflowPromise(resultsFromSTT) {
  return new Promise((resolve,reject) => {
    dflow.detectTextIntent('enso-pts', uuid(), [resultsFromSTT], 'en-US',function(results_dflow){
      // Dictionary containing the intent and text reposonse
      let dflowResponse = {
        intentName: results_dflow.intent.displayName, 
        fulfillmentText: results_dflow.fulfillmentText
      }
      resolve(dflowResponse);
    })
  //}).then((dflowResponse) => {
  //  return dflowResponse;
  //})
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

function deleteMP3 () {
  //delete mp3 file
  const directory = '/Users/alex/Lipsync Raw Test 2/Assets/Crazy Minnow Studio/SALSA with RandomEyes/Resources/audio/';
  //const directory = "/Users/alex/Lipsync Raw Test 2/resources/";

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });
}

