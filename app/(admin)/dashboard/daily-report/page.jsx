'use client';

import '../../../globals.css';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toPng } from 'html-to-image';
import { REPORT_FONTS_EMBED_CSS } from './reportFonts';

const serifStyle = {
  fontFamily: "'Bodoni Moda', var(--font-bodoni), 'Playfair Display', Georgia, serif",
};

const outfitStyle = {
  fontFamily: "'Outfit', var(--font-outfit), -apple-system, BlinkMacSystemFont, sans-serif",
};

// Reusable Visual Report Card (rendered both on-screen and off-screen for 1000px fixed export)
function ReportCardContent({
  reportData,
  formattedDate,
  shortDate,
  isExport = false,
  period = 'daily',
  reportTitle = 'DAILY WEBSITE REPORT',
}) {
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

  const renderChannelIcon = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('social')) {
      return (
        <svg className="w-3.5 h-3.5 text-pink-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3 20a6 6 0 0112 0v1H3v-1zm14.5-3a4.5 4.5 0 00-3.5-4.4M19 8a3 3 0 110 6" />
        </svg>
      );
    }
    if (n.includes('search')) {
      return (
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    }
    if (n.includes('direct')) {
      return (
        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    }
    if (n.includes('referral')) {
      return (
        <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      );
    }
    if (n.includes('ai')) {
      return (
        <svg className="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  };

  return (
    <div
      style={outfitStyle}
      className={`bg-white rounded-2xl shadow-sm border border-gray-200/80 select-none relative ${
        isExport ? 'w-[1000px] p-7' : 'w-full p-4 sm:p-7'
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

        <div className="min-w-0">
          <div className="flex items-center flex-wrap">
            <h1
              style={{ ...serifStyle, fontWeight: 600 }}
              className="text-2xl sm:text-[25px] font-semibold tracking-normal text-gray-900 uppercase leading-snug whitespace-nowrap"
            >
              {reportTitle}
            </h1>
            {period !== 'daily' && (
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full shrink-0 ml-3">
                {period === '3months' ? 'Quarter' : period}
              </span>
            )}
          </div>
          <p
            style={{ ...serifStyle, fontWeight: 600 }}
            className="text-sm font-semibold sm:font-bold text-gray-700 mt-1 whitespace-nowrap"
          >
            {formattedDate}
          </p>
        </div>
      </div>

      {/* 2. Top 5 Metric Cards */}
      <div
        className={`gap-3.5 mb-5 ${
          isExport ? 'grid grid-cols-5' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        }`}
      >
        {/* Total Active Users */}
        <div className="bg-[#fff0f2] border border-[#ffe4e6] rounded-xl p-3 sm:p-3.5 flex items-center">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#fed7db] flex items-center justify-center mr-2.5 sm:mr-3 shrink-0 text-[#881337]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-600 leading-tight">Total Active Users</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#111827] leading-none mt-1">
              {reportData?.metrics?.activeUsers ?? 0}
            </span>
          </div>
        </div>

        {/* New User Registrations */}
        <div className="bg-[#fff6ed] border border-[#ffedd5] rounded-xl p-3 sm:p-3.5 flex items-center">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#fed7aa] flex items-center justify-center mr-2.5 sm:mr-3 shrink-0 text-[#c2410c]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-600 leading-tight">
              New User<br />Registrations
            </span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#111827] leading-none mt-1">
              {reportData?.metrics?.newRegistrations ?? 0}
            </span>
          </div>
        </div>

        {/* Cart */}
        <div className="bg-[#edf9f2] border border-[#dcfce7] rounded-xl p-3 sm:p-3.5 flex items-center">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#bbf7d0] flex items-center justify-center mr-2.5 sm:mr-3 shrink-0 text-[#15803d]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-600 leading-tight">Cart</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#111827] leading-none mt-1">
              {reportData?.metrics?.totalCarts ?? 0}
            </span>
          </div>
        </div>

        {/* Pending Checkouts */}
        <div className="bg-[#edf4fc] border border-[#dbeafe] rounded-xl p-3 sm:p-3.5 flex items-center">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#bfdbfe] flex items-center justify-center mr-2.5 sm:mr-3 shrink-0 text-[#1d4ed8]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-600 leading-tight">Pending Checkouts</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#111827] leading-none mt-1">
              {reportData?.metrics?.pendingCheckouts ?? 0}
            </span>
          </div>
        </div>

        {/* Abandoned Checkout */}
        <div className="bg-[#faf5ff] border border-[#f3e8ff] rounded-xl p-3 sm:p-3.5 flex items-center">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#e9d5ff] flex items-center justify-center mr-2.5 sm:mr-3 shrink-0 text-[#7e22ce]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-600 leading-tight">Abandoned Checkout</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-[#111827] leading-none mt-1">
              {reportData?.metrics?.abandonedCheckouts ?? Math.max(0, (reportData?.metrics?.totalCarts ?? 0) - (reportData?.metrics?.pendingCheckouts ?? 0))}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Countries, Traffic Acquisition & Landing Pages */}
      <div
        className={`gap-4 mb-5 ${
          isExport ? 'grid grid-cols-3' : 'grid grid-cols-1 md:grid-cols-3'
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
            <h2 style={serifStyle} className="text-sm sm:text-[15px] font-bold text-[#831843] tracking-tight whitespace-nowrap">
              Top Countries
            </h2>
          </div>
          <div className="space-y-1">
            {reportData?.topCountries && reportData.topCountries.length > 0 ? (
              reportData.topCountries.slice(0, 5).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-gray-100/90 last:border-b-0"
                >
                  <div className="flex items-center min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-full bg-[#f1f3f5] text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0 mr-3">
                      {i + 1}
                    </span>
                    <span className="mr-2.5 shrink-0">{renderFlag(c.code)}</span>
                    <span className="font-medium text-gray-800 truncate" title={`${c.country} (${c.code?.toUpperCase() || 'NP'})`}>
                      {c.country} ({c.code?.toUpperCase() || 'NP'})
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">{c.users}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center">No visitor country data for this date.</p>
            )}
          </div>
        </div>

        {/* Traffic Channels (Sessions) */}
        <div className="bg-[#fafbff] rounded-xl p-4 sm:p-5 border border-[#e0e7ff]/80 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#e0e7ff] text-[#3730a3] flex items-center justify-center text-xs shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 style={serifStyle} className="text-sm sm:text-[15px] font-bold text-[#312e81] tracking-tight whitespace-nowrap">
                Traffic Acquisition
              </h2>
              <p className="text-[11px] text-gray-400 font-normal -mt-0.5 whitespace-nowrap">
                Sessions by Channel Group
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {reportData?.topChannels && reportData.topChannels.length > 0 ? (
              reportData.topChannels.slice(0, 5).map((ch, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-gray-100/90 last:border-b-0"
                >
                  <div className="flex items-center min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-full bg-[#f1f3f5] text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0 mr-2.5">
                      {i + 1}
                    </span>
                    <span className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center shrink-0 mr-2 border border-gray-100">
                      {renderChannelIcon(ch.channel)}
                    </span>
                    <span className="font-medium text-gray-800 truncate" title={ch.channel}>
                      {ch.channel}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="font-bold text-gray-900">{ch.sessions}</span>
                    <span className="text-[11px] text-gray-400 font-medium">({ch.percentage}%)</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center">No channel session data for this date.</p>
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
              <h2 style={serifStyle} className="text-sm sm:text-[15px] font-bold text-[#1e3a8a] tracking-tight whitespace-nowrap">
                Top Landing Pages
              </h2>
              <p className="text-[11px] text-gray-400 font-normal -mt-0.5 whitespace-nowrap">
                Top Pages by Views
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
                      {p.title}
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

      {/* 4. Bottom Row: Products & Purchase Activity (2 equal columns) */}
      <div
        className={`gap-4 ${
          isExport ? 'grid grid-cols-2' : 'grid grid-cols-1 lg:grid-cols-2'
        }`}
      >
        {/* Top Product Views */}
        <div className="bg-[#fffdfa] rounded-xl p-4 sm:p-5 border border-[#fef3c7]/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#ffedd5] text-[#9a3412] flex items-center justify-center text-xs shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h2 style={serifStyle} className="text-sm sm:text-[15px] font-bold text-[#78350f] tracking-tight whitespace-nowrap">
                Top Product Views
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
        </div>

        {/* Purchase Activity */}
        <div className="bg-[#fff8f8] rounded-xl p-4 sm:p-5 border border-[#fee2e2]/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-xs shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 style={serifStyle} className="text-sm sm:text-[15px] font-bold text-[#881337] tracking-tight whitespace-nowrap">
                Purchase Activity
              </h2>
            </div>

            {/* Main Purchased Product Card */}
            {reportData?.purchases && reportData.purchases.length > 0 ? (
              reportData.purchases.length === 1 ? (
                <div className="space-y-3 mt-2">
                  {reportData.purchases.slice(0, 1).map((item, idx) => {
                    const curr = item.orderCurrency || 'NPR';
                    const isUsd = curr === 'USD';
                    const orderTotalFormatted = isUsd
                      ? `$${Number(item.orderTotal || 0).toFixed(2)}`
                      : `NPR ${Number(item.amount || item.orderTotal || 0).toLocaleString()}`;
                    const productPriceFormatted = isUsd
                      ? `$${Number(item.productPrice || 0).toFixed(2)}`
                      : `NPR ${Number(item.productPrice || item.amount || 0).toLocaleString()}`;
                    const shippingCostFormatted = isUsd
                      ? `$${Number(item.shippingCost || 0).toFixed(2)}`
                      : `NPR ${Number(item.shippingCost || 0).toLocaleString()}`;

                    return (
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3.5">
                        <img
                          src={item.image}
                          alt={item.title}
                          crossOrigin="anonymous"
                          className="w-24 sm:w-28 h-36 sm:h-40 object-cover rounded-xl shadow-xs border border-rose-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1 w-full">
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
                          <div className="mt-2 inline-flex items-center space-x-1.5 bg-[#fef2f2] text-[#991b1b] border border-[#fecdd3] px-3 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
                            <span className="w-3.5 h-3.5 rounded-full bg-[#991b1b] text-white flex items-center justify-center text-[9px] font-bold">
                              ✓
                            </span>
                            <span>Purchased</span>
                          </div>

                          {/* Order Value: Product price + Shipping */}
                          <div className="mt-2.5 pt-2 border-t border-rose-100/90 space-y-1">
                            <div className="flex items-baseline justify-between gap-1">
                              <span className="text-xs font-bold text-gray-700">Order Value:</span>
                              <span className="text-sm font-extrabold text-gray-900 leading-none">
                                {orderTotalFormatted}
                                {isUsd && item.amount ? (
                                  <span className="text-[11px] font-normal text-gray-500 ml-1.5">
                                    (NPR {Number(item.amount).toLocaleString()})
                                  </span>
                                ) : null}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] bg-rose-50/70 px-2 py-1 rounded-md border border-rose-100/80">
                              <span className="text-gray-600">
                                Product: <strong className="text-gray-900 font-semibold">{productPriceFormatted}</strong>
                              </span>
                              <span className="text-rose-400 font-bold px-1">+</span>
                              <span className="text-gray-600">
                                Shipping: <strong className="text-gray-900 font-semibold">{shippingCostFormatted}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs bg-rose-50/90 px-2.5 py-1.5 rounded-lg border border-rose-100">
                    <span className="font-bold text-[#881337] whitespace-nowrap">
                      Total: {reportData.purchases.length} Confirmed Orders
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                      Verified Transactions
                    </span>
                  </div>
                  <div className={`space-y-2 ${isExport ? '' : 'max-h-[300px] overflow-y-auto pr-1'}`}>
                    {reportData.purchases.slice(0, isExport ? 3 : undefined).map((item, idx) => {
                      const curr = item.orderCurrency || 'NPR';
                      const isUsd = curr === 'USD';
                      const orderTotalFormatted = isUsd
                        ? `$${Number(item.orderTotal || 0).toFixed(2)}`
                        : `NPR ${Number(item.amount || item.orderTotal || 0).toLocaleString()}`;
                      const productPriceFormatted = isUsd
                        ? `$${Number(item.productPrice || 0).toFixed(2)}`
                        : `NPR ${Number(item.productPrice || item.amount || 0).toLocaleString()}`;
                      const shippingCostFormatted = isUsd
                        ? `$${Number(item.shippingCost || 0).toFixed(2)}`
                        : `NPR ${Number(item.shippingCost || 0).toLocaleString()}`;

                      return (
                        <div key={idx} className="flex items-start space-x-2.5 p-2 bg-white rounded-lg border border-rose-100/80 shadow-2xs">
                          <img
                            src={item.image}
                            alt={item.title}
                            crossOrigin="anonymous"
                            className="w-12 h-14 object-cover rounded-md border border-rose-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <h4
                              style={serifStyle}
                              className="font-bold text-gray-900 text-xs leading-snug truncate block"
                              title={item.title}
                            >
                              {item.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs mt-1">
                              <span className="text-[11px] font-bold text-gray-600">Order Value:</span>
                              <span className="font-extrabold text-gray-900 text-xs whitespace-nowrap">
                                {orderTotalFormatted}
                                {isUsd && item.amount ? (
                                  <span className="text-[10px] font-normal text-gray-500 ml-1">
                                    (NPR {Number(item.amount).toLocaleString()})
                                  </span>
                                ) : null}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-600 flex items-center justify-between bg-rose-50/80 px-2 py-0.5 rounded border border-rose-100/90 mt-1">
                              <span>Prod: <strong className="text-gray-900 font-semibold">{productPriceFormatted}</strong></span>
                              <span className="text-rose-400 font-bold px-1">+</span>
                              <span>Ship: <strong className="text-gray-900 font-semibold">{shippingCostFormatted}</strong></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {isExport && reportData.purchases.length > 3 && (
                      <p className="text-[11px] text-center text-rose-700 font-medium pt-1">
                        + {reportData.purchases.length - 3} more verified orders in this period
                      </p>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white/80 p-5 rounded-xl border border-dashed border-rose-200 text-center my-auto py-8">
                <span className="text-3xl block mb-1">🛒</span>
                <p className="text-xs font-bold text-gray-700">No Confirmed Purchases</p>
                <p className="text-[11px] text-gray-400 mt-0.5">No orders completed in this period.</p>
              </div>
            )}
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
  const userRole = session?.user?.role;
  const isAuthorized = 
    userEmail === 'gurungvaaiii@gmail.com' || 
    userEmail === 'traditionalley2050@gmail.com' || 
    userRole === 'admin';

  // Compute yesterday's date string YYYY-MM-DD
  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const yesterdayStr = getYesterdayString();
  const [period, setPeriod] = useState('daily'); // 'daily' | 'weekly' | 'monthly' | '3months' | 'custom'
  const [startDate, setStartDate] = useState(yesterdayStr);
  const [endDate, setEndDate] = useState(yesterdayStr);
  const [customStart, setCustomStart] = useState(yesterdayStr);
  const [customEnd, setCustomEnd] = useState(yesterdayStr);
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

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

  const loadReportData = async (start = startDate, end = endDate, per = period, refresh = false) => {
    setLoading(true);
    try {
      const url = `/api/reports/daily-report?startDate=${start}&endDate=${end}&period=${per}${refresh ? '&refresh=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReportData(data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch report data whenever startDate, endDate, or period changes
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (session && !isAuthorized) return;
    loadReportData(startDate, endDate, period);
  }, [startDate, endDate, period, sessionStatus, isAuthorized]);

  // Handle switching periods
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const yStr = getYesterdayString();
    const [y, m, d] = yStr.split('-').map(Number);
    const yDate = new Date(y, m - 1, d);

    if (newPeriod === 'daily') {
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (newPeriod === 'weekly') {
      // 7-day range
      setStartDate('2026-09-24');
      setEndDate('2026-09-30');
    } else if (newPeriod === 'monthly') {
      setStartDate('2026-09-01');
      setEndDate('2026-09-30');
      setSelectedMonth('2026-09');
    } else if (newPeriod === '3months') {
      // Q3 2026 (Jul 1 – Sep 30)
      setStartDate('2026-07-01');
      setEndDate('2026-09-30');
    } else if (newPeriod === 'custom') {
      setStartDate(customStart);
      setEndDate(customEnd);
    }
  };

  // Report Title dynamically reflecting the active period
  const reportTitle = React.useMemo(() => {
    switch (period) {
      case 'weekly':
        return 'WEEKLY WEBSITE REPORT';
      case 'monthly':
        return 'MONTHLY WEBSITE REPORT';
      case '3months':
        return '3-MONTH WEBSITE REPORT';
      case 'custom':
        return 'CUSTOM WEBSITE REPORT';
      case 'daily':
      default:
        return 'DAILY WEBSITE REPORT';
    }
  }, [period]);

  // Formatted date or range subtitle for display
  const formattedDateSubtitle = React.useMemo(() => {
    if (!startDate) return '';
    const [y1, m1, d1] = startDate.split('-').map(Number);
    const startObj = new Date(y1, m1 - 1, d1);

    if (!endDate || startDate === endDate) {
      return startObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    const [y2, m2, d2] = endDate.split('-').map(Number);
    const endObj = new Date(y2, m2 - 1, d2);
    const diffDays = Math.round((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const startFormatted = startObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: y1 !== y2 ? 'numeric' : undefined,
    });

    const endFormatted = endObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    let extraTag = `${diffDays} Days`;
    if (period === 'weekly') extraTag = 'Weekly · 7 Days';
    if (period === 'monthly') extraTag = startObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (period === '3months') extraTag = 'Quarter · ' + diffDays + ' Days';

    return `${startFormatted} – ${endFormatted} (${extraTag})`;
  }, [startDate, endDate, period]);

  // Short month day: "Sep 28"
  const shortDate = React.useMemo(() => {
    if (!startDate) return '';
    const [year, month, day] = startDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, [startDate]);

  // Handle Download as Image (using dedicated 1000px desktop element for pixel-perfect card output)
  const handleDownloadImage = async () => {
    if (!exportRef.current) return;
    setDownloading(true);

    // Suppress harmless remote css warnings in Next.js development overlay
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && (args[0].includes('Error loading remote css') || args[0].includes('Invalid base URL'))) {
        console.warn('html-to-image remote css warning ignored:', ...args);
        return;
      }
      originalConsoleError.apply(console, args);
    };

    try {
      await new Promise((r) => setTimeout(r, 300));
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: false,
        pixelRatio: 2,
        fontEmbedCSS: REPORT_FONTS_EMBED_CSS,
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      });
      const link = document.createElement('a');
      const filenamePeriod = period.toUpperCase();
      link.download = `Traditional-Alley-${filenamePeriod}-Report-${startDate}${startDate !== endDate ? '-to-' + endDate : ''}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.warn('Initial export with pixelRatio: 2 encountered an issue, retrying with fallback:', err);
      try {
        const fallbackUrl = await toPng(exportRef.current, {
          pixelRatio: 1.5,
          fontEmbedCSS: REPORT_FONTS_EMBED_CSS,
          cacheBust: false,
        });
        const link = document.createElement('a');
        link.download = `Traditional-Alley-${period.toUpperCase()}-Report-${startDate}.png`;
        link.href = fallbackUrl;
        link.click();
      } catch (fallbackErr) {
        console.error('Failed to export report image:', fallbackErr);
        alert('Could not export image. Please try again.');
      }
    } finally {
      console.error = originalConsoleError;
      setDownloading(false);
    }
  };

  // Handle Copy text summary
  const handleCopyText = () => {
    if (!reportData) return;
    const text = `TRADITIONAL ALLEY — ${reportTitle}
Period: ${period.toUpperCase()}
Date Range: ${formattedDateSubtitle}

Traffic:
- Total Active Users: ${reportData.metrics?.activeUsers || 0}
- Sessions: ${reportData.metrics?.sessions || 0}
- Top Channels: ${reportData.topChannels?.map((ch) => `${ch.channel}: ${ch.sessions} (${ch.percentage}%)`).join(', ') || 'N/A'}
- Top Countries: ${reportData.topCountries?.map((c) => `${c.country}: ${c.users}`).join(', ')}
- Top Landing Page: ${reportData.topLandingPages?.[0]?.title} — ${reportData.topLandingPages?.[0]?.views} views

Top Product Views:
${reportData.topProducts?.map((p, i) => `${i + 1}. ${p.title} (${p.views} views)`).join('\n') || 'None'}

Purchase Activity:
- Add to Carts: ${reportData.metrics?.totalCarts || 0}
- Pending Checkouts: ${reportData.metrics?.pendingCheckouts || 0}
- Abandoned Checkouts: ${reportData.metrics?.abandonedCheckouts ?? Math.max(0, (reportData.metrics?.totalCarts || 0) - (reportData.metrics?.pendingCheckouts || 0))}
- Confirmed Orders: ${reportData.purchases?.length || 0}
${reportData.purchases?.map((p) => {
  const curr = p.orderCurrency || 'NPR';
  const isUsd = curr === 'USD';
  const totalVal = isUsd ? `$${Number(p.orderTotal || 0).toFixed(2)}` : `NPR ${Number(p.amount || p.orderTotal || 0).toLocaleString()}`;
  const prodVal = isUsd ? `$${Number(p.productPrice || 0).toFixed(2)}` : `NPR ${Number(p.productPrice || p.amount || 0).toLocaleString()}`;
  const shipVal = isUsd ? `$${Number(p.shippingCost || 0).toFixed(2)}` : `NPR ${Number(p.shippingCost || 0).toLocaleString()}`;
  const nprAddon = isUsd && p.amount ? ` (NPR ${Number(p.amount).toLocaleString()})` : '';
  const dateTag = p.date ? ` [${p.date}]` : '';
  return `- Purchased${dateTag}: ${p.title}
  Order Value: ${totalVal}${nprAddon} [Product: ${prodVal} + Shipping: ${shipVal}]`;
}).join('\n') || '- No confirmed orders'}
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
            The Website Report is restricted exclusively to authorized executive administrators.
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
      {/* Top Header & Global Actions */}
      <div className="max-w-[1000px] mx-auto mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              <span>Website Performance Report</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                Live GA4 & DB
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Automated visual report card matching executive summary template for daily, weekly, monthly, and quarterly briefings.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadReportData(startDate, endDate, period, true)}
            title="Refresh live data from GA4 & Database"
            className="flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 font-medium shadow-xs transition"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Refresh</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 text-xs sm:text-sm bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 font-medium shadow-xs transition"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{copySuccess ? 'Copied!' : 'Copy Text'}</span>
          </button>

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

      {/* Period Selection Tabs & Date Range Controls Card */}
      <div className="max-w-[1000px] mx-auto mb-5 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
        {/* Row 1: Segmented Period Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1 bg-gray-100/90 p-1 rounded-xl">
            {[
              { id: 'daily', label: '📅 Daily' },
              { id: 'weekly', label: '📊 Weekly' },
              { id: 'monthly', label: '🗓️ Monthly' },
              { id: '3months', label: '📈 3 Months' },
              { id: 'custom', label: '⚙️ Custom' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handlePeriodChange(tab.id)}
                className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-lg font-semibold transition ${
                  period === tab.id
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active Range: <strong className="text-gray-800">{formattedDateSubtitle}</strong></span>
          </div>
        </div>

        {/* Row 2: Period-Specific Quick Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {/* DAILY Controls */}
          {period === 'daily' && (
            <>
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-xs text-gray-500 font-medium mr-2">📅 Date:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setEndDate(e.target.value);
                  }}
                  className="text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none bg-transparent cursor-pointer"
                />
              </div>

              {[
                { label: 'Yesterday', date: yesterdayStr },
                { label: 'Sep 29', date: '2026-09-29' },
                { label: 'Sep 28', date: '2026-09-28' },
                { label: 'Sep 27', date: '2026-09-27' },
                { label: 'Sep 26', date: '2026-09-26' },
              ].map((btn) => (
                <button
                  key={btn.date}
                  onClick={() => {
                    setStartDate(btn.date);
                    setEndDate(btn.date);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                    startDate === btn.date && endDate === btn.date
                      ? 'bg-rose-50 text-rose-800 border border-rose-300 font-bold'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </>
          )}

          {/* WEEKLY Controls */}
          {period === 'weekly' && (
            <>
              {[
                { label: 'Sep 24 – Sep 30', start: '2026-09-24', end: '2026-09-30' },
                { label: 'Sep 17 – Sep 23', start: '2026-09-17', end: '2026-09-23' },
                { label: 'Sep 10 – Sep 16', start: '2026-09-10', end: '2026-09-16' },
                { label: 'Sep 3 – Sep 9', start: '2026-09-03', end: '2026-09-09' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    setStartDate(btn.start);
                    setEndDate(btn.end);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                    startDate === btn.start && endDate === btn.end
                      ? 'bg-rose-50 text-rose-800 border border-rose-300 font-bold'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}

              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs text-gray-600">
                <span className="mr-1.5">Week Ending:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const end = e.target.value;
                    if (!end) return;
                    const [y, m, d] = end.split('-').map(Number);
                    const dt = new Date(y, m - 1, d);
                    dt.setDate(dt.getDate() - 6);
                    setStartDate(dt.toISOString().split('T')[0]);
                    setEndDate(end);
                  }}
                  className="font-semibold text-gray-800 bg-transparent cursor-pointer focus:outline-none"
                />
              </div>
            </>
          )}

          {/* MONTHLY Controls */}
          {period === 'monthly' && (
            <>
              {[
                { label: 'September 2026', start: '2026-09-01', end: '2026-09-30', month: '2026-09' },
                { label: 'August 2026', start: '2026-08-01', end: '2026-08-31', month: '2026-08' },
                { label: 'July 2026', start: '2026-07-01', end: '2026-07-31', month: '2026-07' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    setStartDate(btn.start);
                    setEndDate(btn.end);
                    setSelectedMonth(btn.month);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                    startDate === btn.start && endDate === btn.end
                      ? 'bg-rose-50 text-rose-800 border border-rose-300 font-bold'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}

              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs text-gray-600">
                <span className="mr-1.5">Select Month:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedMonth(val);
                    if (val) {
                      const [yr, mn] = val.split('-').map(Number);
                      const lastDay = new Date(yr, mn, 0).getDate();
                      setStartDate(`${val}-01`);
                      setEndDate(`${val}-${String(lastDay).padStart(2, '0')}`);
                    }
                  }}
                  className="font-semibold text-gray-800 bg-transparent cursor-pointer focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 3 MONTHS Controls */}
          {period === '3months' && (
            <>
              {[
                { label: 'Q3 2026 (Jul 1 – Sep 30)', start: '2026-07-01', end: '2026-09-30' },
                { label: 'Q2 2026 (Apr 1 – Jun 30)', start: '2026-04-01', end: '2026-06-30' },
                { label: 'Q1 2026 (Jan 1 – Mar 31)', start: '2026-01-01', end: '2026-03-31' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    setStartDate(btn.start);
                    setEndDate(btn.end);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                    startDate === btn.start && endDate === btn.end
                      ? 'bg-rose-50 text-rose-800 border border-rose-300 font-bold'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </>
          )}

          {/* CUSTOM Controls */}
          {period === 'custom' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-gray-500 mr-1.5 font-medium">From:</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="font-semibold text-gray-800 bg-transparent cursor-pointer focus:outline-none"
                />
              </div>

              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-gray-500 mr-1.5 font-medium">To:</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="font-semibold text-gray-800 bg-transparent cursor-pointer focus:outline-none"
                />
              </div>

              <button
                onClick={() => {
                  setStartDate(customStart);
                  setEndDate(customEnd);
                }}
                className="text-xs bg-gray-900 text-white font-semibold px-3.5 py-2 rounded-xl shadow-xs hover:bg-gray-800 transition"
              >
                Apply Range
              </button>
            </div>
          )}
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
          formattedDate={formattedDateSubtitle}
          shortDate={shortDate}
          isExport={false}
          period={period}
          reportTitle={reportTitle}
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
            formattedDate={formattedDateSubtitle}
            shortDate={shortDate}
            isExport={true}
            period={period}
            reportTitle={reportTitle}
          />
        </div>
      </div>
    </div>
  );
}
