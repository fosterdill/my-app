'use client';

import { useKnob } from '@/app/hooks/useKnob';
import { useSlider } from '@/app/hooks/useSlider';
import WidgetGrid from '@/components/widgetGrid';

export default function MyOsc() {
  const knob1Widget = useKnob('Knob 1', 2, 2, (value) => {
    console.log('Knob 1 changed:', value);
  });
  const knob2Widget = useKnob('Knob 2', 3, 2, (value) => {
    console.log('Knob 2 changed:', value);
  });
  const knob3Widget = useSlider('Knob 3', 4, 2, (value) => {
    console.log('Knob 3 changed:', value);
  });

  return <WidgetGrid widgets={[knob1Widget, knob2Widget, knob3Widget]} />;
}
