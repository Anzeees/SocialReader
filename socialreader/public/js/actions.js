document.querySelector(".crear").addEventListener("click", function() {
    document.querySelector("#crear-cuenta").style.display = "block";
    document.querySelector(".fondo").style.display = "block";
});

document.querySelector(".cerrar").addEventListener("click", function() {
    document.querySelector("#crear-cuenta").style.display = "none";
    document.querySelector(".fondo").style.display = "none";
});