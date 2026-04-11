/**
 * Bootstrap utility helper to ensure consistent imports across the application
 * This helps prevent the "Cannot read properties of undefined (reading 'Modal')" error
 */

let bootstrapCache = null;

export const getBootstrap = async () => {
  if (bootstrapCache) {
    return bootstrapCache;
  }

  try {
    const bootstrap = await import("bootstrap/dist/js/bootstrap.esm.js");
    
    // Check if bootstrap is properly loaded
    if (!bootstrap && !bootstrap.Modal) {
      throw new Error("Bootstrap Modal is not available");
    }
    
    bootstrapCache = bootstrap;
    return bootstrap;
  } catch (error) {
    console.error("Error loading Bootstrap:", error);
    throw error;
  }
};

export const createModal = async (elementId, options = {}) => {
  try {
    const bootstrap = await getBootstrap();
    const Modal = bootstrap.Modal || bootstrap.default?.Modal;
    
    if (!Modal) {
      throw new Error("Bootstrap Modal constructor is not available");
    }
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }
    
    return new Modal(element, {
      keyboard: false,
      ...options
    });
  } catch (error) {
    console.error(`Error creating modal for element '${elementId}':`, error);
    throw error;
  }
};

export const closeAllModals = async () => {
  try {
    const bootstrap = await getBootstrap();
    const Modal = bootstrap.Modal || bootstrap.default?.Modal;
    
    if (Modal) {
      const modalElements = document.querySelectorAll(".modal.show");
      modalElements.forEach((modal) => {
        const modalInstance = Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      });
    }
  } catch (error) {
    console.error("Error closing modals:", error);
  }
};

export const closeAllOffcanvas = async () => {
  try {
    const bootstrap = await getBootstrap();
    const Offcanvas = bootstrap.Offcanvas || bootstrap.default?.Offcanvas;
    
    if (Offcanvas) {
      const offcanvasElements = document.querySelectorAll(".offcanvas.show");
      offcanvasElements.forEach((offcanvas) => {
        const offcanvasInstance = Offcanvas.getInstance(offcanvas);
        if (offcanvasInstance) {
          offcanvasInstance.hide();
        }
      });
    }
  } catch (error) {
    console.error("Error closing offcanvas:", error);
  }
}; 