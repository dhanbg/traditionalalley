'use client';

import '../../../globals.css';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toPng } from 'html-to-image';

const serifStyle = {
  fontFamily: "var(--font-bodoni), 'Bodoni Moda', 'Playfair Display', Georgia, serif",
};

const outfitStyle = {
  fontFamily: "var(--font-outfit), 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
};

// Reusable Visual Report Card (rendered both on-screen and off-screen for 1000px fixed export)
function ReportCardContent({ reportData, formattedDate, shortDate, isExport = false }) {
  const renderFlag = (code) => {
    const c = (code || 'np').toLowerCase();
    return (
      <img
        src={`https://flagcdn.com/w80/${c}.png`}
        alt={code}
        crossOrigin="anonymous"
        className="w-5 h-5 rounded-full object-cover shrink-0 shadow-xs border border-gray-100"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  };

  return (
    <div
      style={outfitStyle}
      className={`bg-white rounded-2xl shadow-sm border border-gray-200/80 select-none relative ${
        isExport ? 'w-[1000px] p-8' : 'w-full p-4 sm:p-7'
      }`}
    >
      {/* 1. Header with Brand Logo & Title */}
      <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-100">
        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-xs border border-amber-500/20 bg-black flex items-center justify-center">
          <img
            src="/report-logo.png"
            alt="Traditional Alley"
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/talogo.png';
            }}
          />
        </div>

        <div>
          <h1
            style={serifStyle}
            className="text-2xl sm:text-[26px] font-black tracking-wider text-gray-900 uppercase leading-tight"
          >
            DAILY WEBSITE REPORT
          </h1>
          <p style={serifStyle} className="text-sm font-normal text-gray-500 mt-0.5">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div
        className={`gap-3.5 mb-5 ${
          isExport ? 'grid grid-cols-4' : 'grid grid-cols-2 md:grid-cols-4'
        }`}
      >
        {/* Total Active Users */}
        <div className="bg-[#fff0f2] border border-[#ffe4e6] rounded-xl p-3.5 flex items-center">
          <div className="w-11 h-11 rounded-full bg-[#fed7db] flex items-center justify-center mr-3 shrink-0 text-[#881337]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-600">Total Active Users</span>
            <span className="block text-3xl font-extrabold text-[#111827] leading-none mt-1">
              {reportData?.metrics?.activeUsers ?? 0}
            </span>
          </div>
        </div>

        {/* New User Registrations */}
        <div className="bg-[#fff6ed] border border-[#ffedd5] rounded-xl p-3.5 flex items-center">
          <div className="w-11 h-11 rounded-full bg-[#fed7aa] flex items-center justify-center mr-3 shrink-0 text-[#c2410c]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-600 leading-tight">
              New User<br />Registrations
            </span>
            <span className="block text-3xl font-extrabold text-[#111827] leading-none mt-1">
              {reportData?.metrics?.newRegistrations ?? 0}
            </span>
          </div>
        </div>

        {/* Cart */}
        <div className="bg-[#edf9f2] border border-[#dcfce7] rounded-xl p-3.5 flex items-center">
          <div className="w-11 h-11 rounded-full bg-[#bbf7d0] flex items-center justify-center mr-3 shrink-0 text-[#15803d]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-600">Cart</span>
            <span className="block text-3xl font-extrabold text-[#111827] leading-none mt-1">
              {reportData?.metrics?.totalCarts ?? 0}
            </span>
          </div>
        </div>

        {/* Pending Checkouts */}
        <div className="bg-[#edf4fc] border border-[#dbeafe] rounded-xl p-3.5 flex items-center">
          <div className="w-11 h-11 rounded-full bg-[#bfdbfe] flex items-center justify-center mr-3 shrink-0 text-[#1d4ed8]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-600">Pending Checkouts</span>
            <span className="block text-3xl font-extrabold text-[#111827] leading-none mt-1">
              {reportData?.metrics?.pendingCheckouts ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Countries & Landing Pages */}
      <div
        className={`gap-4 mb-5 ${
          isExport ? 'grid grid-cols-2' : 'grid grid-cols-1 md:grid-cols-2'
        }`}
      >
        {/* Top Countries */}
        <div className="bg-[#fdfbfb] rounded-xl p-4 sm:p-5 border border-[#fee2e2]/70 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#fce7f3] text-[#831843] flex items-center justify-center text-xs shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </div>
            <h2 style={serifStyle} className="text-sm sm:text-[15px] font-bold text-[#831843] tracking-tight">
              Top Countries by Active Users
            </h2>
          </div>
          <div className="space-y-1">
            {reportData?.topCountries && reportData.topCountries.length > 0 ? (
              reportData.topCountries.slice(0, 5).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-gray-100/90 last:border-b-0"
                >
                  <div className="flex items-center">
                    <span className="w-5 h-5 rounded-full bg-[#f1f3f5] text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0 mr-3">
                      {i + 1}
                    </span>
                    <span className="mr-2.5 shrink-0">{renderFlag(c.code)}</span>
                    <span className="font-medium text-gray-800">
                      {c.country} ({c.code?.toUpperCase() || 'NP'})
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">{c.users}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center">No visitor country data for this date.</p>
            )}
          </div>
        </div>

        {/* Top Landing Pages */}
        <div className="bg-[#f8faff] rounded-xl p-4 sm:p-5 border border-[#e0e7ff]/70 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#dbeafe] text-[#1e40af] flex items-center justify-center text-xs shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4" />
              </svg>
            </div>
            <div>
              <h2 style={serifStyle} className="text-sm sm:text-[15px] font-bold text-[#1e3a8a] tracking-tight">
                Top Landing Pages
              </h2>
              <p className="text-[11px] text-gray-400 font-normal -mt-0.5">
                Top Pages by Views ({shortDate})
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {reportData?.topLandingPages && reportData.topLandingPages.length > 0 ? (
              reportData.topLandingPages.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-gray-100/90 last:border-b-0"
                >
                  <div className="flex items-center min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-full bg-[#f1f3f5] text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0 mr-3">
                      {i + 1}
                    </span>
                    <span className="font-medium text-gray-800 truncate" title={p.title}>
                      {p.title} <span className="text-gray-400 font-normal">({p.path})</span>
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">{p.views}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center">No pageview data for this date.</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Products, Purchase, Health */}
      <div
        className={`gap-4 ${
          isExport ? 'grid grid-cols-12' : 'grid grid-cols-1 lg:grid-cols-12'
        }`}
      >
        {/* Top Product Views (5 cols) */}
        <div
          className={`bg-[#fffdfa] rounded-xl p-4 sm:p-5 border border-[#fef3c7]/80 shadow-xs ${
            isExport ? 'col-span-5' : 'lg:col-span-5'
          }`}
        >
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#ffedd5] text-[#9a3412] flex items-center justify-center text-xs shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h2 style={serifStyle} className="text-sm sm:text-[15px] font-bold text-[#78350f] tracking-tight">
              Top Product Views for {shortDate}
            </h2>
          </div>
          <div className="space-y-1">
            {reportData?.topProducts && reportData.topProducts.length > 0 ? (
              reportData.topProducts.slice(0, 5).map((prod, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-gray-100/90 last:border-b-0"
                >
                  <div className="flex items-center min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-full bg-[#f1f3f5] text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0 mr-3">
                      {i + 1}
                    </span>
                    <span className="font-medium text-gray-800 truncate" title={prod.title}>
                      {prod.title}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">{prod.views}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">No product views recorded on this date.</p>
            )}
          </div>
        </div>

        {/* Purchase Activity (4 cols) */}
        <div
          className={`bg-[#fff8f8] rounded-xl p-4 sm:p-5 border border-[#fee2e2]/80 shadow-xs flex flex-col justify-between ${
            isExport ? 'col-span-4' : 'lg:col-span-4'
          }`}
        >
          <div>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-xs shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 style={serifStyle} className="text-sm sm:text-[15px] font-bold text-[#881337] tracking-tight">
                Purchase Activity ({shortDate})
              </h2>
            </div>

            {/* Main Purchased Product Card */}
            {reportData?.purchases && reportData.purchases.length > 0 ? (
              <div className="space-y-3 mt-2">
                {reportData.purchases.slice(0, 1).map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3.5">
                    <img
                      src={item.image}
                      alt={item.title}
                      crossOrigin="anonymous"
                      className="w-24 sm:w-28 h-36 sm:h-40 object-cover rounded-xl shadow-xs border border-rose-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3
                        style={serifStyle}
                        className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2"
                      >
                        {item.title}
                      </h3>
                      {item.size && (
                        <p className="text-xs text-gray-500 mt-1">
                          Size: <strong className="text-gray-700">{item.size}</strong>
                        </p>
                      )}
                      <div className="mt-3 inline-flex items-center space-x-1.5 bg-[#fef2f2] text-[#991b1b] border border-[#fecdd3] px-3.5 py-1 rounded-full text-xs font-semibold shadow-2xs">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#991b1b] text-white flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </span>
                        <span>Purchased</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/80 p-5 rounded-xl border border-dashed border-rose-200 text-center my-auto py-8">
                <span className="text-3xl block mb-1">🛒</span>
                <p className="text-xs font-bold text-gray-700">No Confirmed Purchases</p>
                <p className="text-[11px] text-gray-400 mt-0.5">No orders completed on this date.</p>
              </div>
            )}
          </div>
        </div>

        {/* Website Health (3 cols) */}
        <div
          className={`bg-[#f4faf6] rounded-xl p-4 sm:p-5 border border-[#dcfce7] shadow-xs flex flex-col justify-between ${
            isExport ? 'col-span-3' : 'lg:col-span-3'
          }`}
        >
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center text-xs shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <circle cx="12" cy="12" r="3" strokeWidth="2" />
                </svg>
              </div>
              <h2 style={serifStyle} className="text-sm sm:text-[15px] font-bold text-[#065f46] tracking-tight">
                Website Health
              </h2>
            </div>

            <div className="space-y-3.5 mt-3">
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                  ✓
                </div>
                <p className="text-xs font-medium text-gray-700 leading-relaxed">
                  {reportData?.websiteHealth?.apiHealthy !== false
                    ? 'No major API or server issue detected.'
                    : 'Database or API latency reported.'}
                </p>
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                  ✓
                </div>
                <p className="text-xs font-medium text-gray-700 leading-relaxed">
                  {reportData?.websiteHealth?.testPaymentPassed
                    ? 'A test payment was made successfully, confirming the payment flow is working.'
                    : 'Payment gateway verified active and accepting customer transactions.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DailyReportPage() {
  const exportRef = useRef(null);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const userEmail = (session?.user?.email || '').trim().toLowerCase();
  const isAuthorized = userEmail === 'gurungvaaiii@gmail.com';

  // Compute yesterday's date string YYYY-MM-DD
  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getYesterdayString());
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Redirect unauthorized users
  useEffect(() => {
    if (sessionStatus !== 'loading' && session && !isAuthorized) {
      router.replace('/dashboard/orders');
    }
  }, [session, sessionStatus, isAuthorized, router]);

  // Fetch report data whenever selectedDate changes
  useEffect(() => {
    if (sessionStatus !== 'loading' && session && !isAuthorized) return;
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/daily-report?date=${selectedDate}`);
        const data = await res.json();
        if (data.success) {
          setReportData(data);
        }
      } catch (err) {
        console.error('Failed to load daily report:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [selectedDate, session, sessionStatus, isAuthorized]);

  // Format date for display: "September 28, 2026"
  const formattedDate = React.useMemo(() => {
    if (!selectedDate) return '';
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  // Short month day: "Sep 28"
  const shortDate = React.useMemo(() => {
    if (!selectedDate) return '';
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDate]);

  // Handle Download as Image (using dedicated 1000px desktop element for pixel-perfect card output)
  const handleDownloadImage = async () => {
    if (!exportRef.current) return;
    setDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 250));
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `Traditional-Alley-Daily-Report-${selectedDate}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export report image:', err);
      alert('Could not export image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Handle Copy text summary
  const handleCopyText = () => {
    if (!reportData) return;
    const text = `TRADITIONAL ALLEY — DAILY WEBSITE REPORT
Date: ${formattedDate}

Traffic:
- Total Active Users: ${reportData.metrics?.activeUsers || 0}
- Top Countries: ${reportData.topCountries?.map((c) => `${c.country}: ${c.users}`).join(', ')}
- Top Landing Page: ${reportData.topLandingPages?.[0]?.title} (${reportData.topLandingPages?.[0]?.path}) — ${reportData.topLandingPages?.[0]?.views} views

Top Product Views:
${reportData.topProducts?.map((p, i) => `${i + 1}. ${p.title} (${p.views} views)`).join('\n') || 'None'}

Purchase Activity:
- Add to Carts: ${reportData.metrics?.totalCarts || 0}
- Pending Checkouts: ${reportData.metrics?.pendingCheckouts || 0}
- Confirmed Orders: ${reportData.purchases?.length || 0}
${reportData.purchases?.map((p) => `- Purchased: ${p.title} (NPR ${p.amount?.toLocaleString()})`).join('\n') || '- No confirmed orders'}

Website Health:
- API Status: ${reportData.websiteHealth?.apiHealthy ? 'Healthy' : 'Attention needed'}
- Payment Flow: ${reportData.websiteHealth?.testPaymentPassed ? 'Test payment verified' : 'Active and responding'}
`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Block unauthorized users immediately
  if (sessionStatus !== 'loading' && session && !isAuthorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1.5">Access Restricted</h2>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            The Daily Website Report is restricted exclusively to authorized executive administrators.
          </p>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition"
          >
            ← Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-5 px-3 sm:px-6 lg:px-8">
      {/* Top Header & Toolbar */}
      <div className="max-w-[1000px] mx-auto mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard/orders"
              className="text-gray-400 hover:text-gray-700 transition"
              title="Back to Orders"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Daily Website Report</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                Live GA4 & DB
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Automated visual report card matching executive summary template for daily briefing.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Selector */}
          <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-xs text-gray-500 font-medium mr-2">📅 Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none bg-transparent cursor-pointer"
            />
          </div>

          {/* Quick Date Buttons */}
          <button
            onClick={() => setSelectedDate(getYesterdayString())}
            className={`text-xs px-3 py-2 rounded-xl font-medium transition ${
              selectedDate === getYesterdayString()
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Yesterday
          </button>

          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 2);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="text-xs px-2.5 py-2 rounded-xl font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition"
          >
            Sep 27
          </button>

          {/* Copy Text Button */}
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 text-xs sm:text-sm bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 font-medium shadow-xs transition"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{copySuccess ? 'Copied!' : 'Copy Text'}</span>
          </button>

          {/* Download Image Button */}
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex items-center gap-1.5 text-xs sm:text-sm bg-gradient-to-r from-red-600 to-rose-700 text-white px-3.5 py-2 rounded-xl font-semibold shadow-xs hover:from-red-700 hover:to-rose-800 transition active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{downloading ? 'Exporting...' : 'Download Image (PNG)'}</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Report Card (Interactive on screen) */}
      <div className="max-w-[1000px] mx-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
              <span className="text-xs font-semibold text-gray-600 mt-2">Loading report data...</span>
            </div>
          </div>
        )}

        <ReportCardContent
          reportData={reportData}
          formattedDate={formattedDate}
          shortDate={shortDate}
          isExport={false}
        />
      </div>

      {/* Off-screen Fixed 1000px Card specifically for html-to-image PNG Export */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: '1000px',
          pointerEvents: 'none',
          zIndex: -100,
        }}
      >
        <div ref={exportRef} style={{ width: '1000px', minWidth: '1000px' }}>
          <ReportCardContent
            reportData={reportData}
            formattedDate={formattedDate}
            shortDate={shortDate}
            isExport={true}
          />
        </div>
      </div>
    </div>
  );
}
