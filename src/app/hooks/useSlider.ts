import { useCallback, useMemo, useState } from 'react';

import { createSliderWidget } from '@/factories/createSliderWidget';

export function useSlider(label: string, gridX: number, gridY: number, onChange?: (value: number) => void) {
  const [value, setValue] = useState(0.5);

  const handleChange = useCallback(
    (newValue: number) => {
      setValue(newValue);
      onChange?.(newValue);
    },
    [onChange],
  );

  const widget = useMemo(
    () => createSliderWidget(value, label, handleChange, gridX, gridY),
    [value, label, gridX, gridY, handleChange],
  );

  return widget;
}
