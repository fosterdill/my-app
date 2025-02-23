import { useCallback, useMemo, useState } from 'react';

import { GridWidget } from '@/components/widgetGrid';

type WidgetFactory<T extends GridWidget> = (
  value: number,
  label: string,
  onChange: (value: number) => void,
  gridX: number,
  gridY: number,
) => T;

export function useWidget<T extends GridWidget>(
  factory: WidgetFactory<T>,
  label: string,
  gridX: number,
  gridY: number,
  onChange?: (value: number) => void,
) {
  const [value, setValue] = useState(0.5);

  const handleChange = useCallback(
    (newValue: number) => {
      setValue(newValue);
      onChange?.(newValue);
    },
    [onChange],
  );

  const widget = useMemo(
    () => factory(value, label, handleChange, gridX, gridY),
    [factory, value, label, gridX, gridY, handleChange],
  );

  return widget;
}
