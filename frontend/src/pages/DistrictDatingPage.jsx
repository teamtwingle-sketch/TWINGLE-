import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Sparkles, MapPin, Heart, Shield, CheckCircle2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { KERALA_DISTRICTS } from '../data/seoPagesData';

const DistrictDatingPage = () => {
  const { slug } = useParams();
  const districtData = KERALA_DISTRICTS.find((d) => d.slug === slug) || KERALA_DISTRICTS[0];

  const pageTitle = `Dating in ${districtData.name} | Mallu Singles in ${districtData.district} - Twingle`;
  const pageDescription = `Find single Malayalis in ${districtData.name}. Twingle is Kerala's #1 Mallu dating app with verified profiles, local district matching, and safe in-app voice calls.`;
  const canonicalUrl = `https://twingle.online/dating/${districtData.slug}`;

  const faqs = [
    {
      question: `How can I meet single Malayalis in ${districtData.name}?`,
      answer: `Twingle allows you to filter specifically for ${districtData.district} district. Profiles in your area receive algorithmic priority, making it simple to match and meet locally.`
    },
    {
      question: `Is Twingle popular in ${districtData.name}?`,
      answer: `Yes! ${districtData.name} has a large, active community of verified Malayali men and women seeking friendship, dating, and serious relationships on Twingle.`
    },
    {
      question: `What are good date ideas in ${districtData.name}?`,
      answer: `Popular dating spots in ${districtData.name} include ${districtData.popularSpots.slice(0, 3).join(', ')}, and ${districtData.popularSpots[3] || 'local seaside cafes'}.`
    }
  ];

  const breadcrumbs = [
    { name: 'Home', url: 'https://twingle.online/' },
    { name: 'Mallu Dating App', url: 'https://twingle.online/mallu-dating-app' },
    { name: districtData.name, url: canonicalUrl }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={canonicalUrl}
        keywords={`dating in ${districtData.name}, ${districtData.district} dating app, mallu dating in ${districtData.name}, kerala dating ${districtData.district}, singles in ${districtData.name}`}
        faqs={faqs}
        breadcrumbs={breadcrumbs}
      />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden gradient-bg text-white py-16">
        <div className="z-10 max-w-2xl mx-auto">
          <div className="animate-fade-in-up">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30">
              <Sparkles className="w-12 h-12 fill-white animate-pulse" />
            </div>
          </div>

          <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase mb-4 border border-white/20">
            {districtData.district} Dating Hub
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight font-outfit leading-tight">
            Dating in {districtData.name}
          </h1>

          <p className="text-lg sm:text-xl opacity-90 mb-10 max-w-lg mx-auto font-medium leading-relaxed">
            {districtData.description}
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

        {/* Ambient shapes */}
        <div className="absolute top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Popular Date Spots in District */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 font-outfit mb-3 flex items-center gap-2">
            <Heart size={22} className="text-rose-500 fill-rose-500" /> Popular First Date Spots in {districtData.name}
          </h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Planning your first coffee or sunset meetup? Here are top date destinations favored by {districtData.district} couples on Twingle:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {districtData.popularSpots.map((spot, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/70 shadow-xs">
                <CheckCircle2 size={18} className="text-rose-500 shrink-0" />
                <span className="text-sm font-bold text-slate-800">{spot}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* District Dating FAQs */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Meeting singles in {districtData.name} made simple.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
              <h3 className="font-bold text-slate-900 text-base mb-2">{faq.question}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Other Kerala Districts Directory */}
      <section className="py-12 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-base font-bold text-slate-900 font-outfit mb-4">
            Browse Other Kerala Dating Locations:
          </h3>
          <div className="flex flex-wrap gap-2">
            {KERALA_DISTRICTS.map((d) => (
              <Link
                key={d.slug}
                to={`/dating/${d.slug}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  d.slug === districtData.slug
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-rose-200 hover:text-rose-600 shadow-xs'
                }`}
              >
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white text-center text-slate-500 text-sm">
        <p className="font-bold text-slate-700">© 2026 Twingle. {districtData.name} Dating Directory.</p>
        <div className="flex justify-center flex-wrap gap-6 mt-4 font-bold text-[10px] uppercase tracking-widest">
          <Link to="/" className="hover:text-rose-600">Home</Link>
          <Link to="/mallu-dating-app" className="hover:text-rose-600">Mallu Dating App</Link>
          <Link to="/best-mallu-dating-app" className="hover:text-rose-600">Best Dating App</Link>
          <Link to="/privacy" className="hover:text-rose-600">Privacy</Link>
          <Link to="/terms" className="hover:text-rose-600">Terms</Link>
          <Link to="/safety" className="hover:text-rose-600">Safety</Link>
        </div>
      </footer>
    </div>
  );
};

export default DistrictDatingPage;
