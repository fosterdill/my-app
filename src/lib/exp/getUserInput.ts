import readline from 'readline';

export default async function getUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdout.write('\n> ');
    let input = '';

    rl.on('line', (line) => {
      rl.close();
      resolve(input + line);
    });

    rl.on('data', (chunk) => {
      input += chunk;
    });
  });
}
