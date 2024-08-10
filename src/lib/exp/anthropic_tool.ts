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
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: 'You are a weather assistant. You respond with current weather for a given location.',
      tools: [
        {
          name: 'get_weather',
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

const weatherData = {
  ny: '15 degrees f',
  la: '20 degrees f',
  chicago: '10 degrees f',
  houston: '12 degrees f',
  miami: '25 degrees f',
};

async function processAiResponse(contentBlock: ContentBlock): Promise<ToolResultBlockParam | null> {
  if (contentBlock.type === 'text') {
    console.log(contentBlock.text);
    return null;
  }

  if (contentBlock.type === 'tool_use' && contentBlock.name === 'get_weather') {
    // Here you would typically make an API call to get real weather data
    console.log(contentBlock.input);
    return {
      type: 'tool_result',
      tool_use_id: contentBlock.id,
      content: weatherData[(contentBlock.input as { location: string }).location as keyof typeof weatherData],
    };
  }

  return null;
}

async function main() {
  let messages: MessageParam[] = [];

  while (true) {
    const userInput = await getUserInput('Enter your message (or type "exit" to quit): ');

    if (userInput.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      break;
    }

    messages.push({ role: 'user', content: userInput });

    const aiResponse = await getCompletion(messages);
    if (!aiResponse) continue;

    messages.push({ role: 'assistant', content: aiResponse });

    for (const block of aiResponse) {
      const result = await processAiResponse(block);
      if (result) {
        messages.push({ role: 'user', content: [result] });
        const followUpResponse = await getCompletion(messages);
        if (followUpResponse) {
          followUpResponse.forEach((block) => {
            if (block.type === 'text') console.log(block.text);
          });
          messages.push({ role: 'assistant', content: followUpResponse });
        }
      }
    }
  }
}

main();
