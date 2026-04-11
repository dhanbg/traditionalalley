import { createModal, closeAllModals, closeAllOffcanvas } from './bootstrapHelper';

export const openWistlistModal = async () => {
  try {
    // Close any existing modals and offcanvas first
    await closeAllModals();
    await closeAllOffcanvas();
    
    // Create and show the wishlist modal
    const myModal = await createModal("wishlist");
    myModal.show();
    
    // Add event listener for when modal is hidden
    const wishlistElement = document.getElementById("wishlist");
    if (wishlistElement) {
      wishlistElement.addEventListener("hidden.bs.modal", () => {
        myModal.hide();
      });
    }
  } catch (error) {
    console.error("Error opening wishlist modal:", error);
  }
};
