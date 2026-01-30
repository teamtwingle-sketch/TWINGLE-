
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { Check, Upload, QrCode as QrIcon } from 'lucide-react';
import QRCode from 'react-qr-code';

const Subscription = () => {
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [screenshot, setScreenshot] = useState(null);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        fetchPlans();
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try { const res = await api.get('/payments/status/'); setStatus(res.data); } catch (e) { }
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
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `twingle-upi-qr-${Date.now()}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) { console.error("Download failed", e); }
    };

    // Auto-download when plan changes (except initial load)
    useEffect(() => {
        if (selectedPlan && plans.length > 0) {
            const timer = setTimeout(() => {
                downloadQR();
                toast.info("QR Code downloaded!");
            }, 500); // 500ms delay to ensure render
            return () => clearTimeout(timer);
        }
    }, [selectedPlan]);

    return (
        <div className="p-6 pb-24 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Get Premium</h1>
                {status?.is_premium ? (
                    <div className="bg-green-100 p-4 rounded-xl text-green-800 mt-2 border border-green-200">
                        <h3 className="font-bold">Active Subscription</h3>
                        <p>Expires in {status.days_left} days ({new Date(status.expiry).toLocaleDateString()})</p>
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

            <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                    <QrIcon size={20} />
                    Payment via UPI
                </h4>
                <div className="bg-white p-4 rounded-2xl w-40 mx-auto aspect-square flex items-center justify-center">
                    <QRCode
                        id="qr-code-svg"
                        value={`upi://pay?pa=twingle@upi&pn=Twingle&am=${plans.find(p => p.id === selectedPlan)?.price || 0}&cu=INR`}
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
