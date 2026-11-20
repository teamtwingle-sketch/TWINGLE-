import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { Check, Upload, QrCode as QrIcon, Gift, Sparkles } from 'lucide-react';
import QRCode from 'react-qr-code';

const Subscription = () => {
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [screenshot, setScreenshot] = useState(null);
    const [status, setStatus] = useState(null);

    // Coupon / Redeem Code State
    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [couponSuccess, setCouponSuccess] = useState(null);

    useEffect(() => {
        fetchPlans();
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try { 
            const res = await api.get('/payments/status/'); 
            setStatus(res.data); 
        } catch (e) { }
    };

    const fetchPlans = async () => {
        try {
            const res = await api.get('/plans/');
            setPlans(res.data);
            if (res.data.length > 0) setSelectedPlan(res.data[0].id);
        } catch (err) {
            toast.error('Failed to load plans');
        }
    };

    const handleApplyCoupon = async () => {
        const cleanCode = couponCode.trim();
        if (!cleanCode) {
            return toast.error('Please enter a coupon / redeem code');
        }

        setApplyingCoupon(true);
        try {
            const res = await api.post('/payments/redeem-coupon/', { code: cleanCode });
            toast.success(res.data.message || '🎉 90-Day Platinum Premium unlocked!');
            setCouponSuccess(res.data);
            setCouponCode('');
            await fetchStatus();
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to redeem coupon code';
            toast.error(errorMsg);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleSubmit = async () => {
        if (!screenshot) return toast.error('Please upload payment screenshot');

        const formData = new FormData();
        formData.append('screenshot', screenshot);
        formData.append('plan', selectedPlan);

        try {
            await api.post('/payments/submit/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Payment submitted for verification!');
            setScreenshot(null);
            fetchStatus();
        } catch (err) {
            toast.error('Failed to submit payment');
        }
    };

    const downloadQR = () => {
        const svg = document.getElementById("qr-code-svg");
        if (!svg) return;

        try {
            const scale = 2;
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            img.onload = () => {
                const padding = 20 * scale;
                const headerHeight = 40 * scale;

                canvas.width = (img.width * scale) + (padding * 2);
                canvas.height = (img.height * scale) + (padding * 2) + headerHeight;

                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const plan = plans.find(p => p.id === selectedPlan);
                if (plan) {
                    ctx.font = `bold ${16 * scale}px sans-serif`;
                    ctx.fillStyle = "black";
                    ctx.textAlign = "center";
                    ctx.fillText(`Twingle ${plan.name} Plan`, canvas.width / 2, 30 * scale);
                }

                ctx.drawImage(img, padding, headerHeight + padding, img.width * scale, img.height * scale);

                const jpgUrl = canvas.toDataURL("image/jpeg", 1.0);

                const link = document.createElement("a");
                link.href = jpgUrl;
                link.download = `twingle-${plan?.name.toLowerCase()}-qr.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
        } catch (e) { console.error("Download failed", e); }
    };

    useEffect(() => {
        if (status?.is_premium || status?.payment_status === 'pending') return;

        if (selectedPlan && plans.length > 0) {
            const timer = setTimeout(() => {
                downloadQR();
                toast.info("QR Code downloaded!");
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [selectedPlan, status]);

    return (
        <div className="p-6 pb-24 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Get Premium</h1>
                {status?.is_premium ? (
                    <div className="bg-green-100 p-4 rounded-xl text-green-800 mt-2 border border-green-200">
                        <h3 className="font-bold flex items-center gap-2">
                            <Sparkles size={18} className="text-green-700" /> Active Subscription
                        </h3>
                        <p className="text-sm mt-1">
                            Expires in {status.days_left} days ({new Date(status.expiry).toLocaleDateString()})
                        </p>
                    </div>
                ) : status?.payment_status === 'pending' ? (
                    <div className="bg-yellow-50 p-6 rounded-2xl text-yellow-800 mt-4 border-2 border-yellow-200 shadow-sm animate-pulse">
                        <h3 className="font-bold flex items-center gap-2 text-lg">Verification Pending...</h3>
                        <p className="text-sm mt-1">We are reviewing your payment for <span className="font-bold">{status.plan_name || 'Premium'}</span>.</p>
                        <p className="text-xs mt-2 opacity-75">This usually takes 10-30 minutes.</p>
                    </div>
                ) : (
                    <p className="text-slate-500">Unlock all features and find your match faster</p>
                )}
            </div>

            {/* Redeem Coupon / Promo Code Card */}
            <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50 p-6 rounded-3xl border-2 border-rose-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
                        <Gift size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-base font-outfit">Have a Redeem Code?</h3>
                        <p className="text-xs text-slate-500 font-medium">Apply a 12-digit code to unlock the 90-Day Platinum Plan instantly.</p>
                    </div>
                </div>

                {couponSuccess ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-bold animate-fade-in-up">
                        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                            <p>{couponSuccess.message || 'Coupon Applied Successfully!'}</p>
                            <p className="text-xs font-normal text-emerald-700 mt-0.5">
                                Platinum Plan unlocked for 90 days.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.replace(/\s+/g, ''))}
                            placeholder="Enter 12-digit redeem code"
                            maxLength={24}
                            className="flex-1 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary text-slate-900 shadow-xs"
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={applyingCoupon || !couponCode.trim()}
                            className="px-6 py-3.5 bg-brand-primary text-white font-black text-sm rounded-2xl hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-200 shrink-0"
                        >
                            {applyingCoupon ? 'Applying...' : 'Apply Coupon'}
                        </button>
                    </div>
                )}
            </div>

            {/* Plans List */}
            <div className="space-y-4">
                {plans.map(plan => (
                    <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${selectedPlan === plan.id ? 'border-brand-primary bg-brand-primary/5 shadow-md' : 'border-slate-100 bg-white'
                            }`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                <p className="text-sm text-slate-500">{plan.duration_days} Days</p>
                            </div>
                            <div className="text-2xl font-black text-brand-primary">₹{Math.round(plan.price)}</div>
                        </div>
                        <ul className="space-y-2">
                            {(plan.description || '').split(',').map(f => (
                                <li key={f} className="text-xs text-slate-600 flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                                        <Check size={10} className="text-green-600" />
                                    </div>
                                    {f.trim()}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* UPI Payment Section */}
            <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                    <QrIcon size={20} />
                    Payment via UPI
                </h4>
                <div className="bg-white p-4 rounded-2xl w-40 mx-auto aspect-square flex items-center justify-center">
                    <QRCode
                        id="qr-code-svg"
                        value={(() => {
                            const plan = plans.find(p => p.id === selectedPlan);
                            if (!plan) return '';
                            const name = plan.name.toLowerCase();
                            if (name.includes('gold')) {
                                return `upi://pay?pa=BHARATPE.8000846077@fbpe&pn=TWINGLE GOLD PLAN&am=30&cu=INR`;
                            } else if (name.includes('platinum')) {
                                return `upi://pay?pa=BHARATPE.8000846077@fbpe&pn=TWINGLE PLATINUM&am=400&cu=INR`;
                            }
                            return `upi://pay?pa=BHARATPE.8000846077@fbpe&pn=TWINGLE ${plan.name.toUpperCase()}&am=${plan.price}&cu=INR`;
                        })()}
                        size={128}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>
                <p className="text-center text-[10px] text-slate-400">
                    Scan QR and pay ₹{Math.round(plans.find(p => p.id === selectedPlan)?.price || 0)}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Upload Screenshot</label>
                    <div className="relative h-32 w-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white">
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => setScreenshot(e.target.files[0])}
                        />
                        {screenshot ? (
                            <span className="text-xs font-bold text-brand-primary">{screenshot.name}</span>
                        ) : (
                            <>
                                <Upload size={24} />
                                <span className="text-xs mt-2 font-bold uppercase">Choose Proof</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
            >
                Submit Proof
            </button>
        </div>
    );
};

export default Subscription;
