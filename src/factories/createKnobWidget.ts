import { GridWidget } from '@/components/widgetGrid';

export interface KnobWidget extends GridWidget {
  value: number;
  label: string;
  onChange: (value: number) => void;
}
export function createKnobWidget(
  value: number,
  label: string,
  onChange: (value: number) => void,
  gridX: number,
  gridY: number,
): KnobWidget {
  return {
    gridX,
    gridY,
    value,
    label,
    onChange,
    render: (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      const radius = 30;
      const startAngle = Math.PI * 0.75;
      const endAngle = Math.PI * 2.25;
      const currentAngle = startAngle + (endAngle - startAngle) * value;

      // Draw knob background
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#333';
      ctx.fill();

      // Draw knob indicator
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(currentAngle) * radius, y + Math.sin(currentAngle) * radius);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label with larger font and more spacing
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y + radius + 15);

      // Draw value with more spacing
      const displayValue = Math.round(value * 100);
      ctx.font = '14px Arial';
      ctx.fillText(`${displayValue}%`, x, y + radius + 40);
    },
    onMouseMove: (x: number, y: number, deltaY: number) => {
      const sensitivity = 0.005;
      const delta = deltaY * sensitivity;
      onChange(Math.max(0, Math.min(1, value + delta)));
    },
  };
}
