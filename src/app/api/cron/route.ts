export function GET(request: Request) {
  console.log('Cron job executed at:', new Date().toISOString());
  return new Response('Cron job executed!', { status: 200 });
}
