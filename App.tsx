
import React, { useState, useEffect } from 'react';
import { Product, CartItem, PaymentMethod, PaymentMethodType, TransactionResult } from './types.ts';
import { PRODUCTS } from './constants.tsx';
import MatrixBackground from './components/MatrixBackground.tsx';
import SupportChat from './components/SupportChat.tsx';
import SoftwarePortal from './components/SoftwarePortal.tsx';
import { generateQuantumKey } from './services/geminiService.ts';
import { getMasterKeys, isKeyAlreadyUsed } from './services/licenseService.ts';

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('elon_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Cart recovery failed", e);
      return [];
    }
  });
  
  const [vault, setVault] = useState<TransactionResult[]>(() => {
    try {
      const saved = localStorage.getItem('elon_vault');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Vault recovery failed", e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<string>('');
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [runningSoftware, setRunningSoftware] = useState<Product | null>(null);

  // Sync state to storage
  useEffect(() => {
    localStorage.setItem('elon_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('elon_vault', JSON.stringify(vault));
  }, [vault]);

  // Listen for external vault updates (e.g. from licenseService burning a key)
  useEffect(() => {
    const handleVaultUpdate = () => {
      try {
        const updatedVault = JSON.parse(localStorage.getItem('elon_vault') || '[]');
        setVault(updatedVault);
      } catch (e) {
        console.error("Vault sync failed");
      }
    };
    window.addEventListener('vault_updated', handleVaultUpdate);
    return () => window.removeEventListener('vault_updated', handleVaultUpdate);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showNotification(`${product.name} synchronized.`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    const steps = [
      "Establishing Quantum Node...",
      "Generating Secure Key-Pair...",
      "Piercing Dimensional Veil...",
      "Verifying Forest Protocol...",
      "Finalizing License Encryption..."
    ];

    for (const step of steps) {
      setCheckoutStep(step);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const res = await generateQuantumKey(cart);
      setResult(res);
      setVault(prev => [res, ...prev]);
      setCart([]);
    } catch (error) {
      console.error("Checkout error:", error);
      showNotification("Quantum breach detected. Retry protocol.");
    } finally {
      setIsProcessing(false);
      setCheckoutStep('');
    }
  };

  const exportKeysAsPDF = () => {
    // @ts-ignore
    const jsPDFLib = window.jspdf;
    if (!jsPDFLib) {
      showNotification("PDF Core not ready.");
      return;
    }
    const doc = new (jsPDFLib.jsPDF || jsPDFLib)();
    doc.setFontSize(22);
    doc.text("ELON FLASHER VAULT MANIFEST", 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toISOString()}`, 20, 30);
    
    let y = 45;
    vault.forEach((v, i) => {
      doc.text(`${i + 1}. ID: ${v.transactionId} | KEY: ${v.licenseKey}`, 20, y);
      y += 10;
    });

    doc.save(`ElonVault_Manifest_${Date.now()}.pdf`);
    showNotification("Vault Manifest Exported.");
  };

  return (
    <div className="min-h-screen bg-[#000805] text-[#e0ffe0] flex flex-col relative selection:bg-[#0aff0a] selection:text-black">
      <MatrixBackground isProcessing={isProcessing || runningSoftware !== null} />
      
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-[#0aff0a]/20 px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-[#0aff0a] p-2 rounded-lg shadow-[0_0_15px_rgba(10,255,10,0.5)] animate-pulse">
            <i className="fas fa-bolt text-black text-xl"></i>
          </div>
          <div>
            <h1 className="font-orbitron font-black text-xl md:text-2xl tracking-tighter text-[#0aff0a] glow-text leading-none uppercase">ELON FLASHER</h1>
            <p className="text-[8px] md:text-[9px] text-[#00ffaa] font-bold uppercase tracking-[0.3em] mt-1">Quantum Interface</p>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-[#b0ffb0]/60">
          <a href="#products" className="hover:text-[#0aff0a] transition-colors">Software</a>
          <button onClick={() => setIsVaultOpen(true)} className="hover:text-[#0aff0a] transition-colors">Vault</button>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsVaultOpen(true)} className="p-2 text-[#0aff0a]/50 hover:text-[#0aff0a]" title="Vault"><i className="fas fa-key text-lg"></i></button>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-full border border-[#0aff0a]/20 hover:border-[#0aff0a] transition-all">
            <i className="fas fa-shopping-cart text-xl"></i>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#0aff0a] text-black text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(10,255,10,0.5)]">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
          </button>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-20">
        <section className="px-6 py-12 md:py-24 text-center max-w-6xl mx-auto space-y-8">
          <div className="inline-block px-4 py-1 rounded-full border border-[#0aff0a]/30 bg-[#0aff0a]/5 text-[#0aff0a] text-[10px] font-black uppercase tracking-[0.2em]">Next-Gen USDT Bridging Active</div>
          <h2 className="font-orbitron text-4xl md:text-7xl lg:text-8xl font-black leading-none tracking-tighter uppercase">THE DIGITAL <span className="text-[#0aff0a] glow-text">FOREST</span></h2>
          <p className="text-base md:text-xl text-[#b0ffb0] max-w-2xl mx-auto leading-relaxed opacity-90 font-light">Deploy zero-latency liquidity transfers with absolute quantum security.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 mt-12">
            <a href="#products" className="w-full sm:w-auto px-10 py-5 bg-[#0aff0a] text-black font-black uppercase text-sm tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg">Enter Marketplace</a>
            <button onClick={() => setIsVaultOpen(true)} className="w-full sm:w-auto px-10 py-5 border border-[#0aff0a]/40 text-[#0aff0a] font-black uppercase text-sm tracking-widest rounded-xl hover:bg-[#0aff0a]/10 transition-all">Access Vault</button>
          </div>
        </section>

        <section id="products" className="px-6 py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map(product => (
              <div key={product.id} className="group glass-panel rounded-3xl overflow-hidden hover:border-[#0aff0a] transition-all flex flex-col">
                <div className="h-48 bg-black/40 flex items-center justify-center">
                  <i className={`fas fa-${product.icon} text-6xl text-[#0aff0a] glow-text`}></i>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h4 className="font-orbitron font-black text-2xl mb-4 uppercase">{product.name}</h4>
                  <p className="text-sm text-[#b0ffb0]/70 leading-relaxed mb-6">{product.description}</p>
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex flex-col"><span className="text-3xl font-black text-[#0aff0a] tracking-tighter">${product.price}</span></div>
                    <button onClick={() => addToCart(product)} className="bg-[#0aff0a] text-black w-12 h-12 rounded-xl flex items-center justify-center hover:bg-[#00ffaa] transition-all"><i className="fas fa-plus"></i></button>
                  </div>
                  <button onClick={() => setRunningSoftware(product)} className="w-full mt-6 py-4 border border-[#0aff0a] text-[#0aff0a] rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#0aff0a] hover:text-black transition-all"><i className="fas fa-terminal mr-2"></i> Launch Core</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modals */}
      {runningSoftware && <SoftwarePortal product={runningSoftware} onClose={() => setRunningSoftware(null)} onPurchaseRequest={() => { addToCart(runningSoftware); setRunningSoftware(null); setIsCartOpen(true); }} />}
      
      {isCartOpen && (
        <div className="fixed inset-0 z-[101] flex justify-end">
          <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md"></div>
          <div className="w-full md:w-[450px] h-full glass-panel relative z-[102] flex flex-col animate-[slideIn_0.3s_ease-out]">
            <div className="p-8 border-b border-[#0aff0a]/20 flex justify-between items-center">
              <h3 className="font-orbitron font-black text-2xl text-[#0aff0a] tracking-widest uppercase">MANIFEST</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-white hover:text-[#0aff0a]"><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-black/40 border border-[#0aff0a]/10 rounded-xl">
                  <div className="flex-1"><h5 className="font-bold text-[#0aff0a] uppercase text-sm">{item.name}</h5><p className="text-[10px] opacity-60">QTY: {item.quantity} x ${item.price}</p></div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500/50 hover:text-red-500"><i className="fas fa-trash"></i></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-8 border-t border-[#0aff0a]/20 space-y-6">
                <div className="flex justify-between font-orbitron"><span className="text-xs opacity-50 uppercase">Total</span><span className="text-[#0aff0a] font-black text-3xl">${cartTotal}</span></div>
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full bg-[#0aff0a] text-black py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-[#00ffaa]">Initiate Bridge</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div onClick={() => !isProcessing && setIsCheckoutOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
          <div className="glass-panel w-full max-w-xl rounded-[40px] overflow-hidden relative z-[201] p-10">
            {!result ? (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="font-orbitron text-3xl font-black text-[#0aff0a] uppercase">SECURE PORTAL</h3>
                  <p className="text-[10px] text-[#b0ffb0]/40 font-black uppercase tracking-[0.4em]">Final Sync</p>
                </div>
                {!isProcessing ? (
                  <div className="space-y-6">
                    <div className="bg-black/60 p-6 rounded-2xl border border-[#0aff0a]/20 flex justify-between items-center"><span className="font-orbitron text-xs uppercase tracking-widest">Aggregate Total</span><span className="text-[#0aff0a] font-black text-4xl">${cartTotal}</span></div>
                    <div className="flex gap-4">
                      <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-4 border border-[#0aff0a]/20 text-[#0aff0a]/60 rounded-xl font-black uppercase text-xs">Abort</button>
                      <button onClick={handleCheckout} className="flex-[2] py-4 bg-[#0aff0a] text-black rounded-xl font-black uppercase text-xs">Confirm Extraction</button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center space-y-8">
                    <div className="w-16 h-16 border-4 border-[#0aff0a] border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-orbitron text-sm text-[#0aff0a] animate-pulse uppercase tracking-[0.3em]">{checkoutStep}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-8 py-6 animate-fade-in">
                <div className="w-24 h-24 bg-[#0aff0a] text-black rounded-full flex items-center justify-center mx-auto shadow-2xl"><i className="fas fa-check text-4xl"></i></div>
                <h3 className="font-orbitron text-3xl font-black text-[#0aff0a] uppercase">SUCCESS</h3>
                <div className="bg-black/80 p-6 rounded-2xl border border-[#0aff0a]/20 text-left font-mono text-[10px] space-y-4">
                  <p><span className="opacity-40 uppercase block mb-1">TX ID:</span> {result.transactionId}</p>
                  <p><span className="opacity-40 uppercase block mb-1">LICENSE KEY:</span> <span className="text-white text-lg font-black tracking-widest">{result.licenseKey}</span></p>
                  <p className="text-[#0aff0a]/60 italic">{result.quantumVerification}</p>
                </div>
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Note: Licenses are single-use. Copy now.</p>
                <button onClick={() => { setIsCheckoutOpen(false); setResult(null); setIsVaultOpen(true); }} className="w-full py-4 bg-[#0aff0a] text-black rounded-xl font-black uppercase text-sm">Open Vault</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isVaultOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div onClick={() => setIsVaultOpen(false)} className="fixed inset-0 bg-black/95 backdrop-blur-3xl"></div>
          <div className="glass-panel w-full max-w-4xl h-[80vh] rounded-[40px] relative z-[301] flex flex-col overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-[#0aff0a]/20 flex justify-between items-center">
              <h3 className="font-orbitron font-black text-2xl text-[#0aff0a] uppercase">ACTIVE LICENSES</h3>
              <button onClick={() => setIsVaultOpen(false)} className="text-white hover:text-[#0aff0a]"><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              {vault.length === 0 ? (
                <div className="text-center opacity-40 font-mono py-40">NO ACTIVE KEYS FOUND IN QUANTUM FIELD</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vault.map((v, i) => (
                    <div key={i} className="bg-black/60 border border-[#0aff0a]/10 p-6 rounded-2xl space-y-3 group hover:border-[#0aff0a]/40 transition-all">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] opacity-40 font-mono uppercase">Node Verified</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(v.licenseKey); showNotification("Copied to Interface"); }}
                          className="text-[#0aff0a]/40 hover:text-[#0aff0a] transition-colors"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                      <p className="font-mono text-white text-lg tracking-widest break-all">{v.licenseKey}</p>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-[9px] text-[#0aff0a]/60 uppercase font-black">{new Date(v.timestamp).toLocaleDateString()}</p>
                        <span className="text-[8px] bg-[#0aff0a]/10 text-[#0aff0a] px-2 py-1 rounded font-bold uppercase">Ready</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-8 border-t border-[#0aff0a]/20">
              <button onClick={exportKeysAsPDF} className="w-full py-4 bg-[#0aff0a]/10 border border-[#0aff0a] text-[#0aff0a] rounded-xl font-black uppercase text-xs hover:bg-[#0aff0a] hover:text-black transition-all">Export Manifest</button>
            </div>
          </div>
        </div>
      )}

      {notification && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-[#0aff0a] text-black px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl animate-bounce">{notification}</div>}
      <SupportChat />
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
