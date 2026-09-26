import { createModal, closeAllModals, closeAllOffcanvas } from './bootstrapHelper';

export const openCartModal = async () => {
  try {
    // Close any existing modals and offcanvas first
    await closeAllModals();
    await closeAllOffcanvas();
    
    // Wait for the modal element to be mounted (CartModal is dynamically loaded with ssr: false)
    let shoppingCartElement = document.getElementById("shoppingCart");
    let attempts = 0;
    while (!shoppingCartElement && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 80));
      shoppingCartElement = document.getElementById("shoppingCart");
      attempts++;
    }

    // Create and show the cart modal
    const myModal = await createModal("shoppingCart");
    myModal.show();
    
    // Add event listener for when modal is hidden
    if (shoppingCartElement) {
      const handleHidden = () => {
        try {
          myModal.hide();
        } catch (e) {}
      };
      shoppingCartElement.addEventListener("hidden.bs.modal", handleHidden, { once: true });
    }
  } catch (error) {
    console.error("Error opening cart modal:", error);
  }
};
