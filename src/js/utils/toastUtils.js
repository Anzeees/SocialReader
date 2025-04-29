export function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toast");
    const toastMensaje = document.getElementById("toastMensaje");
  
    toastMensaje.textContent = mensaje;
    toast.classList.remove("oculto", "toast-success", "toast-error");
  
    toast.classList.add(tipo === "success" ? "toast-success" : "toast-error", "mostrar");
  
    setTimeout(() => {
      toast.classList.remove("mostrar");
      setTimeout(() => toast.classList.add("oculto"), 500);
    }, 2000);
  }