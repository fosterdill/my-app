import { useCallback, useRef, useState } from 'react';

interface OscillatorOptions {
  frequency?: number;
  detune?: number;
  type?: OscillatorType;
}

export function useOscillator(audioContext: AudioContext, initialOptions: OscillatorOptions = {}) {
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const start = useCallback(() => {
    if (isPlaying) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    // Set initial options
    oscillator.frequency.value = initialOptions.frequency ?? 440;
    oscillator.detune.value = initialOptions.detune ?? 0;
    oscillator.type = initialOptions.type ?? 'sine';

    // Connect nodes
    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    setIsPlaying(true);

    // Store refs for later use
    oscillatorRef.current = oscillator;
    gainRef.current = gain;
  }, [audioContext, initialOptions, isPlaying]);

  const stop = useCallback(() => {
    if (!isPlaying) return;

    oscillatorRef.current?.stop();
    oscillatorRef.current?.disconnect();
    gainRef.current?.disconnect();

    oscillatorRef.current = null;
    gainRef.current = null;
    setIsPlaying(false);
  }, [isPlaying]);

  const setFrequency = useCallback((frequency: number) => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = frequency;
    }
  }, []);

  const setDetune = useCallback((detune: number) => {
    if (oscillatorRef.current) {
      oscillatorRef.current.detune.value = detune;
    }
  }, []);

  const setType = useCallback((type: OscillatorType) => {
    if (oscillatorRef.current) {
      oscillatorRef.current.type = type;
    }
  }, []);

  const setGain = useCallback((value: number) => {
    if (gainRef.current) {
      gainRef.current.gain.value = value;
    }
  }, []);

  return {
    start,
    stop,
    isPlaying,
    setFrequency,
    setDetune,
    setType,
    setGain,
  };
}
