export function cerrarSesion() {
    firebase.auth().signOut().then(() => {
      localStorage.removeItem("usuarioAutenticado");

      sessionStorage.removeItem("recargadoLogin");
      
      window.location.hash = "#login";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }