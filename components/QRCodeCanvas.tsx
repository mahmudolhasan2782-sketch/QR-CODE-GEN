import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QRConfig } from '../types';

interface QRCodeCanvasProps {
  config: QRConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const QRCodeCanvasWrapper: React.FC<QRCodeCanvasProps> = ({ config, canvasRef }) => {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex justify-center items-center overflow-hidden">
      <QRCodeCanvas
        ref={canvasRef}
        value={config.value || "https://example.com"}
        size={config.size}
        bgColor={config.bgColor}
        fgColor={config.fgColor}
        level={config.level}
        includeMargin={true}
        imageSettings={
          config.includeLogo && config.logoUrl
            ? {
                src: config.logoUrl,
                x: undefined,
                y: undefined,
                height: config.logoSize,
                width: config.logoSize,
                excavate: true,
              }
            : undefined
        }
      />
    </div>
  );
};