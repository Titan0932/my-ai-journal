// @ts-nocheck comment at the top of a file
import { InvalidRecordError } from "gadget-server"; 
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateSummary = async (content) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `This is my journal entry. Summarize the events of the day and what happened. Also say what kind of day it was. Do not make it too long or too short.The content -> "${content}"`
        },
      ],
      model: "llama-3.3-70b-versatile",
    });
    
    return response.choices[0]?.message?.content;
  } catch (error) {
    throw new InvalidRecordError("Failed to generate summary", [
      { apiIdentifier: "getSummary", message: "An error occurred while generating the summary" }
    ]);
  }
};

export const run = async ({ params, logger, api, connections }) => {
  logger.info("Starting summary generation");

  if (!params.content || typeof params.content !== "string" || params.content.trim().length === 0) {
    throw new InvalidRecordError("Invalid content parameter", [
      { apiIdentifier: "getSummary", message: "Content must be a non-empty string" }
    ]);
  }

  const summary = await generateSummary(params.content);
  
  if (!summary) {
    throw new InvalidRecordError("Summary generation failed", [
      { apiIdentifier: "getSummary", message: "Unable to generate a summary from the provided content" }
    ]);
  }

  logger.info("Successfully generated summary");
  return summary;
};
  
export const params = {
  content: { 
    type: "string",
    required: true
  }
};