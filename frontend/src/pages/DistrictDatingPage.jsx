import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Sparkles, MapPin, Heart, ShieldCheck, Download, ArrowRight, CheckCircle2 } from 'lucide-react';
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
      answer: `Twingle allows you to filter specifically for ${districtData.district} district. Profiles in your area receive algorithmic priority (+5 points compatibility score), making it simple to match and meet locally.`
    },
    {
      question: `Is Twingle popular in ${districtData.name}?`,
      answer: `Yes! ${districtData.name} has a large, active community of verified Malayali men and women seeking friendship, casual dates, and serious relationships on Twingle.`
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-rose-500 selection:text-white">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={canonicalUrl}
        keywords={`dating in ${districtData.name}, ${districtData.district} dating app, mallu dating in ${districtData.name}, kerala dating ${districtData.district}, singles in ${districtData.name}`}
        faqs={faqs}
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

      {/* Hero */}
      <section className="pt-12 pb-16 px-6 sm:px-10 lg:px-16 bg-gradient-to-b from-rose-50/60 via-slate-50 to-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-rose-200/80 shadow-sm text-rose-600 text-xs font-black tracking-wide mb-6">
            <MapPin size={14} className="text-rose-500" />
            <span>{districtData.district} Dating Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-[900] text-slate-900 tracking-tight font-outfit leading-tight mb-4">
            Dating in {districtData.name} for Malayali Singles
          </h1>
          <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed mb-8">
            {districtData.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-white text-base bg-gradient-to-r from-rose-500 to-pink-600 shadow-xl shadow-rose-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Meet {districtData.district} Singles <ArrowRight size={18} />
            </Link>
            <Link
              to="/mallu-dating-app"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-slate-700 text-base bg-white border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
            >
              About the App
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Date Spots in District */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/80 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-outfit mb-3 flex items-center gap-2">
            <Heart size={20} className="text-rose-500 fill-rose-500" /> Popular First Date Spots in {districtData.name}
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            Planning your first coffee or sunset meetup? Here are top date destinations favored by {districtData.district} couples on Twingle:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {districtData.popularSpots.map((spot, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircle2 size={16} className="text-rose-500 shrink-0" />
                <span className="text-sm font-bold text-slate-800">{spot}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Kerala Districts */}
      <section className="max-w-4xl mx-auto px-6 py-10 border-t border-slate-200/60 mt-10">
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
                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-200 hover:text-rose-600'
              }`}
            >
              {d.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 bg-white text-center text-slate-500 text-xs">
        <p className="font-semibold text-slate-700 mb-2">© 2026 Twingle. {districtData.name} Dating Directory.</p>
        <div className="flex justify-center gap-6 font-bold uppercase tracking-widest text-[10px]">
          <Link to="/" className="hover:text-rose-600">Home</Link>
          <Link to="/mallu-dating-app" className="hover:text-rose-600">Mallu Dating App</Link>
          <Link to="/best-mallu-dating-app" className="hover:text-rose-600">Best Dating App</Link>
          <Link to="/privacy" className="hover:text-rose-600">Privacy</Link>
          <Link to="/terms" className="hover:text-rose-600">Terms</Link>
        </div>
      </footer>
    </div>
  );
};

export default DistrictDatingPage;
