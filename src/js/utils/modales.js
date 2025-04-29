export function mostrarModalError(mensaje, redireccion = null) {
    const modal = document.getElementById("modalError");
    const texto = document.getElementById("mensajeError");
    const btnCerrar = document.getElementById("btnCerrarModal");
  
    if (!modal || !texto || !btnCerrar) {
      console.warn("Modal de error no disponible en esta vista.");
      return;
    }
  
    texto.textContent = mensaje;
    modal.classList.remove("oculto");
  
    btnCerrar.onclick = () => {
      modal.classList.add("oculto");
      if (redireccion) {
        window.location.hash = redireccion;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    };
  }