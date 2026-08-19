export default function robots() {
  const baseUrl = 'https://traditionalalley.com.np';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/checkout/',
          '/shopping-cart/',
          '/payment-success/',
          '/my-account-order-details/',
          '/auth-debug/',
          '/auth-test/',
          '/debug/',
          '/debug-*',
          '/test-*',
          '/coupon-demo/',
          '/pricing-demo/',
          '/shipping-demo/',
          '/skiper-demo/',
          '/diagnostic/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
