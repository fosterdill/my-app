require('dotenv').config({ path: '.env.local' });
import AnthropicApi from '@anthropic-ai/sdk';
import { ContentBlock, MessageParam, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages.mjs';

import getUserInput from './getUserInput';

const client = new AnthropicApi({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getCompletion(messages: MessageParam[]) {
  try {
    const response = await client.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      system: 'You are a weather assistant. You respond with current weather for a given location.',
      tools: [
        {
          name: 'get_topic',
          description: 'Get the current weather for a location',
          input_schema: {
            type: 'object',
            properties: {
              location: { type: 'string', description: 'The location' },
            },
            required: ['location'],
          },
        },
      ],
      messages,
    });

    return response.content;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function processAiResponse(contentBlock: ContentBlock) {
  switch (contentBlock.type) {
    case 'text':
      console.log(contentBlock.text);
      return null;
    case 'tool_use':
      if (contentBlock.name === 'get_topic') {
        return { type: 'tool_result', tool_use_id: contentBlock.id, content: '15 degrees f' } as ToolResultBlockParam;
      }
      return null;
  }
}

// Example usage
async function main() {
  let messages: MessageParam[] = [];

  const userInput = await getUserInput('');
  messages.push({
    role: 'user',
    content: userInput,
  });
  const aiResponse = await getCompletion(messages);
  messages.push({
    role: 'assistant',
    content: aiResponse || [],
  });

  let hadResult = false;
  if (aiResponse) {
    for (const block of aiResponse) {
      const result = await processAiResponse(block);
      if (result) {
        hadResult = true;
        messages.push({
          role: 'user',
          content: [result],
        });
      }
    }
  }

  if (hadResult) {
    const aiResponse2 = await getCompletion(messages);
    if (aiResponse2) {
      for (const block of aiResponse2) {
        if (block.type === 'text') {
          console.log(block.text);
        }
      }
    }
  }
}

main();
