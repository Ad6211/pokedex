async function chargerListe() {
  const reponse = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
  const data = await reponse.json();

  const list = data.results
    .map(pokemon => `<button class="pokemon" data-name="${pokemon.name}">${pokemon.name}</button>`)
    .join("");

  document.getElementById("liste").innerHTML = list;
}
async function chargerDetail(nom) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nom}`);
  const data = await res.json();

  const statsHTML = data.stats
    .map(s => `<p>${s.stat.name} : ${s.base_stat}</p>`)
    .join("");

  document.getElementById("detail").innerHTML = `
    <h2>${data.name}</h2>
    <img src="${data.sprites.front_default}" />
    ${statsHTML}
  `;
}

// 👇 clic sur TOUS les boutons
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".pokemon");

  if (!btn) return;

  console.log("click :", btn.dataset.name);

  chargerDetail(btn.dataset.name);
});

chargerListe();