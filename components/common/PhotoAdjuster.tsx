'use client';

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export type PhotoAdjustValue = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type PhotoAdjusterProps = {
  src: string;
  alt?: string;
  value: PhotoAdjustValue;
  onChange: (nextValue: PhotoAdjustValue) => void;
  height?: number;
  borderRadius?: number;
  background?: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDistance(a: PointerPosition, b: PointerPosition) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getCenter(a: PointerPosition, b: PointerPosition) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

type PointerPosition = {
  id: number;
  x: number;
  y: number;
};

export default function PhotoAdjuster({
  src,
  alt = 'photo',
  value,
  onChange,
  height = 220,
  borderRadius = 22,
  background = '#f4f1ea',
}: PhotoAdjusterProps) {
  const pointersRef = useRef<PointerPosition[]>([]);
  const lastSinglePointerRef = useRef<PointerPosition | null>(null);
  const lastPinchRef = useRef<{
    distance: number;
    center: { x: number; y: number };
    scale: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const valueRef = useRef(value);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const updatePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const nextPointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };

    const existingIndex = pointersRef.current.findIndex(
      (pointer) => pointer.id === event.pointerId
    );

    if (existingIndex >= 0) {
      pointersRef.current[existingIndex] = nextPointer;
    } else {
      pointersRef.current.push(nextPointer);
    }

    return nextPointer;
  };

  const removePointer = (pointerId: number) => {
    pointersRef.current = pointersRef.current.filter(
      (pointer) => pointer.id !== pointerId
    );

    if (pointersRef.current.length === 1) {
      lastSinglePointerRef.current = pointersRef.current[0];
    } else {
      lastSinglePointerRef.current = null;
    }

    lastPinchRef.current = null;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);

    const pointer = updatePointer(event);

    if (pointersRef.current.length === 1) {
      lastSinglePointerRef.current = pointer;
      lastPinchRef.current = null;
      return;
    }

    if (pointersRef.current.length === 2) {
      const [first, second] = pointersRef.current;
      lastSinglePointerRef.current = null;

      lastPinchRef.current = {
        distance: getDistance(first, second),
        center: getCenter(first, second),
        scale: valueRef.current.scale,
        offsetX: valueRef.current.offsetX,
        offsetY: valueRef.current.offsetY,
      };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    updatePointer(event);

    if (pointersRef.current.length === 1 && lastSinglePointerRef.current) {
      const current = pointersRef.current[0];
      const previous = lastSinglePointerRef.current;

      const deltaX = current.x - previous.x;
      const deltaY = current.y - previous.y;

      lastSinglePointerRef.current = current;

      onChange({
        scale: valueRef.current.scale,
        offsetX: valueRef.current.offsetX + deltaX,
        offsetY: valueRef.current.offsetY + deltaY,
      });

      return;
    }

    if (pointersRef.current.length >= 2 && lastPinchRef.current) {
      const [first, second] = pointersRef.current;
      const currentDistance = getDistance(first, second);
      const currentCenter = getCenter(first, second);

      const ratio = currentDistance / Math.max(lastPinchRef.current.distance, 1);
      const nextScale = clamp(lastPinchRef.current.scale * ratio, MIN_SCALE, MAX_SCALE);

      const centerDeltaX = currentCenter.x - lastPinchRef.current.center.x;
      const centerDeltaY = currentCenter.y - lastPinchRef.current.center.y;

      onChange({
        scale: nextScale,
        offsetX: lastPinchRef.current.offsetX + centerDeltaX,
        offsetY: lastPinchRef.current.offsetY + centerDeltaY,
      });
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    removePointer(event.pointerId);

    if (pointersRef.current.length === 0) {
      setIsDragging(false);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const direction = event.deltaY > 0 ? -0.08 : 0.08;
    const nextScale = clamp(valueRef.current.scale + direction, MIN_SCALE, MAX_SCALE);

    onChange({
      ...valueRef.current,
      scale: nextScale,
    });
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{
        width: '100%',
        height,
        borderRadius,
        overflow: 'hidden',
        position: 'relative',
        background,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
          transform: `translate(${value.offsetX}px, ${value.offsetY}px) scale(${value.scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 80ms ease',
        }}
      />
    </div>
  );
}
