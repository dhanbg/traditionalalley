// Utility to build product title - return variant name for variant products

export function getVariantAwareTitle(item) {
  try {
    const variantTitle = item?.variantInfo?.title || item?.variantTitle || item?.selectedVariant?.title || item?.design;
    if (variantTitle && String(variantTitle).trim() !== '' && String(variantTitle).toLowerCase() !== 'default') {
      return String(variantTitle).trim();
    }

    const fullTitle = (item?.title || item?.name || 'N/A').trim();
    if (fullTitle.includes(' - ')) {
      const parts = fullTitle.split(' - ');
      return parts[parts.length - 1].trim();
    }

    return fullTitle;
  } catch (e) {
    return item?.title || item?.name || 'N/A';
  }
}