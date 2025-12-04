import React from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { QRConfig } from '../types';

interface QRCodeCanvasProps {
  config: QRConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  svgRef: React.RefObject<SVGSVGElement>;
}

export const QRCodeCanvasWrapper: React.FC<QRCodeCanvasProps> = ({ config, canvasRef, svgRef }) => {
  const commonProps = {
    value: config.value || "https://hemontu.com",
    size: config.size,
    bgColor: config.bgColor,
    fgColor: config.fgColor,
    level: config.level,
    includeMargin: true,
    imageSettings: config.includeLogo && config.logoUrl
      ? {
          src: config.logoUrl,
          x: undefined,
          y: undefined,
          height: config.logoSize,
          width: config.logoSize,
          excavate: true,
        }
      : undefined,
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex justify-center items-center overflow-hidden relative">
      {/* Visible Canvas for PNG/JPG - ID added for robust selection */}
      <QRCodeCanvas 
        ref={canvasRef} 
        id="qr-code-canvas-element"
        {...commonProps} 
      />
      
      {/* Hidden SVG for Vector Download - ID added for robust selection */}
      <div style={{ display: 'none' }}>
        <QRCodeSVG 
          ref={svgRef} 
          id="qr-code-svg-element"
          {...commonProps} 
        />
      </div>
    </div>
  );
};