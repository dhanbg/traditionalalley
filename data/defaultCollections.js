/**
 * Default collections data for SSR and instant navigation rendering.
 * Ensures Googlebot (Mobile & Desktop) discovers all collection internal links immediately
 * on initial HTML crawl without waiting for client-side API hydration.
 */
export const defaultNavigationCollections = [
  // Women's Collections
  { id: 'kurtha', name: 'Kurtha', slug: 'kurtha', category: { title: 'women' } },
  { id: 'lehenga', name: 'Lehenga', slug: 'lehenga', category: { title: 'women' } },
  { id: 'sareesets', name: 'Saree Sets', slug: 'sareesets', category: { title: 'women' } },
  { id: 'corsets', name: 'Corsets', slug: 'corsets', category: { title: 'women' } },
  { id: 'dresses', name: 'Dresses', slug: 'dresses', category: { title: 'women' } },
  { id: 'gown', name: 'Gowns', slug: 'gown', category: { title: 'women' } },
  { id: 'bosslady', name: 'Boss Lady', slug: 'bosslady', category: { title: 'women' } },
  { id: 'tops', name: 'Tops', slug: 'tops', category: { title: 'women' } },
  { id: 'coordinates', name: 'Co-ord Sets', slug: 'coordinates', category: { title: 'women' } },
  { id: 'graduation', name: 'Graduation Attire', slug: 'graduation', category: { title: 'women' } },

  // Men's Collections
  { id: 'dauracoat', name: 'Daura Suruwal & Coat', slug: 'dauracoat', category: { title: 'men' } },
  { id: 'blazer', name: 'Ethnic Blazers', slug: 'blazer', category: { title: 'men' } },
  { id: 'nepalidhaka', name: 'Nepali Dhaka', slug: 'nepalidhaka', category: { title: 'men' } },

  // Kids' & Event Collections
  { id: 'events', name: 'Festive & Events', slug: 'events', category: { title: 'kids' } },
  { id: 'kids', name: 'Kids Ethnic Wear', slug: 'kids', category: { title: 'kids' } },
];
