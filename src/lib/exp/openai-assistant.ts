require('dotenv').config({ path: '.env.local' });

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const main = async () => {
  const assistant = await openai.beta.assistants.create({
    name: 'Math Tutor',
    instructions: 'You are a personal math tutor. Write and run code to answer math questions.',
    tools: [{ type: 'code_interpreter' }],
    model: 'gpt-4o',
  });
  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: 'I need to solve the equation `3x + 11 = 14`. Can you help me?',
  });

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistant.id,
    instructions: 'Please address the user as Jane Doe. The user has a premium account.',
  });

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    for (const message of messages.data.reverse()) {
      console.log(`${message.role} > ${'text' in message.content[0] ? message.content[0].text.value : ''}`);
    }
  } else {
    console.log(run.status);
  }
};
main();
