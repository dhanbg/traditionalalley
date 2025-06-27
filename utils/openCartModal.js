import { createModal, closeAllModals, closeAllOffcanvas } from './bootstrapHelper';

export const openCartModal = async () => {
  try {
    // Close any existing modals and offcanvas first
    await closeAllModals();
    await closeAllOffcanvas();
    
    // Create and show the cart modal
    const myModal = await createModal("shoppingCart");
    myModal.show();
    
    // Add event listener for when modal is hidden
    const shoppingCartElement = document.getElementById("shoppingCart");
    if (shoppingCartElement) {
      shoppingCartElement.addEventListener("hidden.bs.modal", () => {
        myModal.hide();
      });
    }
  } catch (error) {
    console.error("Error opening cart modal:", error);
  }
};
