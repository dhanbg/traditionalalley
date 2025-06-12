import { useState, useEffect } from 'react';
import Head from 'next/head';
import ShippingPortal from '../components/DHL/ShippingPortal';

export default function ShippingPage() {
    return (
        <>
            <Head>
                <title>DHL Express Shipping | Traditional Alley</title>
                <meta name="description" content="Calculate shipping rates, create shipments, and track packages with DHL Express" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8 px-4">
                <ShippingPortal />
            </div>
        </>
    );
} 