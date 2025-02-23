import { useCallback, useEffect, useRef, useState } from 'react';
export interface GridWidget {
  gridX: number;
  gridY: number;
  render: (ctx: CanvasRenderingContext2D, x: number, y: number) => void;
  onMouseDown?: (x: number, y: number) => void;
  onMouseMove?: (x: number, y: number, deltaY: number) => void;
  onMouseUp?: () => void;
}
interface GridCell {
  x: number;
  y: number;
}
interface WidgetGridProps {
  widgets: GridWidget[];
  cols?: number;
  rows?: number;
}

export default function WidgetGrid({ widgets, cols = 8, rows = 6 }: WidgetGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeWidget, setActiveWidget] = useState<number | null>(null);
  const [lastY, setLastY] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);

  const GRID_COLOR = 'rgba(255, 255, 255, 0.1)';
  const GRID_HOVER_COLOR = 'rgba(255, 255, 255, 0.15)';

  const getGridPosition = useCallback(
    (gridX: number, gridY: number, canvas: HTMLCanvasElement) => {
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;
      return {
        x: (gridX + 0.5) * cellWidth,
        y: (gridY + 0.5) * cellHeight,
      };
    },
    [cols, rows],
  );

  const getGridCell = useCallback(
    (x: number, y: number, canvas: HTMLCanvasElement) => {
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;
      return {
        x: Math.floor(x / cellWidth),
        y: Math.floor(y / cellHeight),
      };
    },
    [cols, rows],
  );

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const cellWidth = width / cols;
      const cellHeight = height / rows;

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const isActiveCell =
            activeWidget !== null && widgets[activeWidget].gridX === x && widgets[activeWidget].gridY === y;
          const isHoveredCell = hoveredCell?.x === x && hoveredCell?.y === y;

          ctx.fillStyle = isActiveCell || (isHoveredCell && activeWidget === null) ? GRID_HOVER_COLOR : 'transparent';
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);

          ctx.strokeStyle = GRID_COLOR;
          ctx.lineWidth = 1;
          ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
      }
    },
    [hoveredCell, activeWidget, widgets, cols, rows],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas.width, canvas.height);

    widgets.forEach((widget) => {
      const pos = getGridPosition(widget.gridX, widget.gridY, canvas);
      widget.render(ctx, pos.x, pos.y);
    });
  }, [widgets, drawGrid, getGridPosition]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cell = getGridCell(x, y, canvas);

      widgets.forEach((widget, index) => {
        if (widget.gridX === cell.x && widget.gridY === cell.y) {
          setActiveWidget(index);
          setLastY(y);
          widget.onMouseDown?.(x, y);
        }
      });
    },
    [widgets, getGridCell],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cell = getGridCell(x, y, canvas);

      setHoveredCell(cell);

      if (activeWidget === null) return;

      const deltaY = lastY - e.clientY;
      setLastY(e.clientY);

      const widget = widgets[activeWidget];
      widget.onMouseMove?.(x, y, deltaY);
    },
    [activeWidget, lastY, widgets, getGridCell],
  );

  const handleMouseUp = useCallback(() => {
    if (activeWidget !== null) {
      widgets[activeWidget].onMouseUp?.();
    }
    setActiveWidget(null);
  }, [activeWidget, widgets]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        setHoveredCell(null);
      }}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
