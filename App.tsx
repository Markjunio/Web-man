
import React, { useState, useEffect } from 'react';
import { Product, CartItem, PaymentMethod, PaymentMethodType, TransactionResult } from './types.ts';
import { PRODUCTS } from './constants.tsx';
import MatrixBackground from './components/MatrixBackground.tsx';
import SupportChat from './components/SupportChat.tsx';
import SoftwarePortal from './components/SoftwarePortal.tsx';
import { generateQuantumKey } from './services/geminiService.ts';
import { getMasterKeys } from './services/licenseService.ts';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(PaymentMethod.USDT);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Software Execution State
  const [runningSoftware, setRunningSoftware] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem('elon_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('elon_vault', JSON.stringify(vault));
  }, [vault]);

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
      await new Promise(r => setTimeout(r, 800));
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
    const keys = getMasterKeys();
    // @ts-ignore
    const jsPDFLib = window.jspdf;
    if (!jsPDFLib) {
      showNotification("PDF Core not ready. Retry.");
      return;
    }
    
    const doc = new jsPDFLib.jsPDF();
    
    doc.setFontSize(22);
    doc.text("ELON FLASHER MASTER KEY MANIFEST", 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toISOString()}`, 20, 30);
    doc.text(`Total Keys: ${keys.length}`, 20, 35);
    
    let y = 45;
    const pageHeight = doc.internal.pageSize.height;
    
    keys.forEach((key, index) => {
      if (y > pageHeight - 10) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${key}`, 20, y);
      y += 6;
    });

    doc.save(`ElonFlasher_MasterKeys_${Date.now()}.pdf`);
    showNotification("PDF Manifest Exported.");
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-[#0aff0a] selection:text-black">
      <MatrixBackground isProcessing={isProcessing || runningSoftware !== null} />
      
      {/* Header - Fixed Banner */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-[#0aff0a]/20 px-6 py-4 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <div className="bg-[#0aff0a] p-2 rounded-lg shadow-[0_0_15px_rgba(10,255,10,0.5)] animate-pulse">
            <i className="fas fa-bolt text-black text-xl"></i>
          </div>
          <div>
            <h1 className="font-orbitron font-black text-2xl tracking-tighter text-[#0aff0a] glow-text leading-none">ELON FLASHER</h1>
            <p className="text-[9px] text-[#00ffaa] font-bold uppercase tracking-[0.3em] mt-1">Quantum Systems Interface</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-[#b0ffb0]/60">
          <a href="#products" className="hover:text-[#0aff0a] transition-colors border-b border-transparent hover:border-[#0aff0a]">Software</a>
          <a href="#features" className="hover:text-[#0aff0a] transition-colors border-b border-transparent hover:border-[#0aff0a]">Protocols</a>
          <button onClick={() => setIsVaultOpen(true)} className="hover:text-[#0aff0a] transition-colors border-b border-transparent hover:border-[#0aff0a]">License Vault</button>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsVaultOpen(true)}
            className="p-2 text-[#0aff0a]/50 hover:text-[#0aff0a] transition-colors"
            title="License Vault"
          >
            <i className="fas fa-key text-lg"></i>
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative group p-2 rounded-full border border-[#0aff0a]/20 hover:border-[#0aff0a] hover:bg-[#0aff0a]/10 transition-all"
          >
            <i className="fas fa-shopping-cart text-xl group-hover:scale-110 transition-transform"></i>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#0aff0a] text-black text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-[0_0_10px_rgba(10,255,10,0.5)]">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Container with Top Padding for Fixed Header */}
      <main className="pt-24">
        {/* Hero Section */}
        <section className="px-6 pb-16 text-center relative max-w-6xl mx-auto">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0aff0a]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 rounded-full border border-[#0aff0a]/30 bg-[#0aff0a]/5 text-[#0aff0a] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Next-Gen USDT Bridging is Here
            </div>
            <h2 className="font-orbitron text-5xl md:text-8xl font-black leading-none tracking-tighter">
              THE DIGITAL <span className="text-[#0aff0a] glow-text">FOREST</span>
            </h2>
            <p className="text-lg md:text-2xl text-[#b0ffb0] max-w-3xl mx-auto leading-relaxed opacity-90 font-light">
              Transcend legacy blockchains with high-frequency quantum tunneling. Deploy instantaneous liquidity flashes with zero detection latency.
            </p>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-12">
              <a href="#products" className="px-10 py-5 bg-[#0aff0a] text-black font-black uppercase text-sm tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(10,255,10,0.4)]">
                Access Core Suite
              </a>
              <button onClick={() => setIsVaultOpen(true)} className="px-10 py-5 border border-[#0aff0a]/40 text-[#0aff0a] font-black uppercase text-sm tracking-widest rounded-xl hover:bg-[#0aff0a]/10 transition-all">
                Manage Licenses
              </button>
            </div>
          </div>
        </section>

        {/* Stats Terminal */}
        <section className="px-6 py-12 max-w-7xl mx-auto">
          <div className="glass-panel rounded-2xl p-6 border-[#0aff0a]/30 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Network Load', val: '4.12 TB/s', status: 'Optimal' },
              { label: 'Active Tunnels', val: '1,092', status: 'Stable' },
              { label: 'Average Latency', val: '0.003ms', status: 'Minimal' },
              { label: 'Encrypted Volume', val: '$8.2B+', status: 'Growing' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1 border-l-2 border-[#0aff0a]/20 pl-4">
                <p className="text-[10px] text-[#80a080] uppercase tracking-widest">{stat.label}</p>
                <h5 className="font-orbitron font-black text-xl">{stat.val}</h5>
                <p className="text-[9px] text-[#0aff0a] font-bold">{stat.status}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section id="products" className="px-6 py-24 max-w-7xl mx-auto">
          <div className="mb-16">
            <h3 className="font-orbitron text-3xl font-black text-[#0aff0a] text-center tracking-tighter">OPERATIONAL SOFTWARE</h3>
            <p className="text-center text-[#80a080] text-sm mt-2 font-mono uppercase">Select your encryption tier for immediate deployment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map(product => (
              <div key={product.id} className="group glass-panel rounded-3xl overflow-hidden hover:border-[#0aff0a] transition-all duration-700 relative flex flex-col border-[#0aff0a]/10">
                {product.badge && (
                  <div className="absolute top-6 right-6 z-10 bg-[#0aff0a] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-[0_0_20px_rgba(10,255,10,0.5)]">
                    {product.badge}
                  </div>
                )}
                
                <div className="h-56 bg-black/40 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <div className="w-24 h-24 rounded-full bg-[#0aff0a]/5 flex items-center justify-center border border-[#0aff0a]/10 group-hover:scale-110 transition-transform duration-700">
                    <i className={`fas fa-${product.icon} text-5xl text-[#0aff0a] glow-text`}></i>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col space-y-6">
                  <div>
                    <h4 className="font-orbitron font-black text-2xl mb-2 group-hover:text-[#0aff0a] transition-colors">{product.name}</h4>
                    <div className="flex gap-2">
                      <span className="text-[9px] bg-[#0aff0a]/10 text-[#0aff0a] px-2 py-1 rounded-md font-black tracking-widest uppercase">Verified Tier {product.id}</span>
                      <span className="text-[9px] bg-white/5 text-white/40 px-2 py-1 rounded-md font-black tracking-widest uppercase">Build 0x{Math.random().toString(16).slice(2, 6)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[#b0ffb0]/70 leading-relaxed min-h-[60px]">
                    {product.description}
                  </p>

                  <div className="space-y-3">
                    {product.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 text-[11px] text-[#b0ffb0]">
                        <i className="fas fa-microchip text-[#0aff0a] mt-1"></i>
                        <span className="opacity-80 font-medium">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black p-4 rounded-xl font-mono text-[10px] text-[#00ffaa]/50 border border-[#0aff0a]/10 group-hover:border-[#0aff0a]/40 transition-colors">
                     <span className="text-white/20 mr-2">$</span> {product.command}
                  </div>

                  <div className="flex flex-col gap-4 pt-4 border-t border-[#0aff0a]/10 mt-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-[#0aff0a] tracking-tighter">${product.price}</span>
                            {product.oldPrice && (
                            <span className="text-xs text-red-500/50 line-through font-bold">${product.oldPrice}</span>
                            )}
                        </div>
                        <button 
                            onClick={() => addToCart(product)}
                            className="bg-[#0aff0a] text-black w-14 h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-[#00ffaa] hover:rotate-6 active:scale-90 transition-all shadow-[0_5px_15px_rgba(10,255,10,0.3)] flex items-center justify-center"
                        >
                            <i className="fas fa-plus text-xl"></i>
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => setRunningSoftware(product)}
                        className="w-full py-4 border border-[#0aff0a] text-[#0aff0a] rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#0aff0a] hover:text-black transition-all flex items-center justify-center gap-3 group"
                    >
                        <i className="fas fa-play-circle group-hover:animate-pulse"></i> Run Software
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Software Portal Modal */}
      {runningSoftware && (
        <SoftwarePortal 
          product={runningSoftware} 
          onClose={() => setRunningSoftware(null)}
          onPurchaseRequest={() => {
            addToCart(runningSoftware);
            setRunningSoftware(null);
            setIsCartOpen(true);
          }}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"></div>
          <div className="fixed top-0 right-0 w-full md:w-[480px] h-full glass-panel z-[101] shadow-2xl border-l-2 border-[#0aff0a] flex flex-col animate-[slideIn_0.3s_ease-out]">
            <div className="p-8 border-b border-[#0aff0a]/20 flex justify-between items-center bg-black/40">
              <div className="space-y-1">
                <h3 className="font-orbitron font-black text-2xl text-[#0aff0a] tracking-widest">MANIFEST</h3>
                <p className="text-[9px] text-[#80a080] font-bold uppercase tracking-widest">Pending Quantum Synch</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-[#0aff0a] hover:text-[#0aff0a] transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-black/20">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-40">
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#0aff0a]/20 flex items-center justify-center animate-spin-slow">
                    <i className="fas fa-shopping-cart text-4xl"></i>
                  </div>
                  <p className="font-orbitron text-xs font-black tracking-widest">NO ASSETS DETECTED</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-6 p-5 rounded-2xl bg-black/60 border border-[#0aff0a]/10 relative group hover:border-[#0aff0a]/40 transition-colors">
                    <div className="w-20 h-20 bg-[#0aff0a]/10 rounded-xl flex items-center justify-center border border-[#0aff0a]/20">
                      <i className={`fas fa-${item.icon} text-2xl text-[#0aff0a]`}></i>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h5 className="font-orbitron font-black text-[#0aff0a] text-sm uppercase tracking-wider">{item.name}</h5>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500/30 hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                      <p className="text-[10px] text-[#b0ffb0]/60 font-mono tracking-widest uppercase">Qty: {item.quantity} | Unit: ${item.price}</p>
                      <div className="text-right">
                        <span className="text-[#0aff0a] font-black text-lg font-mono">${item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-10 bg-black/60 border-t border-[#0aff0a]/20 space-y-8">
                <div className="flex justify-between items-center font-orbitron">
                  <span className="text-xs text-[#80a080] tracking-widest uppercase">Aggregated Total</span>
                  <span className="text-[#0aff0a] font-black text-4xl tracking-tighter glow-text">${cartTotal}</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                  className="w-full bg-[#0aff0a] text-black py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-[#00ffaa] shadow-[0_10px_30px_rgba(10,255,10,0.3)] transition-all group"
                >
                  Initiate Secure Bridge <i className="fas fa-arrow-right ml-2 group-hover:translate-x-2 transition-transform"></i>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div onClick={() => !isProcessing && setIsCheckoutOpen(false)} className="fixed inset-0 bg-black/98 backdrop-blur-2xl"></div>
          <div className="glass-panel w-full max-w-2xl rounded-[40px] overflow-hidden relative z-[201] border-2 border-[#0aff0a]/40 shadow-[0_0_100px_rgba(10,255,10,0.1)]">
            {!result ? (
              <div className="p-10 space-y-10">
                <div className="text-center space-y-3">
                  <div className="inline-block p-4 bg-[#0aff0a]/10 rounded-3xl border border-[#0aff0a]/20 mb-4 animate-bounce">
                    <i className="fas fa-lock text-[#0aff0a] text-3xl"></i>
                  </div>
                  <h3 className="font-orbitron text-3xl font-black text-[#0aff0a] tracking-tight uppercase">SECURE PORTAL</h3>
                  <p className="text-[10px] text-[#b0ffb0]/40 font-black uppercase tracking-[0.4em]">Final Verification Step</p>
                </div>

                {!isProcessing ? (
                  <>
                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-[#0aff0a] uppercase tracking-widest text-center">Select Bridge Network</p>
                      <div className="grid grid-cols-2 gap-4">
                        {(Object.keys(PaymentMethod) as (keyof typeof PaymentMethod)[]).map(key => {
                          const m = PaymentMethod[key];
                          return (
                            <button
                              key={m}
                              onClick={() => setPaymentMethod(m)}
                              className={`p-5 rounded-3xl border-2 flex items-center gap-4 transition-all group ${paymentMethod === m ? 'border-[#0aff0a] bg-[#0aff0a]/10 text-[#0aff0a]' : 'border-white/5 text-white/20 hover:border-white/20'}`}
                            >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${paymentMethod === m ? 'bg-[#0aff0a] text-black shadow-[0_0_15px_rgba(10,255,10,0.4)]' : 'bg-white/5'}`}>
                                <i className={`fas fa-${m === 'USDT' ? 'dollar-sign' : m === 'BTC' ? 'bitcoin' : m === 'ETH' ? 'ethereum' : 'infinity'}`}></i>
                              </div>
                              <span className="font-orbitron font-black tracking-widest uppercase text-xs">{m}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-black/80 p-8 rounded-3xl border border-[#0aff0a]/10 space-y-6">
                      <div className="flex justify-between text-[11px] font-mono opacity-50 uppercase tracking-widest">
                        <span>Items Prepared:</span>
                        <span>{cart.length}</span>
                      </div>
                      <div className="flex justify-between items-center font-orbitron">
                        <span className="text-sm tracking-widest uppercase">Total Extraction:</span>
                        <span className="text-[#0aff0a] font-black text-4xl glow-text tracking-tighter">${cartTotal}</span>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <button 
                        onClick={() => setIsCheckoutOpen(false)}
                        className="flex-1 py-5 border-2 border-[#0aff0a]/20 text-[#0aff0a]/60 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-[#0aff0a] hover:text-[#0aff0a] transition-all"
                      >
                        Abort
                      </button>
                      <button 
                        onClick={handleCheckout}
                        className="flex-[2] py-5 bg-[#0aff0a] text-black rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-[#00ffaa] shadow-[0_10px_30px_rgba(10,255,10,0.4)] transition-all"
                      >
                        Confirm Sync
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center space-y-12 animate-pulse">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 border-4 border-[#0aff0a]/10 rounded-full"></div>
                      <div className="absolute inset-0 border-t-4 border-[#0aff0a] rounded-full animate-spin"></div>
                      <div className="absolute inset-4 border-4 border-[#0aff0a]/5 rounded-full animate-reverse-spin"></div>
                    </div>
                    <div className="text-center space-y-4">
                      <h4 className="font-orbitron text-xl font-black text-[#0aff0a] tracking-widest uppercase">{checkoutStep}</h4>
                      <p className="text-[10px] text-[#80a080] font-mono animate-pulse">ESTABLISHING DIMENSIONAL TUNNEL...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center space-y-10 animate-[fadeIn_0.5s_ease-out]">
                <div className="w-32 h-32 bg-[#0aff0a] text-black rounded-[40px] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(10,255,10,0.6)] rotate-12">
                  <i className="fas fa-check text-5xl"></i>
                </div>
                <div className="space-y-3">
                  <h3 className="font-orbitron text-4xl font-black text-[#0aff0a] tracking-tighter uppercase">BRIDGE SUCCESSFUL</h3>
                  <p className="text-sm text-[#b0ffb0]/60 font-medium">Assets successfully flashed into your quantum node.</p>
                </div>

                <div className="bg-black/90 p-8 rounded-[30px] border border-[#0aff0a]/20 text-left space-y-6 font-mono text-[11px]">
                  <div>
                    <span className="text-[#80a080] uppercase block mb-2 tracking-[0.2em] font-black">Transaction Hash</span>
                    <div className="bg-black border border-[#0aff0a]/10 p-4 rounded-xl text-[#0aff0a] flex justify-between items-center group">
                      <span className="truncate mr-4">{result.transactionId}</span>
                      <button onClick={() => { navigator.clipboard.writeText(result.transactionId); showNotification("Hash Copied"); }} className="text-xs hover:text-white transition-colors">
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#80a080] uppercase block mb-2 tracking-[0.2em] font-black">Quantum License Key</span>
                    <div className="bg-black border border-[#0aff0a]/10 p-4 rounded-xl text-[#0aff0a] flex justify-between items-center">
                      <span className="truncate mr-4">{result.licenseKey}</span>
                      <button onClick={() => { navigator.clipboard.writeText(result.licenseKey); showNotification("Key Copied"); }} className="text-xs hover:text-white transition-colors">
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                  <div className="p-5 bg-[#0aff0a]/5 rounded-2xl border border-[#0aff0a]/10 italic text-[#00ffaa] leading-relaxed opacity-80">
                     <i className="fas fa-info-circle mr-2 opacity-50"></i>
                     {result.quantumVerification}
                  </div>
                </div>

                <button 
                  onClick={() => { setIsCheckoutOpen(false); setResult(null); }}
                  className="w-full py-6 bg-[#0aff0a] text-black rounded-3xl font-black uppercase text-sm tracking-[0.3em] hover:bg-[#00ffaa] shadow-xl"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* License Vault */}
      {isVaultOpen && (
        <>
          <div onClick={() => setIsVaultOpen(false)} className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[300]"></div>
          <div className="fixed inset-6 md:inset-20 z-[301] glass-panel rounded-[40px] border-2 border-[#0aff0a]/30 shadow-[0_0_100px_rgba(10,255,10,0.1)] flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
            <div className="p-10 border-b border-[#0aff0a]/20 bg-black/40 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-[#0aff0a] text-black flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(10,255,10,0.5)]">
                  <i className="fas fa-vault"></i>
                </div>
                <div>
                  <h3 className="font-orbitron font-black text-3xl text-[#0aff0a] tracking-tight uppercase">LICENSE VAULT</h3>
                  <p className="text-[10px] text-[#80a080] font-black uppercase tracking-[0.4em] mt-1">Authorized Access Only</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                    onClick={exportKeysAsPDF}
                    className="px-6 py-2 bg-[#0aff0a]/10 border border-[#0aff0a] text-[#0aff0a] font-black uppercase text-[10px] rounded-full hover:bg-[#0aff0a] hover:text-black transition-all"
                >
                    Download Master Keys (PDF)
                </button>
                <button onClick={() => setIsVaultOpen(false)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-[#0aff0a] hover:text-[#0aff0a] transition-all">
                    <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6">
              {vault.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                  <i className="fas fa-folder-open text-8xl mb-4"></i>
                  <h4 className="font-orbitron text-xl font-black uppercase tracking-[0.3em]">Vault Empty</h4>
                  <p className="text-sm max-w-xs font-mono">No cryptographic signatures detected on your local node.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {vault.map((v, i) => (
                    <div key={i} className="bg-black/40 border border-[#0aff0a]/10 rounded-[30px] p-8 space-y-6 hover:border-[#0aff0a]/40 transition-all group">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#0aff0a]/10 flex items-center justify-center text-[#0aff0a]">
                            <i className="fas fa-key"></i>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#80a080] uppercase font-bold tracking-widest block">Signature ID</span>
                            <span className="text-xs font-mono text-[#0aff0a]">{v.transactionId}</span>
                          </div>
                        </div>
                        <span className="text-[9px] px-3 py-1 bg-[#0aff0a] text-black rounded-full font-black uppercase tracking-widest">Active</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] text-[#80a080] uppercase font-bold tracking-widest block">Deployment License</span>
                        <div className="bg-black border border-white/5 p-4 rounded-xl font-mono text-[11px] text-[#0aff0a] break-all group-hover:border-[#0aff0a]/30 transition-all">
                          {v.licenseKey}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-white/30 uppercase tracking-widest pt-4 border-t border-white/5">
                        <span>Issued: {new Date(v.timestamp).toLocaleDateString()}</span>
                        <button className="text-[#0aff0a] hover:underline font-black">Download Keyfile</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Features Section */}
      <section id="features" className="px-6 py-24 bg-[#0a1a0a]/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: 'shield-halved', title: 'Forest Security', desc: 'Military-grade quantum tunneling.' },
            { icon: 'bolt', title: 'Instant Flashing', desc: 'Latency optimized transaction nodes.' },
            { icon: 'globe', title: 'Global Access', desc: 'Connect from any dimensional plane.' },
            { icon: 'headset', title: '24/7 Support', desc: 'Quantum AI assistance around the clock.' }
          ].map((f, i) => (
            <div key={i} className="p-8 glass-panel rounded-2xl border-none space-y-4">
              <i className={`fas fa-${f.icon} text-4xl text-[#0aff0a]`}></i>
              <h5 className="font-orbitron font-bold text-[#0aff0a]">{f.title}</h5>
              <p className="text-xs text-[#b0ffb0]/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="p-16 border-t border-[#0aff0a]/20 glass-panel mt-32 bg-black/60 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          <div className="space-y-6 col-span-1 md:col-span-1">
            <div className="flex items-center gap-3">
              <i className="fas fa-bolt text-[#0aff0a] text-2xl"></i>
              <h4 className="font-orbitron font-black text-2xl text-[#0aff0a] tracking-tighter">ELON FLASHER</h4>
            </div>
            <p className="text-sm opacity-60 leading-relaxed max-w-xs font-medium">The world's most advanced USDT flash technology. Built for the era of quantum finance. Enter the forest and claim your liquidity.</p>
            <div className="flex gap-4">
              {['telegram', 'discord', 'x-twitter', 'github'].map(icon => (
                <a key={icon} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl hover:bg-[#0aff0a] hover:text-black transition-all">
                  <i className={`fab fa-${icon}`}></i>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h6 className="font-orbitron font-black mb-8 text-[#0aff0a] uppercase text-xs tracking-[0.3em]">Core Navigation</h6>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest opacity-40">
              <li><a href="#products" className="hover:text-[#0aff0a] transition-colors">Marketplace</a></li>
              <li><button onClick={() => setIsVaultOpen(true)} className="hover:text-[#0aff0a] transition-colors">License Vault</button></li>
              <li><a href="#" className="hover:text-[#0aff0a] transition-colors">Network Status</a></li>
              <li><a href="#" className="hover:text-[#0aff0a] transition-colors">Quantum Bridge</a></li>
            </ul>
          </div>
          
          <div>
            <h6 className="font-orbitron font-black mb-8 text-[#0aff0a] uppercase text-xs tracking-[0.3em]">Operational Support</h6>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest opacity-40">
              <li><a href="#" className="hover:text-[#0aff0a] transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-[#0aff0a] transition-colors">Setup Protocol</a></li>
              <li><a href="#" className="hover:text-[#0aff0a] transition-colors">API References</a></li>
              <li><a href="#" className="hover:text-[#0aff0a] transition-colors">Ethics Manifest</a></li>
            </ul>
          </div>

          <div>
            <h6 className="font-orbitron font-black mb-8 text-[#0aff0a] uppercase text-xs tracking-[0.3em]">Backend Interface</h6>
            <div className="bg-black/80 border border-[#0aff0a]/20 p-6 rounded-3xl space-y-4 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="opacity-40 uppercase">Node ID:</span>
                <span className="text-[#0aff0a] font-bold">X7-ALPHA-91</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-40 uppercase">Latency:</span>
                <span className="text-[#0aff0a] font-bold">0.003ms</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-40 uppercase">Firewall:</span>
                <span className="text-[#0aff0a] font-bold">ACTIVE</span>
              </div>
              <div className="pt-2 border-t border-white/5">
                <p className="text-[#0aff0a] animate-pulse uppercase font-black text-[9px] tracking-widest text-center">Connection Secured</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-24 pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] opacity-30 font-bold uppercase tracking-[0.5em]">
            © 2024 ELON FLASHER QUANTUM CORE. ALL SIGNATURES ENCRYPTED.
          </p>
        </div>
      </footer>

      {/* Notifications */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-[#0aff0a] text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(10,255,10,0.5)] animate-[bounce_1s_infinite]">
          <i className="fas fa-check-circle mr-2"></i>
          {notification}
        </div>
      )}

      {/* Support Chat */}
      <SupportChat />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        .animate-reverse-spin {
          animation: spin 3s linear infinite reverse;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
