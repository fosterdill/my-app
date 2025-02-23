import MyOsc from '@/components/myOsc';

export default function MyOscPage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return <MyOsc />;
}
