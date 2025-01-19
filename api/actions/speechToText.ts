// @ts-nocheck comment at the top of a file
import { InvalidRecordError, type ActionRun } from "gadget-server";
import Groq from "groq-sdk";
import path from 'path';
import fs from 'fs'
import { Buffer } from 'buffer';
/**
 * Supported audio formats by the Whisper model
 */
const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

/**
 * Interface for the speech-to-text parameters
 */
interface SpeechToTextParams {
  /** Base64 encoded audio file content */
  audioData: string;
  /** Optional language code for transcription */
  language?: string;
}

/**
 * Interface for the speech-to-text response
 */
interface TranscriptionResponse {
  text: string;
  metadata: {
    format: string;
    duration?: number;
    language?: string;
  };
}

/**
 * Initialize Groq client with API key
 */
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Validates the audio data format and size
 * @param base64Data Base64 encoded audio data
 * @returns Object containing format information or throws error
 */
const validateAudioData = (base64Data: string) => {
  if (!base64Data) {
    throw new InvalidRecordError("Missing audio data", [
      { apiIdentifier: "audioData", message: "Audio data is required" }
    ]);
  }
  // Decode base64 to check size
  const buffer = Buffer.from(base64Data, 'base64');
  
  if (buffer.length > MAX_FILE_SIZE) {
    throw new InvalidRecordError("File too large", [
      { apiIdentifier: "audioData", message: `Audio file must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` }
    ]);
  }
  
  // Get format from header
  const format = base64Data.substring(0, 100).toLowerCase();
  const detectedFormat = SUPPORTED_FORMATS.find(fmt => format.includes(fmt));
  
  if (!detectedFormat) {
    throw new InvalidRecordError("Unsupported format", [
      { apiIdentifier: "audioData", message: `Audio format must be one of: ${SUPPORTED_FORMATS.join(', ')}` }
    ]);
  }

  return { format: detectedFormat, size: buffer.length };  
};

/**
 * Converts speech audio to text using the Groq API
 */
export const run: ActionRun = async ({ params, logger }) => {
  logger.info("Starting speech to text generation");
  logger.info(JSON.stringify(params))
  try {
    // const audioInfo = validateAudioData(params.audioData);

    // Create a temporary file path
    const tempFilePath = path.join('/tmp', `audio.webm`);
    logger.info(`tempFilePath: ${tempFilePath}`)
    // Decode base64 audio data to a buffer and write it to a file
    const audioBuffer = Buffer.from(params.audioData, 'base64');
    logger.info(`audioBuffer: ${audioBuffer}`)
    fs.writeFileSync(tempFilePath, audioBuffer);

    try {
      // Call the Groq API with the temporary file
      let transcription 
      if(params.translateMode){
        transcription = await groq.audio.translations.create({
          file: fs.createReadStream(tempFilePath), // Pass the file as a stream
          model: "whisper-large-v3",
          // language: params.language,
          response_format: "json"
        });
        
      }else{
        transcription = await groq.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath), // Pass the file as a stream
          model: "whisper-large-v3-turbo",
          // language: params.language,
          response_format: "json"
        });
      }

      // Prepare the response
      const response: TranscriptionResponse = {
        text: transcription.text,
        metadata: {
          format: "webm",
          language: params.language
        }
      };

      return response;
    } finally {
      // Clean up the temporary file
      // sleep(2)
      fs.unlinkSync(tempFilePath);
    }
  } catch (error) {
    logger.error("Speech to text error:", error);
    throw new InvalidRecordError("Speech to text error", [
      { 
        apiIdentifier: "speechToText", 
        message: error instanceof Error ? error.message : "An error occurred during transcription"
      }
    ]);
  }
};

/**
 * Parameter definitions for the speech-to-text action
 */
export const params = {
  audioData: {
    type: "string",
    required: true
  },
  language: {
    type: "string",
    required: false
  },
  translateMode: {
    type: "boolean",
    required:false
  }
};