import React, { useState, useEffect } from 'react';
import { Product, CartItem, TransactionResult } from './types.ts';
import { PRODUCTS } from './constants.tsx';
import MatrixBackground from './components/MatrixBackground.tsx';
import { generateQuantumKey } from './services/geminiService.ts';
import { sendTelegramNotification } from './services/telegramService.ts';
import SupportChat from './components/SupportChat.tsx';
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
    <div className="min-h-screen bg-[#000805] text-[#e0ffe0] flex flex-col relative selection:bg-[#0aff0a] selection:text-black">
      <MatrixBackground isProcessing={isProcessing || runningSoftware !== null} />
      
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-[#0aff0a]/20 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-[#0aff0a] p-1.5 md:p-2 rounded-lg shadow-[0_0_15px_rgba(10,255,10,0.5)] animate-pulse">
            <i className="fas fa-bolt text-black text-base md:text-xl"></i>
          </div>
          <div>
            <h1 className="font-orbitron font-black text-lg md:text-2xl tracking-tighter neon-pulsate leading-none uppercase">
              ELON FLASHER
            </h1>
            <p className="text-[7px] md:text-[9px] text-[#00ffaa] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mt-0.5 md:mt-1">
              The Best Crypto Transfer Tools
            </p>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-[#b0ffb0]/60">
          <a href="#products" className="hover:text-[#0aff0a] transition-colors">Products</a>
          <button onClick={() => setIsVaultOpen(true)} className="hover:text-[#0aff0a] transition-colors">My Keys</button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setIsVaultOpen(true)} className="p-2 text-[#0aff0a]/50 hover:text-[#0aff0a]" title="My Keys"><i className="fas fa-key text-base md:text-lg"></i></button>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-full border border-[#0aff0a]/20 hover:border-[#0aff0a] transition-all">
            <i className="fas fa-shopping-cart text-lg md:text-xl"></i>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#0aff0a] text-black text-[8px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(10,255,10,0.5)]">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
          </button>
        </div>
      </header>

      <main className="flex-1 pt-20 md:pt-24 pb-20">
        <section className="px-4 md:px-6 py-12 md:py-24 text-center max-w-6xl mx-auto space-y-6 md:space-y-8">
          <div className="inline-block px-3 py-1 rounded-full border border-[#0aff0a]/30 bg-[#0aff0a]/5 text-[#0aff0a] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Secure Crypto Tools Active</div>
          <h2 className="font-orbitron text-4xl md:text-7xl lg:text-8xl font-black leading-none tracking-tighter uppercase">FASTER <span className="text-[#0aff0a] neon-pulsate">TRANSFERS</span></h2>
          <p className="text-sm md:text-xl text-[#b0ffb0] max-w-2xl mx-auto leading-relaxed opacity-90 font-light px-4 md:px-0">Send crypto quickly and safely with our advanced software technology.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 mt-8 md:mt-12 w-full max-w-xs md:max-w-none mx-auto">
            <a href="#products" className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-[#0aff0a] text-black font-black uppercase text-xs md:text-sm tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg text-center">See Products</a>
            <button onClick={() => setIsVaultOpen(true)} className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 border border-[#0aff0a]/40 text-[#0aff0a] font-black uppercase text-xs md:text-sm tracking-widest rounded-xl hover:bg-[#0aff0a]/10 transition-all">View My Keys</button>
          </div>
        </section>

        <section id="products" className="px-4 md:px-6 py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {PRODUCTS.map(product => (
              <div key={product.id} className="group glass-panel rounded-3xl overflow-hidden hover:border-[#0aff0a] transition-all flex flex-col border border-[#0aff0a]/10">
                <div className="h-40 md:h-48 bg-black/40 flex flex-col items-center justify-center relative">
                  <i className={`fas fa-${product.icon} text-5xl md:text-6xl text-[#0aff0a] glow-text`}></i>
                  {product.badge && (
                    <span className="absolute top-4 right-4 bg-[#0aff0a] text-black text-[7px] md:text-[8px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-tighter shadow-[0_0_15px_rgba(10,255,10,0.5)]">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute bottom-4 left-6 text-[8px] md:text-[10px] text-[#0aff0a]/40 font-mono">v{product.version}</span>
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h4 className="font-orbitron font-black text-xl md:text-2xl mb-3 md:mb-4 uppercase leading-none">{product.name}</h4>
                  <p className="text-xs md:text-sm text-[#b0ffb0]/70 leading-relaxed mb-6 h-auto md:h-12 overflow-hidden">{product.description}</p>
                  
                  <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <i className="fas fa-bolt text-[9px] md:text-[10px] text-[#0aff0a] mt-1"></i>
                        <span className="text-[10px] md:text-[11px] text-[#b0ffb0]/80 font-mono">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end mb-2 md:mb-4">
                      <div className="flex flex-col">
                        {product.oldPrice && <span className="text-[10px] md:text-xs text-red-500/60 line-through font-bold">${product.oldPrice}</span>}
                        <span className="text-2xl md:text-3xl font-black text-[#0aff0a] tracking-tighter">${product.price}</span>
                      </div>
                      <div className="flex gap-2">
                         <button 
                          onClick={() => setSelectedProductDetails(product)}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-[#0aff0a]/20 text-[#0aff0a] flex items-center justify-center hover:bg-[#0aff0a]/10 transition-all"
                          title="View Details"
                        >
                          <i className="fas fa-info-circle text-sm md:text-base"></i>
                        </button>
                        <button 
                          onClick={() => addToCart(product)} 
                          className="bg-[#0aff0a] text-black w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-[#00ffaa] hover:scale-105 transition-all shadow-lg"
                        >
                          <i className="fas fa-shopping-cart text-sm md:text-base"></i>
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setRunningSoftware(product)} 
                      className="w-full py-3 md:py-4 border border-[#0aff0a] text-[#0aff0a] rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] hover:bg-[#0aff0a] hover:text-black transition-all flex items-center justify-center gap-2 group"
                    >
                      <i className="fas fa-play text-xs group-hover:animate-pulse"></i> Open Software
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Product Details Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-4">
          <div onClick={() => setSelectedProductDetails(null)} className="fixed inset-0 bg-black/95 backdrop-blur-3xl"></div>
          <div className="glass-panel w-full h-full md:h-auto md:max-w-3xl md:rounded-[40px] relative z-[501] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row animate-fade-in border-0 md:border-2 border-[#0aff0a]/30">
            <div className="md:w-1/3 bg-[#0a1a0a] p-8 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#0aff0a]/20">
              <i className={`fas fa-${selectedProductDetails.icon} text-6xl md:text-8xl text-[#0aff0a] glow-text mb-6 md:mb-8`}></i>
              <h3 className="font-orbitron font-black text-xl md:text-2xl text-[#0aff0a] text-center uppercase tracking-tighter">{selectedProductDetails.name}</h3>
              <p className="text-[9px] md:text-[10px] font-mono text-[#0aff0a]/50 mt-4 uppercase">Version {selectedProductDetails.version}</p>
            </div>
            <div className="flex-1 p-6 md:p-12 space-y-6 md:space-y-8 flex flex-col">
              <div className="space-y-4">
                <h4 className="font-orbitron font-black text-[10px] text-[#0aff0a] uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-microchip text-xs"></i> Specifications
                </h4>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {selectedProductDetails.specs?.map((spec, i) => (
                    <div key={i} className="bg-black/40 border border-[#0aff0a]/10 p-3 md:p-4 rounded-xl md:rounded-2xl group hover:border-[#0aff0a]/40 transition-all">
                      <p className="text-[8px] md:text-[9px] uppercase font-bold text-[#0aff0a]/40 mb-1">{spec.label}</p>
                      <p className="text-xs md:text-sm font-mono text-white tracking-wider md:tracking-widest">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <h4 className="font-orbitron font-black text-[10px] text-[#0aff0a] uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-info text-xs"></i> Description
                </h4>
                <p className="text-[11px] md:text-xs text-[#b0ffb0]/70 leading-relaxed font-mono">
                  {selectedProductDetails.description} This software uses our latest technology to help you send crypto safely through our secure networks.
                </p>
              </div>

              <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-3 md:gap-4">
                 <button 
                  onClick={() => setSelectedProductDetails(null)}
                  className="flex-1 py-3 md:py-4 border border-white/10 text-white/40 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:text-white transition-all order-2 sm:order-1"
                >
                  Close
                </button>
                <button 
                  onClick={() => { addToCart(selectedProductDetails); setSelectedProductDetails(null); }}
                  className="flex-[2] py-3 md:py-4 bg-[#0aff0a] text-black rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-[#00ffaa] shadow-xl order-1 sm:order-2"
                >
                  Buy This Software
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
          <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md"></div>
          <div className="w-full md:w-[450px] h-full glass-panel relative z-[102] flex flex-col animate-[slideIn_0.3s_ease-out]">
            <div className="p-6 md:p-8 border-b border-[#0aff0a]/20 flex justify-between items-center">
              <h3 className="font-orbitron font-black text-xl md:text-2xl text-[#0aff0a] tracking-widest uppercase">SHOPPING CART</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-white hover:text-[#0aff0a] p-2"><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-black/40 border border-[#0aff0a]/10 rounded-xl">
                  <div className="flex-1"><h5 className="font-bold text-[#0aff0a] uppercase text-xs md:text-sm">{item.name}</h5><p className="text-[9px] md:text-[10px] opacity-60">QTY: {item.quantity} x ${item.price}</p></div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500/50 hover:text-red-500 p-2"><i className="fas fa-trash"></i></button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-20 opacity-30 text-xs font-mono uppercase tracking-widest">Cart is empty</div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 md:p-8 border-t border-[#0aff0a]/20 space-y-6">
                <div className="flex justify-between font-orbitron"><span className="text-[10px] md:text-xs opacity-50 uppercase">Total Cost</span><span className="text-[#0aff0a] font-black text-2xl md:text-3xl">${cartTotal}</span></div>
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full bg-[#0aff0a] text-black py-4 rounded-xl font-black uppercase text-xs md:text-sm tracking-widest hover:bg-[#00ffaa]">Pay Now</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4">
          <div onClick={() => !isProcessing && setIsCheckoutOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
          <div className="glass-panel w-full h-full md:h-auto md:max-w-2xl md:rounded-[40px] overflow-hidden relative z-[201] p-6 md:p-10 flex flex-col justify-center">
            {!result ? (
              <div className="space-y-6 md:space-y-8 overflow-y-auto max-h-[90vh]">
                <div className="text-center space-y-2">
                  <h3 className="font-orbitron text-2xl md:text-3xl font-black text-[#0aff0a] uppercase">SECURE PAYMENT</h3>
                  <p className="text-[8px] md:text-[10px] text-[#b0ffb0]/40 font-black uppercase tracking-[0.4em]">Verify Your Details</p>
                </div>
                {!isProcessing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] md:text-[9px] uppercase font-bold text-[#0aff0a]/50 ml-1">Full Name</label>
                        <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Enter your name" className="w-full bg-black/60 border border-[#0aff0a]/20 rounded-xl px-4 py-3 text-xs md:text-sm text-white outline-none focus:border-[#0aff0a] transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] md:text-[9px] uppercase font-bold text-[#0aff0a]/50 ml-1">Email Address</label>
                        <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="example@email.com" className="w-full bg-black/60 border border-[#0aff0a]/20 rounded-xl px-4 py-3 text-xs md:text-sm text-white outline-none focus:border-[#0aff0a] transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] md:text-[9px] uppercase font-bold text-[#0aff0a]/50 ml-1">Phone Number</label>
                        <input type="tel" value={userPhone} onChange={e => setPhone(e.target.value)} placeholder="+00 000 000 000" className="w-full bg-black/60 border border-[#0aff0a]/20 rounded-xl px-4 py-3 text-xs md:text-sm text-white outline-none focus:border-[#0aff0a] transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] md:text-[9px] uppercase font-bold text-[#0aff0a]/50 ml-1">Payment Method</label>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full bg-black/60 border border-[#0aff0a]/20 rounded-xl px-4 py-3 text-xs md:text-sm text-white outline-none focus:border-[#0aff0a] transition-all appearance-none">
                          <option value="Crypto">Crypto (Recommended)</option>
                          <option value="PayPal">PayPal</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-black/60 p-5 md:p-6 rounded-2xl border border-[#0aff0a]/20 flex justify-between items-center"><span className="font-orbitron text-[10px] md:text-xs uppercase tracking-widest">Total Amount</span><span className="text-[#0aff0a] font-black text-3xl md:text-4xl">${cartTotal}</span></div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                      <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-4 border border-[#0aff0a]/20 text-[#0aff0a]/60 rounded-xl font-black uppercase text-[10px] md:text-xs order-2 sm:order-1 hover:border-red-500 hover:text-red-500 transition-all">Cancel</button>
                      <button onClick={handleCheckout} className="flex-[2] py-4 bg-[#0aff0a] text-black rounded-xl font-black uppercase text-[10px] md:text-xs order-1 sm:order-2 hover:bg-[#00ffaa] shadow-lg transition-all">Complete Payment</button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 md:py-20 flex flex-col items-center justify-center space-y-8">
                    <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-[#0aff0a] border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-orbitron text-[10px] md:text-sm text-[#0aff0a] animate-pulse uppercase tracking-[0.3em] text-center">{checkoutStep}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-6 md:space-y-8 py-6 animate-fade-in max-w-md mx-auto">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-[#0aff0a] text-black rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(10,255,10,0.4)]"><i className="fas fa-check text-3xl md:text-4xl"></i></div>
                <div className="space-y-4">
                  <h3 className="font-orbitron text-2xl md:text-3xl font-black text-[#0aff0a] uppercase tracking-tighter">ORDER RECEIVED</h3>
                  <div className="bg-[#0aff0a]/5 border border-[#0aff0a]/20 p-6 rounded-3xl space-y-4">
                    <p className="text-[11px] md:text-xs text-[#b0ffb0] leading-relaxed opacity-90 font-mono">
                      Our support team will contact you by <span className="text-[#0aff0a] font-black">email or phone</span> shortly to complete your payment.
                    </p>
                    <div className="h-px bg-[#0aff0a]/10 w-full"></div>
                    <p className="text-[10px] md:text-xs font-black uppercase text-[#0aff0a]/70">Contact Us Directly</p>
                    <a href="https://t.me/your_telegram_handle" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-[#0aff0a] text-black py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                      <i className="fab fa-telegram text-lg"></i> Send Telegram Message
                    </a>
                  </div>
                </div>
                <button onClick={() => { setIsCheckoutOpen(false); setResult(null); }} className="text-[#0aff0a]/40 hover:text-[#0aff0a] text-[8px] md:text-[10px] font-black uppercase tracking-widest">Back to Products</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isVaultOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-4">
          <div onClick={() => setIsVaultOpen(false)} className="fixed inset-0 bg-black/95 backdrop-blur-3xl"></div>
          <div className="glass-panel w-full h-full md:h-[80vh] md:max-w-4xl md:rounded-[40px] relative z-[301] flex flex-col overflow-hidden animate-fade-in">
            <div className="p-6 md:p-8 border-b border-[#0aff0a]/20 flex justify-between items-center">
              <h3 className="font-orbitron font-black text-xl md:text-2xl text-[#0aff0a] uppercase">MY PURCHASED KEYS</h3>
              <button onClick={() => setIsVaultOpen(false)} className="text-white hover:text-[#0aff0a] p-2"><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              {vault.length === 0 ? (
                <div className="text-center opacity-40 font-mono py-40 text-xs uppercase tracking-widest">NO KEYS FOUND</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {vault.map((v, i) => (
                    <div key={i} className="bg-black/60 border border-[#0aff0a]/10 p-5 md:p-6 rounded-2xl space-y-3 group hover:border-[#0aff0a]/40 transition-all">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] md:text-[10px] opacity-40 font-mono uppercase">Status: Verified</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(v.licenseKey); showNotification("Key Copied"); }}
                          className="text-[#0aff0a]/40 hover:text-[#0aff0a] transition-colors p-1"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                      <p className="font-mono text-white text-base md:text-lg tracking-wider md:tracking-widest break-all">{v.licenseKey}</p>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-[8px] md:text-[9px] text-[#0aff0a]/60 uppercase font-black">{new Date(v.timestamp).toLocaleDateString()}</p>
                        <span className="text-[7px] md:text-[8px] bg-[#0aff0a]/10 text-[#0aff0a] px-2 py-1 rounded font-bold uppercase">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 md:p-8 border-t border-[#0aff0a]/20">
              <button onClick={exportKeysAsPDF} className="w-full py-4 bg-[#0aff0a]/10 border border-[#0aff0a] text-[#0aff0a] rounded-xl font-black uppercase text-[10px] md:text-xs hover:bg-[#0aff0a] hover:text-black transition-all">Download Key List</button>
            </div>
          </div>
        </div>
      )}

      {notification && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-[#0aff0a] text-black px-6 md:px-8 py-2 md:py-3 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-widest shadow-2xl animate-bounce">{notification}</div>}
      
      <SupportChat />

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @media (max-width: 640px) {
          .glass-panel {
            backdrop-filter: blur(8px);
          }
        }
        select option {
          background: #000805;
          color: #0aff0a;
        }
      `}</style>
    </div>
  );
};

export default App;