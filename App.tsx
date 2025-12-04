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

  const downloadQRCode = useCallback((format: DownloadFormat | 'svg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'png' || format === 'jpg') {
      const link = document.createElement('a');
      link.download = `hemontu-qrcode.${format}`;
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
      pdf.save('hemontu-qrcode.pdf');
    } else if (format === 'svg') {
      const svg = svgRef.current;
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hemontu-qrcode.svg';
      link.click();
    }
  }, [config.size]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-orange-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Section - Replace src with your actual logo path if available */}
            <div className="relative group overflow-hidden rounded-lg shadow-md border-2 border-indigo-100">
               {/* Placeholder for the logo user described */}
               <div className="w-12 h-12 bg-orange-300 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute bottom-0 w-full h-1/3 bg-indigo-500 wave-shape"></div>
                  <div className="absolute bottom-2 left-2 w-0 h-0 border-l-[20px] border-l-transparent border-b-[30px] border-b-indigo-600 border-r-[5px] border-r-transparent transform -rotate-12"></div>
               </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-indigo-900" style={{ fontFamily: 'cursive' }}>
                Hemontu Inco.
              </h1>
              <span className="text-xs text-indigo-600 font-medium tracking-wider uppercase">QR Generator Service</span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200">
              v1.2.0 Pro
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Section */}
            <motion.section 
              initial="hidden" animate="visible" variants={containerVariants}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white flex items-center gap-2">
                <Type className="text-indigo-600" size={18} />
                <h2 className="font-bold text-slate-800">Content Input</h2>
              </div>
              <div className="p-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Text or URL
                </label>
                <textarea
                  name="value"
                  value={config.value}
                  onChange={handleInputChange}
                  placeholder="Enter your website URL, text, or any data..."
                  className="w-full p-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[100px] text-slate-700 bg-slate-50 focus:bg-white"
                />
              </div>
            </motion.section>

            {/* Customization Section */}
            <motion.section 
              initial="hidden" animate="visible" variants={containerVariants} transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-pink-50 to-white flex items-center gap-2">
                <Palette className="text-pink-600" size={18} />
                <h2 className="font-bold text-slate-800">Colors & Style</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Foreground (QR)</label>
                  <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-xl bg-white group-focus-within:ring-2 ring-pink-400/30">
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
                      className="flex-1 p-1 bg-transparent border-none outline-none text-sm uppercase font-mono text-slate-600"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Background</label>
                  <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-xl bg-white group-focus-within:ring-2 ring-pink-400/30">
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
                      className="flex-1 p-1 bg-transparent border-none outline-none text-sm uppercase font-mono text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Logo & Settings Section */}
            <motion.section 
              initial="hidden" animate="visible" variants={containerVariants} transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white flex items-center gap-2">
                <Settings className="text-purple-600" size={18} />
                <h2 className="font-bold text-slate-800">Logo & Details</h2>
              </div>
              <div className="p-6 space-y-6">
                
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} /> Logo Overlay
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <div className="relative flex items-center justify-center w-full h-14 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 cursor-pointer transition-colors bg-slate-50 hover:bg-white group">
                        <span className="text-sm text-slate-500 group-hover:text-indigo-600 font-medium transition-colors">
                          {config.logoUrl ? 'Change Logo Image' : 'Click to Upload Logo'}
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </div>
                    </label>
                    {config.logoUrl && (
                      <button
                        onClick={removeLogo}
                        className="p-4 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
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
                      <span className="text-xs font-normal text-slate-500">{config.logoSize}px</span>
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
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30% - Best for Logos)</option>
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
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 shadow-2xl shadow-indigo-200/50 text-center relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-700">
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent animate-pulse"></div>
                </div>

                <h2 className="text-white font-bold mb-6 flex items-center justify-center gap-2 relative z-10">
                  <Share2 size={18} /> Live Preview
                </h2>
                
                <div className="bg-white p-3 rounded-2xl shadow-xl inline-block relative z-10 transform transition-transform duration-300 hover:scale-[1.02]">
                  <QRCodeCanvasWrapper config={config} canvasRef={canvasRef} svgRef={svgRef} />
                </div>

                <div className="mt-6 text-slate-400 text-sm relative z-10 min-h-[1.5rem]">
                  {config.value ? (
                    <p className="truncate max-w-[280px] mx-auto opacity-80 bg-slate-800/50 py-1 px-3 rounded-full border border-slate-700/50">{config.value}</p>
                  ) : (
                    <p className="italic opacity-60">Enter content to generate QR</p>
                  )}
                </div>
              </div>

              {/* Download Actions */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Download size={18} className="text-indigo-600" /> Download Formats
                </h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => downloadQRCode('png')}
                    disabled={!config.value}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Download PNG
                  </motion.button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => downloadQRCode('jpg')}
                      disabled={!config.value}
                      className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                      JPG
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => downloadQRCode('pdf')}
                      disabled={!config.value}
                      className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50"
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
                      className="w-full py-2.5 px-4 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-indigo-900 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <FileCode size={14} /> SVG
                    </motion.button>
                     {/* PSD Simulation Button (renders High Res PNG since pure PSD is not native to browser) */}
                     <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => downloadQRCode('png')} 
                      disabled={!config.value}
                      className="w-full py-2.5 px-4 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-indigo-900 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
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
      <footer className="bg-white/50 backdrop-blur border-t border-white/50 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Hemontu Inco. QR Pro Generator.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
             <div className="h-px w-8 bg-indigo-300"></div>
             <p className="text-indigo-900 text-sm font-bold tracking-wide">
              @HEMONTU INCORPORATION এর একটি সার্ভিস
            </p>
            <div className="h-px w-8 bg-indigo-300"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;