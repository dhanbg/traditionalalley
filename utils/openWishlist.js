export const openWistlistModal = async () => {
  const bootstrap = await import("bootstrap"); // dynamically import bootstrap
  const modalElements = document.querySelectorAll(".modal.show");
  modalElements.forEach((modal) => {
    const modalInstance = bootstrap.default.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }
  });

  // Close any open offcanvas
  const offcanvasElements = document.querySelectorAll(".offcanvas.show");
  offcanvasElements.forEach((offcanvas) => {
    const offcanvasInstance = bootstrap.default.Offcanvas.getInstance(offcanvas);
    if (offcanvasInstance) {
      offcanvasInstance.hide();
    }
  });
  var myModal = new bootstrap.default.Modal(document.getElementById("wishlist"), {
    keyboard: false,
  });

  myModal.show();
  document
    .getElementById("wishlist")
    .addEventListener("hidden.bs.modal", () => {
      myModal.hide();
    });
};
