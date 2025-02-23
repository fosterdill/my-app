import { GridWidget } from '@/components/widgetGrid';

export interface SliderWidget extends GridWidget {
  value: number;
  label: string;
  onChange: (value: number) => void;
}

export function createSliderWidget(
  value: number,
  label: string,
  onChange: (value: number) => void,
  gridX: number,
  gridY: number,
): SliderWidget {
  return {
    gridX,
    gridY,
    value,
    label,
    onChange,
    render: (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      const width = 20;
      const height = 100;
      const sliderY = y - height / 2 + height * (1 - value);

      // Draw value above slider
      const displayValue = Math.round(value * 100);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${displayValue}%`, x, y - height / 2 - 15);

      // Draw slider background
      ctx.fillStyle = '#333';
      ctx.fillRect(x - width / 2, y - height / 2, width, height);

      // Draw slider handle
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - width / 2, sliderY - 2, width, 4);

      // Draw label
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y + height / 2 + 15);
    },
    onMouseMove: (x: number, y: number, deltaY: number) => {
      const sensitivity = 0.005;
      const delta = deltaY * sensitivity;
      onChange(Math.max(0, Math.min(1, value + delta)));
    },
  };
}
