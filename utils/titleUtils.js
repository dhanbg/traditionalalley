// Utility to build a clean variant-aware product title
// Format: "BASE : VARIANT" and avoid duplicate base names in variant labels

export function getVariantAwareTitle(item) {
  try {
    const baseTitle = (item?.title || item?.name || 'N/A').trim();
    const baseRoot = (baseTitle.includes(':') ? baseTitle.split(':')[0] : baseTitle).trim();

    const rawCandidates = [
      item?.variantTitle,
      item?.variantInfo?.title,
      item?.selectedVariant?.title,
      item?.selectedColor,
      item?.selectedVariant?.color,
      item?.design
    ].filter(Boolean);

    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const cleanCandidate = (c) => {
      let s = String(c).trim();
      let lc = s.toLowerCase();
      if (!s || lc === 'default' || lc === 'variant' || lc === '(variant)') return '';
      // If the candidate contains a colon/hyphen, prefer the part after the separator
      if (s.includes(':')) s = s.split(':').pop().trim();
      else if (/[\-–—]/.test(s)) s = s.split(/[\-–—]/).pop().trim();
      // Strip leading baseRoot if embedded
      const baseRe = new RegExp(`^${escapeRegExp(baseRoot)}\s*[:\-]?\s*`, 'i');
      s = s.replace(baseRe, '').trim();
      lc = s.toLowerCase();
      if (!s || lc === 'default' || lc === baseRoot.toLowerCase()) return '';
      return s;
    };

    const normalized = rawCandidates.map(cleanCandidate).find(Boolean);

    if (!normalized) {
      return baseTitle.replace(/\s*-\s*/g, ' : ');
    }

    return `${baseRoot} : ${normalized}`;
  } catch (e) {
    return item?.title || item?.name || 'N/A';
  }
}