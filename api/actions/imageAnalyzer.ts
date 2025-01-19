// @ts-nocheck comment at the top of a file
import { InvalidRecordError } from "gadget-server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {

  if(!params?.imageString)
    throw new InvalidRecordError("Image not received!", [
          { apiIdentifier: "imageAnalyzer", message: "Content must be a non-empty base64 string of an image" }
        ]);
  
  const chatCompletion = await groq.chat.completions.create({
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": 'The emotions that can be interpreted by analyzing this image is how I feel. Analyze the emotions. And describe it as if I was feeling that emotion. Example: if you see a boy jumping in happiness, say "I feel like jumping in the air because of joy"'
          },
          {
            "type": "image_url",
            "image_url": {
                "url": `data:image/jpeg;base64,${params.imageString}`,
            },
          },
        ]
      }
    ],
    "model": "llama-3.2-11b-vision-preview",
    "stream": false,
    "stop": null
  });

    logger.info(JSON.stringify(chatCompletion))

   return (chatCompletion.choices[0].message.content);
};
  
export const params = {
  imageString: { 
    type: "string",
    required: true
  }
};