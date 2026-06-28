// Utility to build a clean variant-aware product title
// Format: "BASE : VARIANT" or return base title + variant info cleanly

export function getVariantAwareTitle(item) {
  try {
    const baseTitle = (item?.title || item?.name || 'N/A').trim();

    const rawVariant = [
      item?.variantInfo?.title,
      item?.variantTitle,
      item?.selectedVariant?.title,
      item?.selectedVariant?.color,
      item?.selectedColor,
      item?.design
    ].find(Boolean);

    if (rawVariant) {
      const variantStr = String(rawVariant).trim();
      if (variantStr && variantStr.toLowerCase() !== 'default') {
        // If baseTitle already contains the variant string, return baseTitle formatted cleanly
        if (baseTitle.toLowerCase().includes(variantStr.toLowerCase())) {
          return baseTitle.replace(/\s*-\s*/g, ' : ');
        }
        
        // Extract base product root (part before hyphen or colon)
        const baseRoot = baseTitle.split(/[\-:]/)[0].trim();
        return `${baseRoot} : ${variantStr}`;
      }
    }

    return baseTitle.replace(/\s*-\s*/g, ' : ');
  } catch (e) {
    return item?.title || item?.name || 'N/A';
  }
}