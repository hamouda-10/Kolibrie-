import type { CSSProperties } from 'react';
import { SHEETS, type SheetKey } from '../data/kolibrieData';

interface CropImageProps {
  crop: `${SheetKey}:${0 | 1 | 2 | 3}`;
  alt: string;
  className?: string;
}

export function CropImage({ crop, alt, className = '' }: CropImageProps) {
  const [sheetKey, cellStr] = crop.split(':') as [SheetKey, string];
  const cellIndex = Number(cellStr) as 0 | 1 | 2 | 3;
  const sheet = SHEETS[sheetKey];
  const [rawX, rawY, rawW, rawH] = sheet.cells[cellIndex];

  // Inset by 4 px on every side so white gutters never show
  const cellX = rawX + 4;
  const cellY = rawY + 4;
  const cellW = rawW - 8;
  const cellH = rawH - 8;
  const ar = cellW / cellH;

  const cellStyle = { '--ar': String(ar) } as CSSProperties;
  const imgStyle: CSSProperties = {
    width: `${(sheet.width / cellW) * 100}%`,
    height: `${(sheet.height / cellH) * 100}%`,
    left: `${(-cellX / cellW) * 100}%`,
    top: `${(-cellY / cellH) * 100}%`,
  };

  return (
    <div className={`crop ${className}`.trim()} data-crop={crop}>
      <div className="cell" style={cellStyle}>
        <img
          src={sheet.url}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          style={imgStyle}
        />
      </div>
    </div>
  );
}
