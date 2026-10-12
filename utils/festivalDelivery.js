/**
 * Festival Delivery Utility
 * 
 * Handles delivery schedules during the Nepali Dashain festival season.
 * Products in the festive collection (the 20 ready stock items / 12 parent product families)
 * are exempt from holiday delays and are delivered before Dashain.
 * All other products are scheduled for delivery after October 2 due to Dashain holidays.
 */

// Codes of the 20 ready-stock festive items and parent families
export const FESTIVE_EXEMPT_CODES = new Set([
  // Maya Retro Kurthi (TAKMP3 parent, variants TAKMP7, TAKMP6, TAKMP1, TAKMP2)
  'TAKMP7', 'TAKMP6', 'TAKMP1', 'TAKMP2', 'TAKMP3',
  // Glory Pastels (TAKGP2 parent, variant TAKGP1)
  'TAKGP1', 'TAKGP2',
  // Belle (TAGB2 parent, variant TAGB1)
  'TAGB1', 'TAGB2',
  // KUSA Silk Saree (TASK2 parent, variants TASK1, TASK3, TASK4)
  'TASK1', 'TASK2', 'TASK3', 'TASK4',
  // Gleamy Pastels (TAGP1 parent, variant TAGP2)
  'TAGP1', 'TAGP2',
  // Pari Saree & Pari Tie-Dye Saree (TASP2, TASPT2 parents, variants TASP1, TASPT1)
  'TASP1', 'TASP2', 'TASPT1', 'TASPT2',
  // Rose: A velvet Kurtha set (TAKR2 parent, variant TAKR1)
  'TAKR1', 'TAKR2',
  // Zari Brocade Corset (TAZB-01 parent, variant TAZB-02)
  'TAZB-01', 'TAZB-02',
  // Dhaka Corset (TACDC1, TACDC6 parents, variants TACDC2, TACDC3, TACDC4, TACDC5)
  'TACDC1', 'TACDC2', 'TACDC3', 'TACDC4', 'TACDC5', 'TACDC6',
  // Corset Co-ordinates (TACC2 parent, variant TACC1)
  'TACC1', 'TACC2'
].map(c => c.toUpperCase()));

// Document IDs for the 12 festive parent product families & their variants
export const FESTIVE_EXEMPT_DOC_IDS = new Set([
  // Main product document IDs
  'e8f2msx5xjhdrx4g27b75c0s', // PARI SAREE (TASP2)
  'kdhfoimpnny9u0jnt8e5v342', // KUSA SILK SAREE (TASK2)
  'jsud0a4axe8j91rlgm8zhd1v', // GLORY PASTELS (TAKGP2)
  'x8akvrofpwpy6g89rfxnlee1', // ROSE: Velvet Kurtha set (TAKR2)
  'zyo6ws4pzo7rt171lnassvpt', // BELLE (TAGB2)
  'yza3mxoc1njxejniy963bg4u', // CORSET CO-ORDINATES (TACC2)
  'h1m958kaaochnglawc0fgcs8', // PARI TIE-DYE SAREE (TASPT2)
  'ywk2rt17hwcciaw0sn456l2l', // DHAKA CORSET (TACDC1)
  'wrz7ckb8oq09a3ta5e32zspp', // DHAKA CORSET (TACDC6)
  'vdsmi2k1ad2itesdi8nbgrhq', // MAYA RETRO KURTHI (TAKMP3)
  'so7wg3y3omwmbykceobrv36b', // GLEAMY PASTELS: RED (TAGP1)
  'grpgvmw2so1n2tyalsxmhvni', // Zari Brocade Corset (TAZB-01)

  // Variant document IDs
  'b06euv70x8v5l368zl2h63wl', // Glory Pastels Yellow (TAKGP1)
  'bi608i2t7pqtqbebsuy8dnav', // Dhaka Corset (TACDC3)
  'by8jk5emc9sqwo9tw8tsa3e1', // Dhaka Corset Black (TACDC5)
  'c94v61gq1qas6dgh27z8sxfj', // Dhaka Corset Multicolor (TACDC4)
  'd6xdn9efzmjbpi34qemmgpn3', // Maya Retro Peach (TAKMP6)
  'gio2jimotg6pak3y08w5okzq', // Maya Retro Red (TAKMP1)
  'go9fw0itkfslovgecgbf91jr', // KUSA Silk Champagne Blush (TASK4)
  'j3k4zf1kddl2i8hwigo93z4w', // Pari Saree Variant (TASP1)
  'jhabwxb8wqulpjwmne9cshtv', // Rose Velvet Variant (TAKR1)
  'k1ejrcy26h3xwxw0193cau3l', // Belle Green (TAGB1)
  'm5c70qzpe6kiy3vj3x8vvui8', // Maya Retro Pink (TAKMP7)
  'oga9oensvykho17o7rw29xdr', // Maya Retro Navy (TAKMP2)
  'rdmoq3goolqbb6by8z7xvfge', // KUSA Silk Gold (TASK1)
  'rw5smu52tw68fqwr28m8r0kr', // Corset Co-ordinates White (TACC1)
  's34i9aoe9ab2ha3xpnexv6z1', // Pari Tie-Dye Variant (TASPT1)
  'tp5q965cdxnv6yegjf1a1u9z', // Gleamy Pastels Black (TAGP2)
  'wr3dzav6nxtmdx03qmje7ziy', // KUSA Silk Bronze (TASK3)
  'x73w9d1b47u6euv43n579wwe', // Dhaka Corset Red Laligurass (TACDC2)
  'yea4xnbooutqhgtqtx0lllar'  // Zari Brocade Variant (TAZB-02)
]);

