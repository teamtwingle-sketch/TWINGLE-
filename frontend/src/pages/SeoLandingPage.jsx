import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Heart, Phone, MapPin, 
  CheckCircle2, ChevronDown, ChevronUp, Download, 
  ArrowRight, Users, Zap, Lock, Star, HelpCircle
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-rose-500 selection:text-white">
      {/* Dynamic SEO Meta & JSON-LD Structured Data */}
      <SEOHead
        title={pageData.title}
        description={pageData.description}
        canonical={pageData.canonical}
        keywords={`${pageData.keyword}, mallu dating app, mallu dating website, malayalis dating app, malayalam dating app, best mallu dating app, affordable dating app for mallus, kerala dating, kochi dating, vivaham`}
        faqs={pageData.faqs}
        breadcrumbs={breadcrumbs}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-5 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl shadow-sm flex items-center justify-center transform hover:scale-105 transition-all">
            <Sparkles className="text-white w-5 h-5 fill-white/90" />
          </div>
          <span className="font-[900] text-2xl tracking-tight text-slate-900 font-outfit">TWINGLE</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/download"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Download size={14} /> Download APK
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200 hover:shadow-rose-300 active:scale-95 transition-all"
          >
            JOIN FREE
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 sm:px-10 lg:px-16 bg-gradient-to-b from-rose-50/60 via-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-rose-200/80 shadow-sm text-rose-600 text-xs font-black tracking-wide mb-6 animate-fade-in-up">
            <Sparkles size={14} className="fill-rose-500" />
            <span>{pageData.badge}</span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-[900] text-slate-900 tracking-tight font-outfit leading-[1.15] mb-6">
            {pageData.h1}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            {pageData.heroSubtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-white text-base tracking-wide bg-gradient-to-r from-rose-500 to-pink-600 shadow-xl shadow-rose-200/60 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Start Free Dating <ArrowRight size={18} />
            </Link>
            <Link
              to="/download"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-slate-800 text-base bg-white border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} className="text-rose-500" /> Download Android APK
            </Link>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-slate-200/70 shadow-[0_4px_25px_rgba(0,0,0,0.03)] text-left">
            {pageData.keyStats.map((stat, i) => (
              <div key={i} className="px-3 border-l-2 border-rose-500 first:border-none">
                <p className="text-2xl font-black text-slate-900 font-outfit">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Overview / Quick Definition Box (Targeted for Google AI Overview snippet extraction) */}
      <section className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-gradient-to-r from-rose-500/5 via-pink-500/5 to-orange-500/5 border border-rose-200/60 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-wider mb-2">
            <Sparkles size={16} /> Key Takeaways for Malayali Singles
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 font-outfit">
            What makes Twingle the top choice for Mallu dating?
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base font-medium">
            {pageData.aiOverviewSnippet}
          </p>
        </div>
      </section>

      {/* Highlights / Features Section */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-outfit tracking-tight">
            Designed for Authentic Malayali Connections
          </h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-2">
            Modern dating features built around Kerala culture, safety, and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pageData.highlightPoints.map((pt, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black mb-4">
                {idx === 0 && <Heart size={20} className="fill-rose-500" />}
                {idx === 1 && <MapPin size={20} />}
                {idx === 2 && <Phone size={20} />}
                {idx === 3 && <ShieldCheck size={20} />}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-outfit">{pt.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{pt.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table Section (Crucial for "Best Mallu Dating App" & Competitor comparisons) */}
      {pageData.comparisonTable && (
        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-outfit tracking-tight">
              Twingle vs. Other Dating Apps in Kerala
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-2">
              See why Malayalis are switching from generic apps to Twingle.
            </p>
          </div>

          <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 sm:p-5 font-bold">Feature / Capability</th>
                  <th className="p-4 sm:p-5 font-black text-rose-600 bg-rose-50/50">Twingle (Our App)</th>
                  <th className="p-4 sm:p-5 font-bold">Arike</th>
                  <th className="p-4 sm:p-5 font-bold">Tinder</th>
                  <th className="p-4 sm:p-5 font-bold">Bumble</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageData.comparisonTable.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-semibold text-slate-800">{row.feature}</td>
                    <td className="p-4 sm:p-5 font-bold text-rose-600 bg-rose-50/30">{row.twingle}</td>
                    <td className="p-4 sm:p-5 text-slate-600">{row.arike}</td>
                    <td className="p-4 sm:p-5 text-slate-500">{row.tinder}</td>
                    <td className="p-4 sm:p-5 text-slate-500">{row.bumble}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pricing / Affordability Breakdown */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-bold tracking-wide mb-4">
              <Zap size={14} className="text-yellow-400" /> Transparent Pricing
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-outfit tracking-tight mb-4">
              Premium Dating Starting at Just ₹199
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              Unlike international apps that quietly autorenew ₹1,200+ on your credit card every month, Twingle offers pure prepaid UPI convenience. Pay once, enjoy full freedom, zero auto-billing surprises.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10">
                <span className="text-xs text-slate-300 block">Gold Plan</span>
                <span className="text-xl font-black text-rose-400">₹199 / 30 Days</span>
              </div>
              <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10">
                <span className="text-xs text-slate-300 block">Platinum Plan</span>
                <span className="text-xl font-black text-yellow-400">₹499 / 90 Days</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gradient-to-br from-rose-500/20 to-pink-500/30 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* FAQ Section with Schema.org Microdata Accordion */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-rose-600 text-xs font-black uppercase tracking-wider mb-2">
            <HelpCircle size={16} /> Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-outfit tracking-tight">
            Got Questions About Mallu Dating on Twingle?
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Everything you need to know about safety, verification, and matching in Kerala.
          </p>
        </div>

        <div className="space-y-4">
          {pageData.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
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
                  <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Kerala District Programmatic Links Hub */}
      <section className="max-w-4xl mx-auto px-6 py-10 border-t border-slate-200/70">
        <h3 className="text-lg font-bold text-slate-900 font-outfit mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-rose-500" /> Explore Malayali Dating by Kerala District & Region
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Find singles in your city or hometown across Kerala and prominent NRI communities:
        </p>
        <div className="flex flex-wrap gap-2">
          {KERALA_DISTRICTS.map((d) => (
            <Link
              key={d.slug}
              to={`/dating/${d.slug}`}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50 transition-all shadow-2xs"
            >
              {d.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Programmatic SEO Related Landing Pages Links */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Popular Malayalam Dating Topics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(PROGRAMMATIC_PAGES).map((p) => (
            <Link
              key={p.slug}
              to={`/${p.slug}`}
              className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                p.slug === pageData.slug
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-200 hover:text-rose-600'
              }`}
            >
              {p.keyword} →
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom Sticky CTA on Mobile */}
      <div className="sticky bottom-0 z-30 sm:hidden bg-white/95 backdrop-blur-md p-3 border-t border-slate-200 flex gap-2">
        <Link
          to="/register"
          className="flex-1 py-3 text-center bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm rounded-full shadow-md"
        >
          JOIN FREE NOW
        </Link>
        <Link
          to="/download"
          className="px-4 py-3 bg-slate-900 text-white font-bold text-sm rounded-full flex items-center justify-center"
        >
          <Download size={18} />
        </Link>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white text-center text-slate-500 text-xs">
        <p className="font-semibold text-slate-700 mb-2">© 2026 Twingle. Kerala’s Leading Dating Application for Malayalis.</p>
        <p className="max-w-md mx-auto text-[11px] text-slate-400 mb-4">
          Safe, verified, and community-driven. Dedicated to connecting Keralites in Kochi, Thiruvananthapuram, Kozhikode, Thrissur, Bangalore, and across the globe.
        </p>
        <div className="flex justify-center gap-6 font-bold uppercase tracking-widest text-[10px]">
          <Link to="/privacy" className="hover:text-rose-600">Privacy</Link>
          <Link to="/terms" className="hover:text-rose-600">Terms</Link>
          <Link to="/safety" className="hover:text-rose-600">Safety</Link>
          <Link to="/guidelines" className="hover:text-rose-600">Guidelines</Link>
          <Link to="/download" className="hover:text-rose-600">Download APK</Link>
        </div>
      </footer>
    </div>
  );
};

export default SeoLandingPage;
