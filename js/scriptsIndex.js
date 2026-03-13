// app.js — Lógica de renderizado

document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".card");

  // Título y subtítulo
  card.querySelector("h1").textContent = DATA.nombre;
  card.querySelector("p").innerHTML =
    DATA.subtitulo + "<br/>" + DATA.directora;

  // Versión
  card.querySelector(".version").textContent = DATA.version;

  // Botones del menú (se generan dinámicamente)
  const btnContainer = document.getElementById("btn-container");
  DATA.menu.forEach(item => {
    const a = document.createElement("a");
    a.href = item.href;
    a.className = "btn-menu " + item.claseExtra;
    a.textContent = item.texto;
    btnContainer.appendChild(a);
  });
});
