import React, { useState, useEffect } from 'react';
import { Product, CartItem, TransactionResult } from './types.ts';
import { PRODUCTS } from './constants.tsx';
import MatrixBackground from './components/MatrixBackground.tsx';
import { generateQuantumKey } from './services/geminiService.ts';
import { sendTelegramNotification } from './services/telegramService.ts';
import SoftwarePortal from './components/SoftwarePortal.tsx';

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('elon_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  
  const [vault, setVault] = useState<TransactionResult[]>(() => {
    try {
      const saved = localStorage.getItem('elon_vault');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [runningSoftware, setRunningSoftware] = useState<Product | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  // Checkout Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PayPal' | 'Crypto' | 'Bank Transfer'>('Crypto');

  useEffect(() => {
    localStorage.setItem('elon_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('elon_vault', JSON.stringify(vault));
  }, [vault]);

  useEffect(() => {
    const handleVaultUpdate = () => {
      try {
        const updatedVault = JSON.parse(localStorage.getItem('elon_vault') || '[]');
        setVault(updatedVault);
      } catch (e) { console.error("Vault sync failed"); }
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
    showNotification(`${product.name} added to cart.`);
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
    if (!userName || !userEmail || !userPhone) {
      showNotification("Please fill in all fields.");
      return;
    }

    setIsProcessing(true);
    const steps = [
      "Connecting to network...",
      "Saving your information...",
      "Starting secure payment...",
      "Almost finished..."
    ];

    for (const step of steps) {
      setCheckoutStep(step);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      await sendTelegramNotification({
        type: 'CHECKOUT',
        name: userName,
        email: userEmail,
        phone: userPhone,
        paymentMethod: paymentMethod,
        total: cartTotal.toString(),
        items: cart.map(i => `${i.name} (x${i.quantity})`).join(", ")
      });

      setResult({ status: 'PENDING' });
      setCart([]);
    } catch (error) {
      showNotification("Error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
      setCheckoutStep('');
    }
  };

  const exportKeysAsPDF = async () => {
    showNotification("Downloading keys...");
    if (!(window as any).jspdf) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      document.body.appendChild(script);
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("ELON FLASH KEYS LIST", 20, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toISOString()}`, 20, 30);
    let y = 45;
    vault.forEach((v, i) => {
      doc.text(`${i + 1}. Order ID: ${v.transactionId} | KEY: ${v.licenseKey}`, 20, y);
      y += 10;
    });
    doc.save(`My_Flash_Keys_${Date.now()}.pdf`);
    showNotification("Keys Downloaded.");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#e0ffe0] flex flex-col relative selection:bg-[#0aff0a] selection:text-black">
      <MatrixBackground isProcessing={isProcessing || runningSoftware !== null} />
      
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-[#0aff0a]/10 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-[#0aff0a] p-1.5 md:p-2 rounded-lg shadow-[0_0_15px_rgba(10,255,10,0.5)] animate-pulse">
            <i className="fas fa-bolt text-black text-base md:text-xl"></i>
          </div>
          <div>
            <h1 className="font-orbitron font-black text-lg md:text-2xl tracking-tighter neon-pulsate leading-none uppercase">
              ELON FLASHER
            </h1>
            <p className="text-[7px] md:text-[9px] text-[#00ffaa] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mt-0.5 md:mt-1">
              Quantum Transfer Interface v5.0
            </p>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-[#b0ffb0]/40">
          <a href="#products" className="hover:text-[#0aff0a] transition-colors">Software</a>
          <button onClick={() => setIsVaultOpen(true)} className="hover:text-[#0aff0a] transition-colors">Vault</button>
          <a href="https://t.me/Elonflash" target="_blank" className="hover:text-[#0aff0a] transition-colors">Telegram</a>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setIsVaultOpen(true)} className="p-2 text-[#0aff0a]/30 hover:text-[#0aff0a]" title="My Keys"><i className="fas fa-key text-base md:text-lg"></i></button>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-full border border-[#0aff0a]/10 hover:border-[#0aff0a] transition-all">
            <i className="fas fa-shopping-cart text-lg md:text-xl text-[#0aff0a]"></i>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#0aff0a] text-black text-[8px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(10,255,10,0.5)]">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
          </button>
        </div>
      </header>

      <main className="flex-1 pt-20 md:pt-24 pb-20">
        <section className="px-4 md:px-6 py-12 md:py-24 text-center max-w-6xl mx-auto space-y-6 md:space-y-8">
          <div className="inline-block px-3 py-1 rounded-full border border-[#0aff0a]/20 bg-[#0aff0a]/5 text-[#0aff0a] text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Network: Secure & Active</div>
          <h2 className="font-orbitron text-4xl md:text-7xl lg:text-8xl font-black leading-none tracking-tighter uppercase">
            ULTIMATE <span className="text-[#0aff0a] neon-pulsate">FLASH</span> ENGINE
          </h2>
          <p className="text-sm md:text-xl text-[#b0ffb0]/60 max-w-2xl mx-auto leading-relaxed font-light px-4 md:px-0">
            High-performance USDT transfer technology powered by advanced network protocols. 
            Send crypto instantly through secure dimensional tunnels.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 mt-8 md:mt-12 w-full max-w-xs md:max-w-none mx-auto">
            <a href="#products" className="w-full sm:w-auto px-10 py-5 bg-[#0aff0a] text-black font-black uppercase text-xs md:text-sm tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(10,255,10,0.4)] text-center">Get Access</a>
            <button onClick={() => setIsVaultOpen(true)} className="w-full sm:w-auto px-10 py-5 border border-[#0aff0a]/20 text-[#0aff0a] font-black uppercase text-xs md:text-sm tracking-widest rounded-2xl hover:bg-[#0aff0a]/10 transition-all">My Purchases</button>
          </div>
        </section>

        <section id="products" className="px-4 md:px-6 py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {PRODUCTS.map(product => (
              <div key={product.id} className="group glass-panel rounded-[2.5rem] overflow-hidden hover:border-[#0aff0a]/30 transition-all flex flex-col border border-[#0aff0a]/5">
                <div className="h-40 md:h-48 bg-black/80 flex flex-col items-center justify-center relative border-b border-[#0aff0a]/5">
                  <i className={`fas fa-${product.icon} text-5xl md:text-6xl text-[#0aff0a] glow-text group-hover:scale-110 transition-transform duration-500`}></i>
                  {product.badge && (
                    <span className="absolute top-6 right-6 bg-[#0aff0a] text-black text-[7px] md:text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(10,255,10,0.5)]">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute bottom-4 left-6 text-[8px] md:text-[10px] text-[#0aff0a]/20 font-mono">X-PROTOTYPE v{product.version}</span>
                </div>
                <div className="p-8 md:p-10 flex-1 flex flex-col">
                  <h4 className="font-orbitron font-black text-xl md:text-2xl mb-4 uppercase tracking-tighter text-[#0aff0a]">{product.name}</h4>
                  <p className="text-xs md:text-sm text-[#b0ffb0]/50 leading-relaxed mb-6 h-auto md:h-12 overflow-hidden">{product.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <i className="fas fa-check text-[8px] md:text-[10px] text-[#0aff0a] mt-1.5"></i>
                        <span className="text-[10px] md:text-[11px] text-[#b0ffb0]/70 font-mono tracking-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        {product.oldPrice && <span className="text-[10px] md:text-xs text-red-500/40 line-through font-bold mb-1">${product.oldPrice}</span>}
                        <span className="text-3xl md:text-4xl font-black text-[#0aff0a] tracking-tighter">${product.price}</span>
                      </div>
                      <div className="flex gap-3">
                         <button 
                          onClick={() => setSelectedProductDetails(product)}
                          className="w-12 h-12 rounded-2xl border border-[#0aff0a]/10 text-[#0aff0a]/50 flex items-center justify-center hover:bg-[#0aff0a]/5 hover:text-[#0aff0a] transition-all"
                        >
                          <i className="fas fa-microchip text-lg"></i>
                        </button>
                        <button 
                          onClick={() => addToCart(product)} 
                          className="bg-[#0aff0a] text-black w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#00ffaa] hover:scale-105 transition-all shadow-xl"
                        >
                          <i className="fas fa-cart-plus text-lg"></i>
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setRunningSoftware(product)} 
                      className="w-full py-4 bg-black/40 border border-[#0aff0a]/30 text-[#0aff0a] rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#0aff0a] hover:text-black transition-all flex items-center justify-center gap-3 group"
                    >
                      <i className="fas fa-terminal text-sm group-hover:animate-pulse"></i> BOOT SOFTWARE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="py-20 border-t border-[#0aff0a]/5 text-center px-4">
          <div className="max-w-2xl mx-auto space-y-4">
              <h5 className="font-orbitron font-black text-[#0aff0a] text-sm tracking-[0.5em] uppercase">ELON FLASHER CORP</h5>
              <p className="text-[9px] font-mono text-[#b0ffb0]/30 uppercase leading-relaxed tracking-widest">
                Automated Transaction Management Systems • Secure P2P Gateways • Quantum Pathfinding Protocols • All Rights Reserved © 2025
              </p>
          </div>
      </footer>

      {/* Product Details Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-4">
          <div onClick={() => setSelectedProductDetails(null)} className="fixed inset-0 bg-black/98 backdrop-blur-3xl"></div>
          <div className="glass-panel w-full h-full md:h-auto md:max-w-3xl md:rounded-[40px] relative z-[501] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row animate-fade-in border-0 md:border-2 border-[#0aff0a]/20">
            <div className="md:w-1/3 bg-[#050505] p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#0aff0a]/10">
              <i className={`fas fa-${selectedProductDetails.icon} text-7xl md:text-8xl text-[#0aff0a] glow-text mb-8`}></i>
              <h3 className="font-orbitron font-black text-2xl text-[#0aff0a] text-center uppercase tracking-tighter leading-none">{selectedProductDetails.name}</h3>
              <p className="text-[9px] font-mono text-[#0aff0a]/30 mt-6 uppercase tracking-[0.3em]">SECURE_BUILD_{selectedProductDetails.version}</p>
            </div>
            <div className="flex-1 p-8 md:p-14 space-y-8 flex flex-col bg-black/40">
              <div className="space-y-5">
                <h4 className="font-orbitron font-black text-[10px] text-[#0aff0a]/60 uppercase tracking-[0.4em] flex items-center gap-3">
                  <i className="fas fa-layer-group text-xs"></i> Quantum Specs
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedProductDetails.specs?.map((spec, i) => (
                    <div key={i} className="bg-black/80 border border-[#0aff0a]/5 p-4 rounded-2xl group hover:border-[#0aff0a]/20 transition-all">
                      <p className="text-[8px] uppercase font-bold text-[#0aff0a]/30 mb-1">{spec.label}</p>
                      <p className="text-xs md:text-sm font-mono text-white tracking-widest">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-orbitron font-black text-[10px] text-[#0aff0a]/60 uppercase tracking-[0.4em] flex items-center gap-3">
                  <i className="fas fa-file-code text-xs"></i> Software Manifest
                </h4>
                <p className="text-[11px] md:text-xs text-[#b0ffb0]/50 leading-relaxed font-mono">
                  {selectedProductDetails.description} Engineered for maximum throughput and end-to-end security. 
                  Optimized for TRC20 and ERC20 networks.
                </p>
              </div>

              <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-4">
                 <button 
                  onClick={() => setSelectedProductDetails(null)}
                  className="flex-1 py-4 border border-[#0aff0a]/10 text-white/20 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white hover:border-[#0aff0a]/30 transition-all order-2 sm:order-1"
                >
                  Close
                </button>
                <button 
                  onClick={() => { addToCart(selectedProductDetails); setSelectedProductDetails(null); }}
                  className="flex-[2] py-4 bg-[#0aff0a] text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#00ffaa] shadow-[0_0_40px_rgba(10,255,10,0.3)] order-1 sm:order-2"
                >
                  Unlock Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {runningSoftware && (
        <SoftwarePortal 
          product={runningSoftware} 
          onClose={() => setRunningSoftware(null)} 
          onPurchaseRequest={() => { addToCart(runningSoftware); setRunningSoftware(null); setIsCartOpen(true); }} 
        />
      )}
      
      {isCartOpen && (
        <div className="fixed inset-0 z-[101] flex justify-end">
          <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-md"></div>
          <div className="w-full md:w-[480px] h-full glass-panel relative z-[102] flex flex-col animate-[slideIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="p-8 md:p-10 border-b border-[#0aff0a]/10 flex justify-between items-center bg-[#050505]">
              <div>
                <h3 className="font-orbitron font-black text-xl text-[#0aff0a] tracking-[0.3em] uppercase">CART</h3>
                <p className="text-[9px] font-mono text-[#0aff0a]/30 uppercase tracking-[0.2em] mt-1">Ready for fulfillment</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-white/20 hover:text-white p-3"><i className="fas fa-times text-2xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-5 p-6 bg-black/80 border border-[#0aff0a]/5 rounded-[2rem] hover:border-[#0aff0a]/20 transition-all">
                  <div className="w-12 h-12 bg-[#0aff0a]/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i className={`fas fa-${item.icon} text-[#0aff0a] text-xl`}></i>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-orbitron font-bold text-[#0aff0a] uppercase text-xs tracking-wider">{item.name}</h5>
                    <p className="text-[10px] font-mono text-[#b0ffb0]/40 mt-1 uppercase">QTY: {item.quantity} • UNIT PRICE: ${item.price}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500/20 hover:text-red-500 p-2"><i className="fas fa-trash-alt text-lg"></i></button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-40 flex flex-col items-center justify-center space-y-4">
                  <i className="fas fa-shopping-basket text-4xl text-[#0aff0a]/5"></i>
                  <p className="opacity-30 text-[10px] font-mono uppercase tracking-[0.4em]">Cart is empty</p>
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-10 border-t border-[#0aff0a]/10 bg-[#050505] space-y-8">
                <div className="flex justify-between items-center"><span className="text-[11px] font-mono text-[#b0ffb0]/40 uppercase tracking-[0.2em]">Total Investment</span><span className="text-[#0aff0a] font-black text-4xl tracking-tighter">${cartTotal}</span></div>
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full bg-[#0aff0a] text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-[#00ffaa] shadow-[0_10px_40px_rgba(10,255,10,0.3)] transition-all">Initiate Purchase</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4">
          <div onClick={() => !isProcessing && setIsCheckoutOpen(false)} className="fixed inset-0 bg-black/98 backdrop-blur-3xl"></div>
          <div className="glass-panel w-full h-full md:h-auto md:max-w-2xl md:rounded-[40px] overflow-hidden relative z-[201] p-8 md:p-14 flex flex-col justify-center border-0 md:border-2 border-[#0aff0a]/20">
            {!result ? (
              <div className="space-y-10 overflow-y-auto max-h-[90vh] py-4">
                <div className="text-center space-y-3">
                  <h3 className="font-orbitron text-2xl md:text-3xl font-black text-[#0aff0a] uppercase tracking-tighter">SECURE ORDER</h3>
                  <p className="text-[9px] text-[#0aff0a]/40 font-black uppercase tracking-[0.6em]">Encrypted Channel Active</p>
                </div>
                {!isProcessing ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-[#0aff0a]/30 ml-2 tracking-widest">Full Name</label>
                        <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="IDENTIFY USER" className="w-full bg-black/80 border border-[#0aff0a]/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-[#0aff0a]/50 transition-all font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-[#0aff0a]/30 ml-2 tracking-widest">Email Address</label>
                        <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="SECURE_MAILBOX" className="w-full bg-black/80 border border-[#0aff0a]/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-[#0aff0a]/50 transition-all font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-[#0aff0a]/30 ml-2 tracking-widest">Phone Number</label>
                        <input type="tel" value={userPhone} onChange={e => setPhone(e.target.value)} placeholder="+00.0000.0000" className="w-full bg-black/80 border border-[#0aff0a]/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-[#0aff0a]/50 transition-all font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-[#0aff0a]/30 ml-2 tracking-widest">Payment Method</label>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full bg-black/80 border border-[#0aff0a]/10 rounded-2xl px-6 py-4 text-xs text-[#0aff0a] outline-none focus:border-[#0aff0a]/50 transition-all appearance-none font-black tracking-widest">
                          <option value="Crypto">BITCOIN / USDT</option>
                          <option value="PayPal">PAYPAL SECURE</option>
                          <option value="Bank Transfer">DIRECT BANK</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-[#0aff0a]/5 p-8 rounded-[2.5rem] border border-[#0aff0a]/10 flex justify-between items-center"><span className="font-orbitron text-[11px] uppercase tracking-[0.4em] text-[#0aff0a]/50">Total</span><span className="text-[#0aff0a] font-black text-4xl tracking-tighter">${cartTotal}</span></div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-5 border border-[#0aff0a]/10 text-[#0aff0a]/30 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-red-500/30 hover:text-red-500 transition-all order-2 sm:order-1">Abort</button>
                      <button onClick={handleCheckout} className="flex-[2] py-5 bg-[#0aff0a] text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#00ffaa] shadow-[0_10px_40px_rgba(10,255,10,0.3)] transition-all order-1 sm:order-2">Verify & Commit</button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center space-y-10">
                    <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-[#0aff0a]/10 rounded-full"></div>
                        <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 border-4 border-[#0aff0a] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="space-y-2 text-center">
                        <p className="font-orbitron text-xs md:text-sm text-[#0aff0a] animate-pulse uppercase tracking-[0.5em]">{checkoutStep}</p>
                        <p className="text-[9px] font-mono text-[#0aff0a]/20 uppercase tracking-widest">dimensional encryption in progress</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-10 py-10 animate-fade-in max-w-md mx-auto">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#0aff0a] text-black rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(10,255,10,0.3)]"><i className="fas fa-satellite text-4xl md:text-5xl"></i></div>
                <div className="space-y-6">
                  <h3 className="font-orbitron text-3xl font-black text-[#0aff0a] uppercase tracking-tighter leading-none">TRANSMISSION RECEIVED</h3>
                  <div className="bg-[#0aff0a]/5 border border-[#0aff0a]/10 p-8 rounded-[2.5rem] space-y-6">
                    <p className="text-[11px] md:text-xs text-[#b0ffb0]/60 leading-relaxed font-mono uppercase tracking-widest">
                      Our elite support squad will intercept your request and contact you via <span className="text-[#0aff0a] font-black">secure mail/line</span> to finalize the data exchange.
                    </p>
                    <div className="h-px bg-[#0aff0a]/10 w-full"></div>
                    <p className="text-[9px] font-black uppercase text-[#0aff0a]/40 tracking-[0.5em]">Direct Uplink</p>
                    <a href="https://t.me/Elonflash" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4 bg-black/40 border border-[#0aff0a]/30 text-[#0aff0a] py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#0aff0a] hover:text-black transition-all shadow-xl">
                      <i className="fab fa-telegram-plane text-xl"></i> Telegram Direct
                    </a>
                  </div>
                </div>
                <button onClick={() => { setIsCheckoutOpen(false); setResult(null); }} className="text-[#0aff0a]/20 hover:text-[#0aff0a] text-[10px] font-black uppercase tracking-[0.5em] transition-all">Terminate Link</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isVaultOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-4">
          <div onClick={() => setIsVaultOpen(false)} className="fixed inset-0 bg-black/98 backdrop-blur-3xl"></div>
          <div className="glass-panel w-full h-full md:h-[85vh] md:max-w-5xl md:rounded-[50px] relative z-[301] flex flex-col overflow-hidden animate-fade-in border-0 md:border-2 border-[#0aff0a]/20">
            <div className="p-8 md:p-12 border-b border-[#0aff0a]/10 flex justify-between items-center bg-[#050505]">
              <div>
                <h3 className="font-orbitron font-black text-2xl text-[#0aff0a] uppercase tracking-tighter">SECURE VAULT</h3>
                <p className="text-[9px] font-mono text-[#0aff0a]/30 uppercase tracking-[0.4em] mt-2">Personal License Repository</p>
              </div>
              <button onClick={() => setIsVaultOpen(false)} className="text-white/20 hover:text-white p-3"><i className="fas fa-times text-2xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-14 bg-black/20">
              {vault.length === 0 ? (
                <div className="text-center opacity-10 font-mono py-60 flex flex-col items-center justify-center">
                    <i className="fas fa-lock text-6xl mb-6"></i>
                    <p className="text-lg uppercase tracking-[1em]">Vault Locked</p>
                    <p className="text-[10px] mt-4 tracking-widest">No keys registered on this node</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  {vault.map((v, i) => (
                    <div key={i} className="bg-black/60 border border-[#0aff0a]/5 p-8 rounded-[2.5rem] space-y-6 group hover:border-[#0aff0a]/30 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                          <i className="fas fa-key text-6xl"></i>
                      </div>
                      <div className="flex justify-between items-center relative z-10">
                        <span className="text-[9px] text-[#0aff0a]/50 font-mono uppercase tracking-[0.3em] flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#0aff0a] shadow-[0_0_8px_#0aff0a]"></div> Status: Verified
                        </span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(v.licenseKey); showNotification("Key Copied"); }}
                          className="text-[#0aff0a]/20 hover:text-[#0aff0a] transition-all p-2"
                        >
                          <i className="fas fa-copy text-lg"></i>
                        </button>
                      </div>
                      <p className="font-mono text-white text-lg md:text-xl tracking-[0.3em] break-all border-l-2 border-[#0aff0a]/30 pl-6 py-2">{v.licenseKey}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-[#0aff0a]/5">
                        <p className="text-[9px] text-[#b0ffb0]/30 uppercase font-black tracking-widest">{new Date(v.timestamp).toLocaleDateString()}</p>
                        <span className="text-[8px] bg-[#0aff0a]/5 text-[#0aff0a] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-[#0aff0a]/20">Authorized</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-10 md:p-14 border-t border-[#0aff0a]/10 bg-[#050505]">
              <button onClick={exportKeysAsPDF} className="w-full py-5 bg-[#0aff0a]/5 border border-[#0aff0a]/20 text-[#0aff0a] rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] hover:bg-[#0aff0a] hover:text-black transition-all shadow-xl">Export License Manifest (PDF)</button>
            </div>
          </div>
        </div>
      )}

      {notification && <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[1000] bg-[#0aff0a] text-black px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(10,255,10,0.5)] animate-bounce">{notification}</div>}
      
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes progress { 
          0% { transform: translateX(-100%); } 
          100% { transform: translateX(100%); } 
        }
        select option {
          background: #000000;
          color: #0aff0a;
          padding: 10px;
        }
        @media (max-width: 640px) {
          .glass-panel {
            backdrop-filter: blur(12px);
          }
        }
      `}</style>
    </div>
  );
};

export default App;