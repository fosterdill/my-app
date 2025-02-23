'use client';

import { useWidget } from '@/app/hooks/useWidget';
import WidgetGrid from '@/components/widgetGrid';
import { createKnobWidget } from '@/factories/createKnobWidget';
import { createSliderWidget } from '@/factories/createSliderWidget';

export default function MyOsc() {
  const knob1Widget = useWidget(createKnobWidget, 'Knob 1', 2, 2, (value) => {
    console.log('Knob 1 changed:', value);
  });
  const knob2Widget = useWidget(createKnobWidget, 'Knob 2', 3, 2, (value) => {
    console.log('Knob 2 changed:', value);
  });
  const knob3Widget = useWidget(createSliderWidget, 'Knob 3', 4, 2, (value) => {
    console.log('Knob 3 changed:', value);
  });

  return <WidgetGrid widgets={[knob1Widget, knob2Widget, knob3Widget]} />;
}
