async function chargerListe() {
  try {
    document.getElementById("liste").innerHTML = "Chargement...";

    const reponse = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    const data = await reponse.json();

    const list = data.results
      .map((pokemon, i) => `
        <div class="pokemon" data-name="${pokemon.name}">
        <span class="numero">#${i + 1}</span>
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i+1}.png">
        <h3>${pokemon.name}</h3>
        </div>`)
      .join("");

    document.getElementById("liste").innerHTML = list;

    chargerFiltres();

  } catch (error) {
    window.location.href = "404.html";
  }
}

async function chargerDetail(nom) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nom}`);
    const data = await res.json();

    const statsHTML = data.stats
      .map(s => `<p>${s.stat.name} : ${s.base_stat}</p>`)
      .join("");

    document.getElementById("detail").innerHTML = `
      <h2>${data.name}</h2>
      <img style="height: 120px;" src="${data.sprites.front_default}" />
      ${statsHTML}
    `;

  } catch (error) {
    window.location.href = "404.html";
  }
}

async function chargerFiltres() {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/type");
    const alltypes = await response.json();

    const filters = alltypes.results
      .map(type => `<button class="filter" data-name="${type.name}">${type.name}</button>`)
      .join("");

    document.getElementById("filters").innerHTML = filters;

  } catch (error) {
    window.location.href = "404.html";
  }
}

async function chargerPokemonParType(type) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const data = await response.json();

    const list = data.pokemon
      .map(p => p.pokemon)
      .filter(p => {
        const id = p.url.split("/")[6];
        return id <= 151;
      })
      .map(p => `<button class="pokemon" data-name="${p.name}">${p.name}</button><br>`)
      .join("");

    document.getElementById("liste").innerHTML = list;

  } catch (error) {
    window.location.href = "404.html";
  }
}

/* EVENTS */

// clic Pokémon
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".pokemon");

  if (!btn) return;

  chargerDetail(btn.dataset.name);
});

// clic filtre
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("filter")) {
    chargerPokemonParType(e.target.dataset.name);
  }
});

// init
chargerListe();