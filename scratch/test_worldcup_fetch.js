const fetchProductDetails = async () => {
  const url = "http://localhost:1337/api/products?filters[documentId][$eq]=h2mjo6wvr5al30akjd2ckq0g&populate[product_variants][populate]=*&populate[imgSrc][populate]=*";
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': 'Bearer 298a628c1b0284f663ae26c62fda880b9c297128132119ec9a89efb2c1110130d91a33ee68048beda39ee9155e94b1832d7758d7aa8a2191ddf419c3a2028405a218e3acd1e42a374f5b67a6bf4adc25148b13cbb24bb2f8fde9330866a246303e5b19558f89f86feb585655a3c2f0df01ece3ad9c02a351efaecf58fc1f4461',
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (data.data?.length > 0) {
      const product = data.data[0];
      console.log("Product Title:", product.title);
      console.log("Product documentId:", product.documentId);
      console.log("Variants count:", product.product_variants?.length);
      product.product_variants?.forEach((v, idx) => {
        console.log(`Variant ${idx + 1}:`, {
          id: v.id,
          documentId: v.documentId,
          title: v.title,
          price: v.price,
          size_stocks: v.size_stocks,
          color: v.color?.name,
          imgSrc: v.imgSrc?.url
        });
      });
    }
  } catch (error) {
    console.error("Fetch failed:", error.message);
  }
};

fetchProductDetails();
