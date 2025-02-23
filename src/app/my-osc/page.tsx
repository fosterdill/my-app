'use client';

import { useWidget } from '@/app/hooks/useWidget';
import WidgetGrid from '@/components/widgetGrid';
import { createKnobWidget } from '@/factories/createKnobWidget';
import { createSliderWidget } from '@/factories/createSliderWidget';
import { useOscillator } from '@/app/hooks/useOscillator';
import { useEffect } from 'react';

export default function MyOsc() {
  const audioContext = new AudioContext();
  const oscillator = useOscillator(audioContext);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z') {
        if (oscillator.isPlaying) {
          oscillator.stop();
        } else {
          oscillator.start();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [oscillator]);

  const frequencyKnob = useWidget(createKnobWidget, 'Frequency', 2, 2, (value) => {
    // Map 0-1 to frequency range (20Hz - 2000Hz exponentially)
    const frequency = Math.pow(2000 / 20, value) * 20;
    oscillator.setFrequency(frequency);
  });

  const detuneKnob = useWidget(createKnobWidget, 'Detune', 3, 2, (value) => {
    // Map 0-1 to detune range (-100 to +100 cents)
    const detune = value * 200 - 100;
    oscillator.setDetune(detune);
  });

  const waveformKnob = useWidget(createKnobWidget, 'Waveform', 4, 2, (value) => {
    const waveforms = ['sine', 'square', 'sawtooth', 'triangle'];
    const selectedType = waveforms[Math.floor(value * waveforms.length)];
    oscillator.setType(selectedType as OscillatorType);
  });

  const gainSlider = useWidget(createSliderWidget, 'Volume', 5, 2, (value) => {
    oscillator.setGain(value);
  });

  return <WidgetGrid widgets={[frequencyKnob, detuneKnob, waveformKnob, gainSlider]} />;
}
