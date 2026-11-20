import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Sparkles, Shield, Heart, Zap, MapPin, 
  ChevronDown, ChevronUp
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { PROGRAMMATIC_PAGES, KERALA_DISTRICTS } from '../data/seoPagesData';

const SeoLandingPage = ({ forcedSlug }) => {
  const params = useParams();
  const slug = forcedSlug || params.slug || 'mallu-dating-app';
  const pageData = PROGRAMMATIC_PAGES[slug] || PROGRAMMATIC_PAGES['mallu-dating-app'];

  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? -1 : idx);
  };

  const breadcrumbs = [
    { name: 'Home', url: 'https://twingle.online/' },
    { name: pageData.keyword, url: `https://twingle.online/${pageData.slug}` }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic SEO Meta & JSON-LD Structured Data */}
      <SEOHead
        title={pageData.title}
        description={pageData.description}
        canonical={pageData.canonical}
        keywords={`${pageData.keyword}, mallu dating app, mallu dating website, malayalis dating app, malayalam dating app, best mallu dating app, affordable dating app for mallus, kerala dating, kochi dating, vivaham`}
        faqs={pageData.faqs}
        breadcrumbs={breadcrumbs}
      />

      {/* Hero Section - Matching the clean, spacious original web app layout */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden gradient-bg text-white py-16">
        <div className="z-10 max-w-2xl mx-auto">
          <div className="animate-fade-in-up">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30">
              <Sparkles className="w-12 h-12 fill-white animate-pulse" />
            </div>
          </div>

          <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase mb-4 border border-white/20">
            {pageData.badge}
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight font-outfit leading-tight">
            {pageData.h1}
          </h1>

          <p className="text-lg sm:text-xl opacity-90 mb-10 max-w-lg mx-auto font-medium leading-relaxed">
            {pageData.heroSubtitle}
          </p>

          <div className="flex flex-col gap-4 w-full max-w-xs mx-auto animate-fade-in-up">
            <Link
              to="/login"
              className="bg-white text-brand-primary font-black py-4 px-12 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-xl tracking-wide uppercase"
            >
              Get Started
            </Link>
            <p className="text-sm font-medium opacity-80">
              New here? <Link to="/register" className="underline hover:text-white font-bold">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Decorative ambient elements */}
        <div className="absolute top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* 3 Clean, Airy Feature Cards */}
      <section className="py-20 px-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
          <div className="w-14 h-14 rounded-2xl bg-rose-100/60 text-brand-primary flex items-center justify-center mb-5">
            <Shield size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 font-outfit">Safe & Verified</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Live selfie verification with Blue Checkmark badge keeps fake profiles and catfish out of our Malayali community.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
          <div className="w-14 h-14 rounded-2xl bg-orange-100/60 text-orange-500 flex items-center justify-center mb-5">
            <Heart size={28} className="fill-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 font-outfit">Kerala Smart Matching</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Find compatible Malayali singles across all 14 Kerala districts and global NRI hubs based on shared culture and values.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
          <div className="w-14 h-14 rounded-2xl bg-blue-100/60 text-blue-500 flex items-center justify-center mb-5">
            <Zap size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 font-outfit">Affordable Plans</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Enjoy unlimited swipes and direct voice calling starting at just ₹199 via prepaid UPI with zero recurring card traps.
          </p>
        </div>
      </section>

      {/* Spacious FAQ Section (Optimized for Google Rich Snippets & AI Overview) */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Everything you need to know about dating on Twingle in Kerala.
          </p>
        </div>

        <div className="space-y-4">
          {pageData.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base hover:text-rose-600 transition-colors"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp size={20} className="text-rose-500 shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-200/60 font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Kerala Districts Directory */}
      <section className="py-12 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-bold text-slate-900 font-outfit mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-rose-500" /> Browse Malayali Singles by Kerala District:
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Connect with verified singles in your hometown or region across Kerala:
          </p>
          <div className="flex flex-wrap gap-2">
            {KERALA_DISTRICTS.map((d) => (
              <Link
                key={d.slug}
                to={`/dating/${d.slug}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50 transition-all shadow-xs"
              >
                {d.name}
              </Link>
            ))}
          </div>

          {/* Related Programmatic Topics */}
          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Explore More Dating Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.values(PROGRAMMATIC_PAGES).map((p) => (
                <Link
                  key={p.slug}
                  to={`/${p.slug}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    p.slug === pageData.slug
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-rose-200 hover:text-rose-600'
                  }`}
                >
                  {p.keyword}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 text-center text-slate-500 text-sm bg-white">
        <p className="font-bold text-slate-700">© 2026 Twingle. Made with ❤️ for Kerala.</p>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          The No. 1 Mallu Dating App & Website for Malayalis in Kerala, Bangalore, Dubai, and worldwide.
        </p>
        <div className="flex justify-center flex-wrap gap-6 mt-6 font-bold text-[10px] uppercase tracking-widest">
          <Link to="/mallu-dating-app" className="hover:text-rose-600">Mallu Dating App</Link>
          <Link to="/mallu-dating-website" className="hover:text-rose-600">Mallu Dating Website</Link>
          <Link to="/best-mallu-dating-app" className="hover:text-rose-600">Best Dating App</Link>
          <Link to="/affordable-dating-app-for-mallus" className="hover:text-rose-600">Affordable Plans</Link>
          <Link to="/privacy" className="hover:text-rose-600">Privacy</Link>
          <Link to="/terms" className="hover:text-rose-600">Terms</Link>
          <Link to="/safety" className="hover:text-rose-600">Safety</Link>
        </div>
      </footer>
    </div>
  );
};

export default SeoLandingPage;
