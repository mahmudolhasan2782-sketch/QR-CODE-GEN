import React, { useState, useRef, useCallback } from 'react';
import { QRCodeCanvasWrapper } from './components/QRCodeCanvas';
import { QRConfig, DownloadFormat } from './types';
import { jsPDF } from 'jspdf';
import { 
  Download, 
  Settings, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Share2, 
  Trash2,
  QrCode
} from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<QRConfig>({
    value: '',
    fgColor: '#000000',
    bgColor: '#ffffff',
    size: 256,
    level: 'H',
    includeLogo: false,
    logoUrl: null,
    logoSize: 40,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig((prev) => ({
          ...prev,
          logoUrl: event.target?.result as string,
          includeLogo: true,
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeLogo = () => {
    setConfig((prev) => ({ ...prev, logoUrl: null, includeLogo: false }));
  };

  const downloadQRCode = useCallback((format: DownloadFormat) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'png' || format === 'jpg') {
      const link = document.createElement('a');
      link.download = `qrcode.${format}`;
      link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
      link.click();
    } else if (format === 'pdf') {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [config.size + 40, config.size + 40]
      });
      pdf.addImage(imgData, 'PNG', 20, 20, config.size, config.size);
      pdf.save('qrcode.pdf');
    }
  }, [config.size]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white">
              <QrCode size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              QR Pro Generator
            </h1>
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
          >
            Deploy on Vercel
          </a>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Type className="text-indigo-500" size={18} />
                <h2 className="font-semibold text-slate-800">Content</h2>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Text or URL
                </label>
                <textarea
                  name="value"
                  value={config.value}
                  onChange={handleInputChange}
                  placeholder="Enter text, URL, or data here..."
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[100px] text-slate-700"
                />
              </div>
            </section>

            {/* Customization Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Palette className="text-pink-500" size={18} />
                <h2 className="font-semibold text-slate-800">Appearance</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Foreground Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="fgColor"
                      value={config.fgColor}
                      onChange={handleInputChange}
                      className="h-10 w-10 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      name="fgColor"
                      value={config.fgColor}
                      onChange={handleInputChange}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-sm uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="bgColor"
                      value={config.bgColor}
                      onChange={handleInputChange}
                      className="h-10 w-10 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      name="bgColor"
                      value={config.bgColor}
                      onChange={handleInputChange}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-sm uppercase"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Logo & Settings Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Settings className="text-purple-500" size={18} />
                <h2 className="font-semibold text-slate-800">Advanced Options</h2>
              </div>
              <div className="p-6 space-y-6">
                
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} /> Logo Overlay
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <div className="relative flex items-center justify-center w-full h-12 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors bg-slate-50 hover:bg-white">
                        <span className="text-sm text-slate-500">
                          {config.logoUrl ? 'Change Logo' : 'Upload Logo (Optional)'}
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </div>
                    </label>
                    {config.logoUrl && (
                      <button
                        onClick={removeLogo}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Logo"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Error Correction & Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Error Correction</label>
                    <select
                      name="level"
                      value={config.level}
                      // @ts-ignore
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Logo Size</label>
                     <input
                      type="range"
                      name="logoSize"
                      min="20"
                      max="100"
                      disabled={!config.logoUrl}
                      value={config.logoSize}
                      // @ts-ignore
                      onChange={handleInputChange}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                    />
                  </div>
                </div>

              </div>
            </section>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
                </div>

                <h2 className="text-white font-semibold mb-6 flex items-center justify-center gap-2 relative z-10">
                  <Share2 size={18} /> Live Preview
                </h2>
                
                <div className="bg-white p-2 rounded-2xl shadow-lg inline-block relative z-10">
                  <QRCodeCanvasWrapper config={config} canvasRef={canvasRef} />
                </div>

                <div className="mt-6 text-slate-400 text-sm relative z-10">
                  {config.value ? (
                    <p className="truncate max-w-[280px] mx-auto opacity-80">{config.value}</p>
                  ) : (
                    <p className="italic opacity-60">Enter text to generate QR</p>
                  )}
                </div>
              </div>

              {/* Download Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Download size={16} className="text-indigo-500" /> Download Options
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => downloadQRCode('png')}
                    disabled={!config.value}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Download PNG
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => downloadQRCode('jpg')}
                      disabled={!config.value}
                      className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      JPG
                    </button>
                    <button
                      onClick={() => downloadQRCode('pdf')}
                      disabled={!config.value}
                      className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} QR Pro Generator. Client-side processing only. No data is stored.
          </p>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            @HEMONTU INCORPORATION এর একটি সার্ভিস
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;