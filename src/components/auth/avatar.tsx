import React, { useMemo } from 'react';
import { Address, keccak256, toBytes } from 'viem';

export const BlurredAvatar = ({ address, size = 64 }: { address: Address; size?: number }) => {
  const blobs = useMemo(() => {
    const seed = keccak256(address);
    const bytes = toBytes(seed);
    const blobCount = 8;

    const blobs = Array.from({ length: blobCount }).map((_, i) => {
      const offset = i * 5;

      const hue = (bytes[offset % bytes.length] / 255) * 360;
      const saturation = 100;
      const lightness = 50 + (bytes[(offset + 1) % bytes.length] / 255) * 10;
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      return {
        cx: (bytes[(offset + 2) % bytes.length] / 255) * size,
        cy: (bytes[(offset + 3) % bytes.length] / 255) * size,
        r: (bytes[(offset + 4) % bytes.length] / 255) * (size / 1.3), // larger radius
        fill: color,
      };
    });

    return blobs;
  }, [address, size]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-full">
      <defs>
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <g filter="url(#blur)">
        {blobs.map((blob, i) => (
          <circle key={i} cx={blob.cx} cy={blob.cy} r={blob.r} fill={blob.fill} opacity="0.75" />
        ))}
      </g>
    </svg>
  );
};
