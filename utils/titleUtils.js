// Utility to build product title

export function getVariantAwareTitle(item) {
  try {
    return item?.title || item?.name || 'N/A';
  } catch (e) {
    return item?.title || item?.name || 'N/A';
  }
}