/**
 * Checks if a product or variant is exempt from the Dashain delivery delay
 * (i.e. is one of the 20 festive ready-stock products / 12 parent families with 20% festive discount)
 */
export function isDashainExemptProduct(product, fetchedProduct = null) {
  if (!product && !fetchedProduct) return false;

  // 1. Check discount percentage (only these festive products have the 20% festive discount)
  const discount = fetchedProduct?.discountPercentage ?? product?.discountPercentage;
  if (Number(discount) === 20) {
    return true;
  }

  // 2. Check product / variant codes
  const candidateCodes = [
    fetchedProduct?.productCode,
    product?.productCode,
    product?.product_code,
    product?.variantInfo?.product_code,
    product?.variantInfo?.productCode,
    product?.variantInfo?.code,
    product?.code
  ].filter(Boolean);

  for (const code of candidateCodes) {
    const cleanCode = String(code).trim().toUpperCase();
    if (FESTIVE_EXEMPT_CODES.has(cleanCode)) {
      return true;
    }
  }

  // 3. Check document IDs (both parent and variant document IDs)
  const candidateDocIds = [
    product?.baseProductId,
    product?.documentId,
    product?.variantInfo?.documentId,
    product?.variantInfo?.variantId,
    fetchedProduct?.documentId,
    fetchedProduct?.baseProductId
  ].filter(Boolean);

  for (const docId of candidateDocIds) {
    const cleanDocId = String(docId).trim();
    if (FESTIVE_EXEMPT_DOC_IDS.has(cleanDocId)) {
      return true;
    }
  }

  return false;
}

/**
 * Returns delivery status metadata for a product
 */
export function getDashainDeliveryStatus(product, fetchedProduct = null) {
  const isExempt = isDashainExemptProduct(product, fetchedProduct);

  if (isExempt) {
    return {
      isExempt: true,
      badgeText: "Ready Stock • Delivery Before Dashain",
      shortBadgeText: "Dashain Delivery",
      icon: "✨",
      colorClass: "festive-ready"
    };
  }

  return {
    isExempt: false,
    badgeText: "Will be delivered after 2 Oct due to Nepali festival Dashain",
    shortBadgeText: "Delivered after 2 Oct (Dashain)",
    icon: "🚚",
    colorClass: "festive-delayed"
  };
}

/**
 * Checks if an array of selected products contains any item that will be delayed past Oct 2
 */
export function hasDashainDelayedProducts(selectedProducts = [], productsWithOldPrice = {}) {
  if (!selectedProducts || selectedProducts.length === 0) return false;
  return selectedProducts.some(product => {
    const fetchedProduct = productsWithOldPrice[product.id];
    return !isDashainExemptProduct(product, fetchedProduct);
  });
}
