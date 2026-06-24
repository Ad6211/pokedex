// Mapping des stats en français
const statNamesFR = {
  "hp": "PV",
  "attack": "Attaque",
  "defense": "Défense",
  "special-attack": "Attaque Spéciale",
  "special-defense": "Défense Spéciale",
  "speed": "Vitesse"
};

// Couleurs des types
const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD"
};

async function chargerListe() {
  try {
    document.getElementById("liste").innerHTML = "Chargement...";

    const reponse = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    const data = await reponse.json();

    const list = await Promise.all(
      data.results.map(async (pokemon, i) => {
        const id = i + 1;
        try {
          const [speciesRes, pokemonRes] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          ]);
          
          const [speciesData, pokemonData] = await Promise.all([
            speciesRes.json(),
            pokemonRes.json()
          ]);
          
          const frenchNameObj = speciesData.names.find(n => n.language.name === "fr");
          const frenchName = frenchNameObj ? frenchNameObj.name : pokemon.name;
          
          const types = pokemonData.types.map(t => t.type.name);
          const mainType = types[0];
          const bgColor = typeColors[mainType] || "#ccc";
          
          return `
            <div class="pokemon" data-name="${pokemon.name}" data-types="${types.join(',')}" style="background-color: ${bgColor}">
            <span class="numero">#${id}</span>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png">
            <h3>${frenchName}</h3>
            <div class="types">
              ${types.map(type => `<span class="type-tag ${type}">${type}</span>`).join('')}
            </div>
            </div>`;
        } catch (e) {
          return `
            <div class="pokemon" data-name="${pokemon.name}">
            <span class="numero">#${id}</span>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">
            <h3>${pokemon.name}</h3>
            </div>`;
        }
      })
    );

    document.getElementById("liste").innerHTML = list.join("");

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
      .map(s => {
        const frenchStatName = statNamesFR[s.stat.name] || s.stat.name;
        return `
        <p>
        ${frenchStatName}
        <br>
        <progress value="${s.base_stat}" max="255"></progress>
        </p>
        `;
      })
      .join("");
    
    // Récupérer le numéro et nom français du Pokémon
    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();
    const frenchNameObj = speciesData.names.find(n => n.language.name === "fr");
    const frenchName = frenchNameObj ? frenchNameObj.name : data.name;
    const pokemonId = data.id;

    document.getElementById("detail").innerHTML = `
      <h2>#${pokemonId} ${frenchName}</h2>
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
    
    const filters = await Promise.all(
      alltypes.results.map(async type => {
        try {
          const typeRes = await fetch(type.url);
          const typeData = await typeRes.json();
          const frenchNameObj = typeData.names.find(n => n.language.name === "fr");
          const frenchName = frenchNameObj ? frenchNameObj.name : type.name;
          
          return `<button class="filter" data-name="${type.name}" style="background-color: ${typeColors[type.name] || '#ccc'};">
          ${frenchName}
          </button>
          `;
        } catch (e) {
          return `<button class="filter" data-name="${type.name}" style="background-color: ${typeColors[type.name] || '#ccc'};">
          ${type.name}
          </button>
          `;
        }
      })
    );

    document.getElementById("filters").innerHTML = filters.join("");

  } catch (error) {
    window.location.href = "404.html";
  }
}

async function chargerPokemonParType(type) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const data = await response.json();

    const list = await Promise.all(
      data.pokemon
        .map(p => p.pokemon)
        .filter(p => {
          const id = p.url.split("/")[6];
          return id <= 151;
        })
        .map(async p => {
          const id = p.url.split("/")[6];
          try {
            const [speciesRes, pokemonRes] = await Promise.all([
              fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
              fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            ]);
            
            const [speciesData, pokemonData] = await Promise.all([
              speciesRes.json(),
              pokemonRes.json()
            ]);
            
            const frenchNameObj = speciesData.names.find(n => n.language.name === "fr");
            const frenchName = frenchNameObj ? frenchNameObj.name : p.name;
            
            const types = pokemonData.types.map(t => t.type.name);
            const mainType = types[0];
            const bgColor = typeColors[mainType] || "#ccc";

            return `
            <div class="pokemon" data-name="${p.name}" data-types="${types.join(',')}" style="background-color: ${bgColor}">
                <span class="numero">#${id}</span>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png">
                <h3>${frenchName}</h3>
                <div class="types">
                  ${types.map(t => `<span class="type-tag ${t}">${t}</span>`).join('')}
                </div>
            </div>
            `;
          } catch (e) {
            return `
            <div class="pokemon" data-name="${p.name}">
                <span class="numero">#${id}</span>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">
                <h3>${p.name}</h3>
            </div>
            `;
          }
        })
    );

    document.getElementById("liste").innerHTML = list.join("");

  } catch (error) {
    window.location.href = "404.html";
  }
}

/* EVENTS */

// clic Pokémon
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".pokemon");

  if (!btn) return;

  // Retirer la classe selected de tous les Pokémon
  document.querySelectorAll('.pokemon').forEach(p => p.classList.remove('selected'));
  
  // Ajouter la classe selected au Pokémon cliqué
  btn.classList.add('selected');

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