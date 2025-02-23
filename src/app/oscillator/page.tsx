'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const NOTE_FREQUENCIES: Record<string, number> = {
  z: 261.63, // C4
  s: 277.18, // C#4
  x: 293.66, // D4
  d: 311.13, // D#4
  c: 329.63, // E4
  v: 349.23, // F4
  g: 369.99, // F#4
  b: 392.0, // G4
  h: 415.3, // G#4
  n: 440.0, // A4
  j: 466.16, // A#4
  m: 493.88, // B4
  ',': 523.25, // C5
};
const w = typeof window !== 'undefined' ? window : null;

export default function OscillatorPage() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Record<string, OscillatorNode>>({});
  const osc2sRef = useRef<Record<string, OscillatorNode>>({});
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);

  const [osc1Waveform, setOsc1Waveform] = useState<OscillatorType>('sawtooth');
  const [osc2Waveform, setOsc2Waveform] = useState<OscillatorType>('sawtooth');
  const [osc1Octave, setOsc1Octave] = useState(0); // Octave shift for osc1 (-2 to +2)
  const [osc2Octave, setOsc2Octave] = useState(0); // Octave shift for osc2 (-2 to +2)
  const [oscMix, setOscMix] = useState(0.5); // Balance between osc1 and osc2
  const [detune, setDetune] = useState(0); // Detune amount in cents
  const [volume] = useState(0.5);
  const [filterCutoff, setFilterCutoff] = useState(2000);
  const [filterResonance, setFilterResonance] = useState(1);
  const [filterEnvAmount, setFilterEnvAmount] = useState(0.5);
  const [lfoRate, setLfoRate] = useState(1);
  const [lfoAmount, setLfoAmount] = useState(0.5);
  const [lfoEnabled, setLfoEnabled] = useState(true);
  const [activeKnob, setActiveKnob] = useState<string | null>(null);
  const [lastY, setLastY] = useState(0);
  const [hoveredKnob, setHoveredKnob] = useState<string | null>(null);

  // Reverb settings
  const [reverbEnabled, setReverbEnabled] = useState(false);
  const [reverbMix, setReverbMix] = useState(0.3);
  const [reverbSize, setReverbSize] = useState(0.7);
  const [reverbDamping, setReverbDamping] = useState(0.5);

  // ADSR state for amp envelope
  const [attack, setAttack] = useState(0.1);
  const [decay, setDecay] = useState(0.2);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.3);

  // ADSR state for filter envelope
  const [filterAttack, setFilterAttack] = useState(0.1);
  const [filterDecay, setFilterDecay] = useState(0.3);
  const [filterSustain, setFilterSustain] = useState(0.4);
  const [filterRelease] = useState(0.2);

  const drawKnob = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, value: number, label: string) => {
    const radius = 30;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const currentAngle = startAngle + (endAngle - startAngle) * value;

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#4A5568';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw filled arc
    ctx.beginPath();
    ctx.arc(x, y, radius - 5, startAngle, currentAngle);
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw indicator line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(currentAngle) * radius * 0.8, y + Math.sin(currentAngle) * radius * 0.8);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + radius + 20);
    ctx.fillText(value.toFixed(2), x, y);
  }, []);

  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.frequency.setValueAtTime(filterCutoff, audioContextRef.current?.currentTime || 0);
      filterRef.current.Q.setValueAtTime(filterResonance * 20, audioContextRef.current?.currentTime || 0);
    }
  }, [filterCutoff, filterResonance]);

  // Update reverb settings when they change
  useEffect(() => {
    if (!audioContextRef.current || !convolverRef.current || !dryGainRef.current || !wetGainRef.current) return;

    // Create new impulse response
    const length = audioContextRef.current.sampleRate * reverbSize * 3;
    const impulse = audioContextRef.current.createBuffer(2, length, audioContextRef.current.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, reverbDamping * 10);
      }
    }

    convolverRef.current.buffer = impulse;

    // Update mix levels
    dryGainRef.current.gain.setValueAtTime(reverbEnabled ? 1 - reverbMix : 1, audioContextRef.current.currentTime);
    wetGainRef.current.gain.setValueAtTime(reverbEnabled ? reverbMix : 0, audioContextRef.current.currentTime);
  }, [reverbEnabled, reverbMix, reverbSize, reverbDamping]);

  const setupAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      filterRef.current = audioContextRef.current.createBiquadFilter();
      lfoRef.current = audioContextRef.current.createOscillator();
      lfoGainRef.current = audioContextRef.current.createGain();
      convolverRef.current = audioContextRef.current.createConvolver();
      dryGainRef.current = audioContextRef.current.createGain();
      wetGainRef.current = audioContextRef.current.createGain();

      gainNodeRef.current.gain.value = volume;
      filterRef.current.frequency.value = filterCutoff;
      filterRef.current.type = 'lowpass';
      filterRef.current.Q.value = filterResonance * 20;
      lfoRef.current.frequency.value = lfoRate;
      lfoGainRef.current.gain.value = lfoEnabled ? lfoAmount * 2000 : 0;

      // Create initial impulse response for reverb
      const length = audioContextRef.current.sampleRate * reverbSize * 3;
      const impulse = audioContextRef.current.createBuffer(2, length, audioContextRef.current.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, reverbDamping * 10);
        }
      }
      convolverRef.current.buffer = impulse;

      // Set up routing
      if (lfoEnabled) {
        lfoRef.current.connect(lfoGainRef.current);
        lfoGainRef.current.connect(filterRef.current.frequency);
      }

      // Split signal path for dry/wet
      filterRef.current.connect(dryGainRef.current);
      filterRef.current.connect(convolverRef.current);
      convolverRef.current.connect(wetGainRef.current);

      dryGainRef.current.gain.value = reverbEnabled ? 1 - reverbMix : 1;
      wetGainRef.current.gain.value = reverbEnabled ? reverbMix : 0;

      dryGainRef.current.connect(gainNodeRef.current);
      wetGainRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      if (lfoEnabled) {
        lfoRef.current.start();
      }
    }
  }, [
    lfoRate,
    lfoAmount,
    volume,
    filterCutoff,
    filterResonance,
    lfoEnabled,
    reverbEnabled,
    reverbMix,
    reverbSize,
    reverbDamping,
  ]);

  const startNote = useCallback(
    (key: string) => {
      setupAudio();
      if (!audioContextRef.current || !NOTE_FREQUENCIES[key] || !gainNodeRef.current || !filterRef.current) return;

      const osc1 = audioContextRef.current.createOscillator();
      const osc2 = audioContextRef.current.createOscillator();
      const noteGain = audioContextRef.current.createGain();
      const osc1Gain = audioContextRef.current.createGain();
      const osc2Gain = audioContextRef.current.createGain();
      const now = audioContextRef.current.currentTime;

      // Setup oscillators with octave shifts
      osc1.type = osc1Waveform;
      osc2.type = osc2Waveform;
      const osc1Freq = NOTE_FREQUENCIES[key] * Math.pow(2, osc1Octave);
      const osc2Freq = NOTE_FREQUENCIES[key] * Math.pow(2, osc2Octave);
      osc1.frequency.setValueAtTime(osc1Freq, now);
      osc2.frequency.setValueAtTime(osc2Freq, now);
      osc2.detune.setValueAtTime(detune, now);

      // Setup gains
      osc1Gain.gain.value = oscMix;
      osc2Gain.gain.value = 1 - oscMix;

      // Connect everything
      osc1.connect(osc1Gain);
      osc2.connect(osc2Gain);
      osc1Gain.connect(noteGain);
      osc2Gain.connect(noteGain);
      noteGain.connect(filterRef.current);

      // Amplitude envelope
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(1, now + attack);
      noteGain.gain.linearRampToValueAtTime(sustain, now + attack + decay);

      // Filter envelope
      const baseFreq = filterCutoff;
      const peakFreq = Math.min(baseFreq + filterEnvAmount * 10000, 20000);
      filterRef.current.frequency.setValueAtTime(baseFreq, now);
      filterRef.current.frequency.linearRampToValueAtTime(peakFreq, now + filterAttack);
      filterRef.current.frequency.linearRampToValueAtTime(
        baseFreq + (peakFreq - baseFreq) * filterSustain,
        now + filterAttack + filterDecay,
      );

      osc1.start(now);
      osc2.start(now);
      oscillatorsRef.current[key] = osc1;
      osc2sRef.current[key] = osc2;
      (osc1 as any).gainNode = noteGain;
    },
    [
      osc1Waveform,
      osc2Waveform,
      osc1Octave,
      osc2Octave,
      oscMix,
      detune,
      setupAudio,
      attack,
      decay,
      sustain,
      filterAttack,
      filterDecay,
      filterSustain,
      filterCutoff,
      filterEnvAmount,
    ],
  );

  const stopNote = useCallback(
    (key: string) => {
      const osc1 = oscillatorsRef.current[key];
      const osc2 = osc2sRef.current[key];
      if (osc1 && osc2 && audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        const noteGain = (osc1 as any).gainNode as GainNode;

        // Amplitude release
        noteGain.gain.linearRampToValueAtTime(0, now + release);

        // Filter release
        if (filterRef.current) {
          filterRef.current.frequency.linearRampToValueAtTime(filterCutoff, now + filterRelease);
        }

        osc1.stop(now + Math.max(release, filterRelease));
        osc2.stop(now + Math.max(release, filterRelease));
        delete oscillatorsRef.current[key];
        delete osc2sRef.current[key];
      }
    },
    [release, filterRelease, filterCutoff],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.repeat && NOTE_FREQUENCIES[e.key]) {
        startNote(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (NOTE_FREQUENCIES[e.key]) {
        stopNote(e.key);
      }
    };

    w?.addEventListener('keydown', handleKeyDown);
    w?.addEventListener('keyup', handleKeyUp);

    return () => {
      w?.removeEventListener('keydown', handleKeyDown);
      w?.removeEventListener('keyup', handleKeyUp);
    };
  }, [startNote, stopNote]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw oscillator controls
    drawKnob(ctx, centerX - 400, centerY - 100, (osc1Octave + 2) / 4, 'Osc1 Oct');
    drawKnob(ctx, centerX - 300, centerY - 100, oscMix, 'Osc Mix');
    drawKnob(ctx, centerX - 200, centerY - 100, detune / 100, 'Detune');
    drawKnob(ctx, centerX - 100, centerY - 100, (osc2Octave + 2) / 4, 'Osc2 Oct');

    // Draw filter controls
    drawKnob(ctx, centerX, centerY - 100, filterCutoff / 20000, 'Cutoff');
    drawKnob(ctx, centerX + 100, centerY - 100, filterResonance, 'Resonance');
    drawKnob(ctx, centerX + 200, centerY - 100, filterEnvAmount, 'Env Amt');

    // Draw modulation
    drawKnob(ctx, centerX + 300, centerY - 100, lfoRate / 20, 'LFO Rate');
    drawKnob(ctx, centerX + 400, centerY - 100, lfoAmount, 'LFO Amt');

    // Draw amp envelope
    drawKnob(ctx, centerX - 300, centerY + 50, attack / 2, 'A');
    drawKnob(ctx, centerX - 200, centerY + 50, decay / 2, 'D');
    drawKnob(ctx, centerX - 100, centerY + 50, sustain, 'S');
    drawKnob(ctx, centerX, centerY + 50, release / 2, 'R');

    // Draw filter envelope
    drawKnob(ctx, centerX + 100, centerY + 50, filterAttack / 2, 'F.A');
    drawKnob(ctx, centerX + 200, centerY + 50, filterDecay / 2, 'F.D');
    drawKnob(ctx, centerX + 300, centerY + 50, filterSustain, 'F.S');

    // Draw reverb controls
    drawKnob(ctx, centerX + 400, centerY + 50, reverbMix, 'Rev Mix');
    drawKnob(ctx, centerX + 500, centerY + 50, reverbSize, 'Rev Size');
    drawKnob(ctx, centerX + 600, centerY + 50, reverbDamping, 'Rev Damp');

    // Draw tooltip if a knob is hovered
    if (hoveredKnob) {
      const tooltips: Record<string, string> = {
        osc1Octave: 'Shifts Oscillator 1 pitch up/down by octaves',
        oscMix: 'Balances volume between Oscillator 1 and 2',
        detune: 'Fine-tunes Oscillator 2 pitch',
        osc2Octave: 'Shifts Oscillator 2 pitch up/down by octaves',
        cutoff: 'Controls filter cutoff frequency',
        resonance: 'Controls filter resonance/emphasis',
        filterEnvAmount: 'Amount of filter envelope modulation',
        lfoRate: 'Speed of LFO modulation',
        lfoAmount: 'Amount of LFO modulation on filter',
        attack: 'Time for sound to reach full volume',
        decay: 'Time for sound to reach sustain level',
        sustain: 'Volume level while key is held',
        release: 'Time for sound to fade after key release',
        filterAttack: 'Time for filter to reach peak frequency',
        filterDecay: 'Time for filter to reach sustain frequency',
        filterSustain: 'Filter frequency while key is held',
        reverbMix: 'Balance between dry and wet reverb signal',
        reverbSize: 'Size of the reverb space',
        reverbDamping: 'High frequency damping amount',
      };

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(10, canvas.height - 40, canvas.width - 20, 30);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tooltips[hoveredKnob], canvas.width / 2, canvas.height - 20);
    }
  }, [
    drawKnob,
    oscMix,
    detune,
    osc1Octave,
    osc2Octave,
    filterCutoff,
    filterResonance,
    filterEnvAmount,
    lfoRate,
    lfoAmount,
    attack,
    decay,
    sustain,
    release,
    filterAttack,
    filterDecay,
    filterSustain,
    hoveredKnob,
    reverbMix,
    reverbSize,
    reverbDamping,
  ]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const knobs = [
      { x: centerX - 400, y: centerY - 100, param: 'osc1Octave' },
      { x: centerX - 300, y: centerY - 100, param: 'oscMix' },
      { x: centerX - 200, y: centerY - 100, param: 'detune' },
      { x: centerX - 100, y: centerY - 100, param: 'osc2Octave' },
      { x: centerX, y: centerY - 100, param: 'cutoff' },
      { x: centerX + 100, y: centerY - 100, param: 'resonance' },
      { x: centerX + 200, y: centerY - 100, param: 'filterEnvAmount' },
      { x: centerX + 300, y: centerY - 100, param: 'lfoRate' },
      { x: centerX + 400, y: centerY - 100, param: 'lfoAmount' },
      { x: centerX - 300, y: centerY + 50, param: 'attack' },
      { x: centerX - 200, y: centerY + 50, param: 'decay' },
      { x: centerX - 100, y: centerY + 50, param: 'sustain' },
      { x: centerX, y: centerY + 50, param: 'release' },
      { x: centerX + 100, y: centerY + 50, param: 'filterAttack' },
      { x: centerX + 200, y: centerY + 50, param: 'filterDecay' },
      { x: centerX + 300, y: centerY + 50, param: 'filterSustain' },
      { x: centerX + 400, y: centerY + 50, param: 'reverbMix' },
      { x: centerX + 500, y: centerY + 50, param: 'reverbSize' },
      { x: centerX + 600, y: centerY + 50, param: 'reverbDamping' },
    ];

    for (const knob of knobs) {
      const distance = Math.sqrt(Math.pow(x - knob.x, 2) + Math.pow(y - knob.y, 2));
      if (distance < 30) {
        setActiveKnob(knob.param);
        setLastY(y);
        break;
      }
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Check for hover state
      let foundHover = false;
      const knobs = [
        { x: centerX - 400, y: centerY - 100, param: 'osc1Octave' },
        { x: centerX - 300, y: centerY - 100, param: 'oscMix' },
        { x: centerX - 200, y: centerY - 100, param: 'detune' },
        { x: centerX - 100, y: centerY - 100, param: 'osc2Octave' },
        { x: centerX, y: centerY - 100, param: 'cutoff' },
        { x: centerX + 100, y: centerY - 100, param: 'resonance' },
        { x: centerX + 200, y: centerY - 100, param: 'filterEnvAmount' },
        { x: centerX + 300, y: centerY - 100, param: 'lfoRate' },
        { x: centerX + 400, y: centerY - 100, param: 'lfoAmount' },
        { x: centerX - 300, y: centerY + 50, param: 'attack' },
        { x: centerX - 200, y: centerY + 50, param: 'decay' },
        { x: centerX - 100, y: centerY + 50, param: 'sustain' },
        { x: centerX, y: centerY + 50, param: 'release' },
        { x: centerX + 100, y: centerY + 50, param: 'filterAttack' },
        { x: centerX + 200, y: centerY + 50, param: 'filterDecay' },
        { x: centerX + 300, y: centerY + 50, param: 'filterSustain' },
        { x: centerX + 400, y: centerY + 50, param: 'reverbMix' },
        { x: centerX + 500, y: centerY + 50, param: 'reverbSize' },
        { x: centerX + 600, y: centerY + 50, param: 'reverbDamping' },
      ];

      for (const knob of knobs) {
        const distance = Math.sqrt(Math.pow(x - knob.x, 2) + Math.pow(y - knob.y, 2));
        if (distance < 30) {
          setHoveredKnob(knob.param);
          foundHover = true;
          break;
        }
      }

      if (!foundHover) {
        setHoveredKnob(null);
      }

      if (!activeKnob) return;

      const deltaY = lastY - e.clientY;
      setLastY(e.clientY);

      const sensitivity = 0.005;
      const delta = deltaY * sensitivity;

      switch (activeKnob) {
        case 'osc1Octave':
          setOsc1Octave((prev) => Math.max(-2, Math.min(2, prev + delta * 4)));
          break;
        case 'osc2Octave':
          setOsc2Octave((prev) => Math.max(-2, Math.min(2, prev + delta * 4)));
          break;
        case 'oscMix':
          setOscMix((prev) => Math.max(0, Math.min(1, prev + delta)));
          break;
        case 'detune':
          setDetune((prev) => Math.max(-100, Math.min(100, prev + delta * 100)));
          break;
        case 'cutoff':
          setFilterCutoff((prev) => Math.max(20, Math.min(20000, prev + delta * 20000)));
          break;
        case 'resonance':
          setFilterResonance((prev) => Math.max(0, Math.min(1, prev + delta)));
          break;
        case 'filterEnvAmount':
          setFilterEnvAmount((prev) => Math.max(0, Math.min(1, prev + delta)));
          break;
        case 'lfoRate':
          setLfoRate((prev) => Math.max(0.1, Math.min(20, prev + delta * 20)));
          break;
        case 'lfoAmount':
          setLfoAmount((prev) => Math.max(0, Math.min(1, prev + delta)));
          break;
        case 'attack':
          setAttack((prev) => Math.max(0, Math.min(2, prev + delta * 2)));
          break;
        case 'decay':
          setDecay((prev) => Math.max(0, Math.min(2, prev + delta * 2)));
          break;
        case 'sustain':
          setSustain((prev) => Math.max(0, Math.min(1, prev + delta)));
          break;
        case 'release':
          setRelease((prev) => Math.max(0, Math.min(2, prev + delta * 2)));
          break;
        case 'filterAttack':
          setFilterAttack((prev) => Math.max(0, Math.min(2, prev + delta * 2)));
          break;
        case 'filterDecay':
          setFilterDecay((prev) => Math.max(0, Math.min(2, prev + delta * 2)));
          break;
        case 'filterSustain':
          setFilterSustain((prev) => Math.max(0, Math.min(1, prev + delta)));
          break;
        case 'reverbMix':
          setReverbMix((prev) => Math.max(0, Math.min(1, prev + delta)));
          break;
        case 'reverbSize':
          setReverbSize((prev) => Math.max(0, Math.min(1, prev + delta)));
          break;
        case 'reverbDamping':
          setReverbDamping((prev) => Math.max(0, Math.min(1, prev + delta)));
          break;
      }
    },
    [activeKnob, lastY],
  );

  const handleMouseUp = useCallback(() => {
    setActiveKnob(null);
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute inset-0 bg-gray-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div className="absolute left-1/2 top-8 flex -translate-x-1/2 items-center gap-4">
        <select
          className="rounded bg-gray-700 p-2"
          value={osc1Waveform}
          onChange={(e) => setOsc1Waveform(e.target.value as OscillatorType)}
        >
          <option value="sawtooth">Saw</option>
          <option value="square">Square</option>
          <option value="triangle">Triangle</option>
          <option value="sine">Sine</option>
        </select>

        <select
          className="rounded bg-gray-700 p-2"
          value={osc2Waveform}
          onChange={(e) => setOsc2Waveform(e.target.value as OscillatorType)}
        >
          <option value="sawtooth">Saw</option>
          <option value="square">Square</option>
          <option value="triangle">Triangle</option>
          <option value="sine">Sine</option>
        </select>

        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={lfoEnabled}
            onChange={(e) => setLfoEnabled(e.target.checked)}
            className="size-4"
          />
          LFO Enabled
        </label>

        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={reverbEnabled}
            onChange={(e) => setReverbEnabled(e.target.checked)}
            className="size-4"
          />
          Reverb Enabled
        </label>
      </div>
    </div>
  );
}
