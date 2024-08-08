require('dotenv').config({ path: '.env.local' });

import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

import getUserInput from './getUserInput';

// Initialize the OpenAI client
// Pseudocode for a ChatGPT conversation program

// Import necessary modules (readline for user input)

// Initialize conversation history array
// This will store all messages (user and assistant) to maintain context

// Function to get user input
// - Use readline to prompt user and return their input

// Function to send message to OpenAI and get response
// - Take the entire conversation history as input
// - Create a chat completion request with the history
// - Return the assistant's response

// Main chat loop function
// - Initialize conversation with system message
// - Loop:
//   - Get user input
//   - Add user message to conversation history
//   - Send conversation history to OpenAI and get response
//   - Add assistant's response to conversation history
//   - Display assistant's response
//   - Check if user wants to continue or exit

// Function to start the chat program
// - Call the main chat loop function

// Call the start function to begin the program

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let conversationHistory: ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content: 'You are a weather assistant. You get the latest weather for a given location.',
  },
];

async function getCompletion(convHistory: ChatCompletionMessageParam[]) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: convHistory,
    });

    return response;
  } catch (error) {
    console.error('Error getting completion:', error);
  }
}

const main = async () => {
  while (true) {
    const input = await getUserInput('');
    conversationHistory.push({
      role: 'user',
      content: input,
    });
    const completion = await getCompletion(conversationHistory);
    completion?.choices.forEach((c) => {
      console.log(c.message.content);
    });
    conversationHistory = [...conversationHistory, ...(completion?.choices.map((c) => c.message) || [])];
  }
};

main();
