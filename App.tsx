import React, { useState, useRef, useCallback } from 'react';
import { QRCodeCanvasWrapper } from './components/QRCodeCanvas';
import { QRConfig, DownloadFormat } from './types';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { 
  Download, 
  Settings, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Share2, 
  Trash2,
  FileCode,
  Layers
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

  // Refs are kept for React lifecycle, but we will also use IDs for safety
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

  const downloadQRCode = useCallback((format: DownloadFormat | 'svg' | 'psd') => {
    // Robust selection strategy: Try Ref first, fallback to ID
    // This fixes "Cannot download" issues if Refs are not attached correctly
    let canvas = canvasRef.current;
    if (!canvas) {
        canvas = document.getElementById('qr-code-canvas-element') as HTMLCanvasElement;
    }

    if (format === 'svg') {
        let svg = svgRef.current;
        if (!svg) {
            svg = document.getElementById('qr-code-svg-element') as unknown as SVGSVGElement;
        }
        
        if (!svg) {
            alert('SVG element not found. Please try again.');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'hemontu-qrcode.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
    }

    // For Raster formats (PNG, JPG, PDF, PSD-Mockup)
    if (!canvas) {
        alert('Canvas element not found. Please try again.');
        return;
    }

    if (format === 'png' || format === 'psd') {
      const link = document.createElement('a');
      link.download = `hemontu-qrcode.${format === 'psd' ? 'png' : 'png'}`; // Browser saves as PNG, compatible with PSD
      // Use maximum quality
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'jpg') {
      const link = document.createElement('a');
      link.download = 'hemontu-qrcode.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [config.size + 40, config.size + 40]
      });
      pdf.addImage(imgData, 'PNG', 20, 20, config.size, config.size);
      pdf.save('hemontu-qrcode.pdf');
    }
  }, [config.size]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Section */}
            <div className="relative group overflow-hidden rounded-xl shadow-lg border-2 border-indigo-100 hover:scale-105 transition-transform duration-300">
               {/* Custom Logo Graphic */}
               <div className="w-12 h-12 bg-gradient-to-tr from-orange-400 to-yellow-300 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute bottom-0 w-full h-2/5 bg-indigo-600 rounded-t-full transform scale-150"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full opacity-50"></div>
                  <span className="relative z-10 text-white font-black text-xl">H</span>
               </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Hemontu Inco.
              </h1>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block -mt-1">QR Generator Service</span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200 shadow-sm">
              v2.0 Pro
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Section */}
            <motion.section 
              initial="hidden" animate="visible" variants={containerVariants}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 border border-white/50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white flex items-center gap-2">
                <Type className="text-indigo-600" size={18} />
                <h2 className="font-bold text-slate-800">1. Enter Content</h2>
              </div>
              <div className="p-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Text or URL
                </label>
                <textarea
                  name="value"
                  value={config.value}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full p-4 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all min-h-[100px] text-slate-700 bg-slate-50 focus:bg-white resize-y font-medium placeholder-slate-400"
                />
              </div>
            </motion.section>

            {/* Customization Section */}
            <motion.section 
              initial="hidden" animate="visible" variants={containerVariants} transition={{ delay: 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 border border-white/50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-pink-50 to-white flex items-center gap-2">
                <Palette className="text-pink-600" size={18} />
                <h2 className="font-bold text-slate-800">2. Customize Style</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2">QR Color</label>
                  <div className="flex items-center gap-2 p-2 border-2 border-slate-100 rounded-xl bg-white focus-within:border-pink-300 transition-colors">
                    <input
                      type="color"
                      name="fgColor"
                      value={config.fgColor}
                      onChange={handleInputChange}
                      className="h-10 w-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      name="fgColor"
                      value={config.fgColor}
                      onChange={handleInputChange}
                      className="flex-1 p-1 bg-transparent border-none outline-none text-sm uppercase font-mono text-slate-600 font-bold"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Background</label>
                  <div className="flex items-center gap-2 p-2 border-2 border-slate-100 rounded-xl bg-white focus-within:border-pink-300 transition-colors">
                    <input
                      type="color"
                      name="bgColor"
                      value={config.bgColor}
                      onChange={handleInputChange}
                      className="h-10 w-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      name="bgColor"
                      value={config.bgColor}
                      onChange={handleInputChange}
                      className="flex-1 p-1 bg-transparent border-none outline-none text-sm uppercase font-mono text-slate-600 font-bold"
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Logo & Settings Section */}
            <motion.section 
              initial="hidden" animate="visible" variants={containerVariants} transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 border border-white/50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white flex items-center gap-2">
                <Settings className="text-purple-600" size={18} />
                <h2 className="font-bold text-slate-800">3. Logo & Settings</h2>
              </div>
              <div className="p-6 space-y-6">
                
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} /> Logo Overlay
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <div className={`relative flex items-center justify-center w-full h-16 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group ${config.logoUrl ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-indigo-400'}`}>
                        <span className={`text-sm font-medium transition-colors ${config.logoUrl ? 'text-indigo-700' : 'text-slate-500 group-hover:text-indigo-600'}`}>
                          {config.logoUrl ? 'Change Logo' : 'Upload Logo (Optional)'}
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </div>
                    </label>
                    {config.logoUrl && (
                      <button
                        onClick={removeLogo}
                        className="h-16 w-16 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all border border-red-100 shadow-sm"
                        title="Remove Logo"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {/* Logo Size */}
                   <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                      <span>Logo Size</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{config.logoSize}px</span>
                    </label>
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

                  {/* Error Correction */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Error Correction</label>
                    <select
                      name="level"
                      value={config.level}
                      // @ts-ignore
                      onChange={handleInputChange}
                      className="w-full p-2.5 border-2 border-slate-100 rounded-xl bg-white focus:border-indigo-500 outline-none text-sm font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30% - Best)</option>
                    </select>
                  </div>
                </div>

              </div>
            </motion.section>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 space-y-6"
            >
              
              {/* Preview Card */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl shadow-indigo-900/20 text-center relative overflow-hidden border border-white/50">
                <h2 className="text-slate-800 font-bold mb-6 flex items-center justify-center gap-2">
                  <Share2 size={18} className="text-indigo-600" /> Live Preview
                </h2>
                
                <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 inline-block">
                  <QRCodeCanvasWrapper config={config} canvasRef={canvasRef} svgRef={svgRef} />
                </div>

                <div className="mt-6 text-slate-500 text-sm min-h-[1.5rem]">
                  {config.value ? (
                    <div className="flex items-center justify-center gap-2 bg-slate-100 py-1.5 px-4 rounded-full max-w-[250px] mx-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="truncate opacity-80 font-medium">{config.value}</p>
                    </div>
                  ) : (
                    <p className="italic opacity-60">Ready to generate...</p>
                  )}
                </div>
              </div>

              {/* Download Actions */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 border border-white/50 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Download size={18} className="text-indigo-600" /> Download Options
                </h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => downloadQRCode('png')}
                    disabled={!config.value}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    Download PNG (Best for Web)
                  </motion.button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => downloadQRCode('jpg')}
                      disabled={!config.value}
                      className="w-full py-2.5 px-4 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-700 rounded-xl font-bold transition-colors disabled:opacity-50 text-sm"
                    >
                      JPG
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => downloadQRCode('pdf')}
                      disabled={!config.value}
                      className="w-full py-2.5 px-4 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-700 rounded-xl font-bold transition-colors disabled:opacity-50 text-sm"
                    >
                      PDF
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => downloadQRCode('svg')}
                      disabled={!config.value}
                      className="w-full py-2.5 px-4 bg-slate-50 border-2 border-slate-100 hover:bg-white text-indigo-700 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 text-sm"
                    >
                      <FileCode size={14} /> SVG (Vector)
                    </motion.button>
                     <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => downloadQRCode('psd')} 
                      disabled={!config.value}
                      className="w-full py-2.5 px-4 bg-slate-50 border-2 border-slate-100 hover:bg-white text-indigo-700 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 text-sm"
                      title="Download High Quality Source (PNG)"
                    >
                      <Layers size={14} /> PSD (Hi-Res)
                    </motion.button>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur border-t border-white/20 py-8 mt-auto text-center relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} Hemontu Inco. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
             <div className="h-px w-12 bg-indigo-200"></div>
             <p className="text-indigo-800 text-sm font-extrabold tracking-wide">
              @HEMONTU INCORPORATION এর একটি সার্ভিস
            </p>
            <div className="h-px w-12 bg-indigo-200"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;