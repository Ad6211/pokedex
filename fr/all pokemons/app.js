// Mapping des noms de types en français
const typeNamesFR = {
  normal: "Normal",
  fire: "Feu",
  water: "Eau",
  electric: "Électrik",
  grass: "Plante",
  ice: "Glace",
  fighting: "Combat",
  poison: "Poison",
  ground: "Sol",
  flying: "Vol",
  psychic: "Psy",
  bug: "Insecte",
  rock: "Roche",
  ghost: "Spectre",
  dragon: "Dragon",
  dark: "Ténèbres",
  steel: "Acier",
  fairy: "Fée"
};

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

const LOT_SIZE = 10;

async function chargerLots(total, offset) {
  const lot = [];
  for (let i = offset; i < Math.min(offset + LOT_SIZE, total); i++) {
    const id = i + 1;
    try {
      const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const pokemonData = await pokemonRes.json();
      const types = pokemonData.types.map(t => t.type.name);
      const mainType = types[0];
      const bgColor = typeColors[mainType] || "#ccc";
      
      let frenchName = "";
      try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        if (speciesRes.ok) {
          const speciesData = await speciesRes.json();
          const frenchNameObj = speciesData.names.find(n => n.language.name === "fr");
          if (frenchNameObj) frenchName = frenchNameObj.name;
        }
      } catch (e) { /* Ignore */ }
      
      // Choisir l'URL du sprite selon l'ID
      const spriteUrl = id <= 1025
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
        : pokemonData.sprites.front_default;
      
      lot.push(`
        <div class="pokemon" data-name="${pokemonData.name}" data-types="${types.join(',')}" style="background-color: ${bgColor}">
        <span class="numero">#${id}</span>
        <img src="${spriteUrl}">
        <h3>${frenchName || pokemonData.name}</h3>
        <div class="types">
          ${types.map(type => `<span class="type-tag ${type}">${typeNamesFR[type] || type}</span>`).join('')}
        </div>
        </div>`);
    } catch (e) {
      lot.push(`
        <div class="pokemon" data-name="pokemon-${id}">
        <span class="numero">#${id}</span>
        <h3>#${id}</h3>
        </div>`);
    }
  }
  return lot;
}

async function chargerListe() {
  try {
    document.getElementById("liste").innerHTML = "Chargement...";

    const reponse = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10000");
    const data = await reponse.json();
    const total = data.results.length;
    
    const list = [];
    for (let offset = 0; offset < total; offset += LOT_SIZE) {
      const lot = await chargerLots(total, offset);
      list.push(...lot);
      
      // Mettre à jour la liste progressivement
      document.getElementById("liste").innerHTML = list.join("");
      
      // Petit délai entre les lots
      await new Promise(resolve => setTimeout(resolve, 200));
    }

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

            const spriteUrl = id <= 1025
              ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
              : pokemonData.sprites.front_default;
            
            return `
            <div class="pokemon" data-name="${p.name}" data-types="${types.join(',')}" style="background-color: ${bgColor}">
                <span class="numero">#${id}</span>
                <img src="${spriteUrl}">
                <h3>${frenchName}</h3>
                <div class="types">
                  ${types.map(t => `<span class="type-tag ${t}">${typeNamesFR[t] || t}</span>`).join('')}
                </div>
            </div>
            `;
          } catch (e) {
            return `
            <div class="pokemon" data-name="${p.name}">
                <span class="numero">#${id}</span>
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