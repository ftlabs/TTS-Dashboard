# TTS-Dashboard

##Using the FT Labs text-to-speech service as an API

The FT Labs TTS Dash was not designed to be used as an API, however it can function as such. This document outlines the requests that can be made to the FT Labs Dash in order to synthesise speech from text with Amazon’s Polly service.

## Setup locally

- `npm install`
- `touch .env`
- Populate .env with Get .env details from LastPass
	- Ensure **PORT** is set to `4040`
- `npm start`

## Making a request

The request must have the following headers set:

`Content-Type: application/json`

The body of the request must be a JSON object with the following keys/value pairs:

`
{
	“content” : “The text you wish to have synthesised”,
	"voice" : "Geraint (Welsh English)"
}
`

A token must be passed as the query parameter  token  with the request. This is available in the shared FT Labs LastPass folder.

## cURL request

`curl -H "Content-Type: application/json" -X POST -d '{"content" : "hello","voice" : "Geraint (Welsh English)"}' https://ftlabs-tts-dash.herokuapp.com/service/polly?token=[TOKEN] > temp.mp3`

## Selecting a voice
The Amazon Poly service has a number of voices that can be used to select text. You can specify which voice to use with voice param in the POST request to /service/polly.


#### Valid voice options
The following list is the values you must pass to you each voice:

- Geraint (Welsh English)
- Gwyneth (Welsh)
- Hans (German)
- Marlene (German)
- Nicole (Australian)
- Russell (Australian)
- Amy (British)
- Brian (British)
- Emma (British)
- Raveena (Indian English)
- Ivy (US)
- Joanna (US)
- Joey (US)
- Justin (US)
- Kendra (US)
- Kimberly (US)
- Salli (US)
- Celine (French)
- Mathieu (French)

**The case must be respected.**
