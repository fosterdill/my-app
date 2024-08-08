require('dotenv').config({ path: '.env.local' });

import OpenAI from 'openai';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/index.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getDeliveryDate = async (orderId: string): datetime => {
  return new Date();
};

const main = async () => {
  const tools: ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'get_delivery_date',
        description:
          "Get the delivery date for a customer's order. Call this whenever you need to know the delivery date, for example when a customer asks 'Where is my package'",
        parameters: {
          type: 'object',
          properties: {
            order_id: {
              type: 'string',
              description: "The customer's order ID.",
            },
          },
          required: ['order_id'],
          additionalProperties: false,
        },
      },
    },
  ];

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'You are a helpful customer support assistant. Use the supplied tools to assist the user.',
    },
    { role: 'user', content: 'Hi, can you tell me the delivery date for my order?' },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: messages,
    tools: tools,
  });
};
