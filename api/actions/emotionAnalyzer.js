// @ts-nocheck
/** @type { ActionRun } */
export const run = async ({ params, logger, api, connections }) => {
    const fetch = require('node-fetch');
    const MODEL_URL = 'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base';
    
    async function analysis(text) {
        try {
            const response = await fetch(MODEL_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: text })
            });

            if (!response.ok) {
                logger.info(`ERRor ${response}`)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            logger.error('Error analyzing emotion:', error);
            throw error; // Re-throw to handle it in the calling function
        }
    }

    try {
        // Ensure params.content exists
        logger.info(JSON.stringify(params));
        if (!params.content) {
            throw new Error('No content provided for emotion analysis');
        }

        const result = await analysis(params.content);
        logger.info('Emotion Analysis Result:', result);
        return result;
    } catch (error) {
        logger.error(`Failed to analyze emotion: error: ${error}`);
        throw error; // Re-throw if you want the action to fail
    }
};

export const params = {
    content: { 
      type: "string",
      required: true
    }
  };