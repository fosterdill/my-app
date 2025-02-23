'use client';

import { useCallback, useMemo, useState } from 'react';

import WidgetGrid from '@/components/widgetGrid';
import { createKnobWidget } from '@/factories/createKnobWidget';

function useKnob(label: string, gridX: number, gridY: number, onChange?: (value: number) => void) {
  const [value, setValue] = useState(0.5);

  const handleChange = useCallback(
    (newValue: number) => {
      setValue(newValue);
      onChange?.(newValue);
    },
    [onChange],
  );

  const widget = useMemo(
    () => createKnobWidget(value, label, handleChange, gridX, gridY),
    [value, label, gridX, gridY, handleChange],
  );

  return widget;
}

export default function MyOsc() {
  const knob1Widget = useKnob('Knob 1', 2, 2, (value) => {
    console.log('Knob 1 changed:', value);
  });
  const knob2Widget = useKnob('Knob 2', 3, 2, (value) => {
    console.log('Knob 2 changed:', value);
  });
  const knob3Widget = useKnob('Knob 3', 4, 2, (value) => {
    console.log('Knob 3 changed:', value);
  });

  return <WidgetGrid widgets={[knob1Widget, knob2Widget, knob3Widget]} />;
}
