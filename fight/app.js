// combatants — stockent l'objet complet du Pokémon { nom, nomFR, image, stats, types, id }
let combatant1 = null
let combatant2 = null

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

async function chargerCombatant(zoneId, nom) {
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
    
    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();
    const frenchNameObj = speciesData.names.find(n => n.language.name === "fr");
    const frenchName = frenchNameObj ? frenchNameObj.name : data.name;
    const pokemonId = data.id;

    document.getElementById(zoneId).innerHTML = `
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

// charger les données complètes d'un Pokémon
async function chargerDonneesPokemon(nom) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nom}`);
  const data = await res.json();
  
  const speciesRes = await fetch(data.species.url);
  const speciesData = await speciesRes.json();
  const frenchNameObj = speciesData.names.find(n => n.language.name === "fr");
  const frenchName = frenchNameObj ? frenchNameObj.name : data.name;
  
  return {
    nom: data.name,
    nomFR: frenchName,
    id: data.id,
    image: data.sprites.front_default,
    stats: data.stats.map(s => ({
      nom: s.stat.name,
      nomFR: statNamesFR[s.stat.name] || s.stat.name,
      valeur: s.base_stat
    })),
    types: data.types.map(t => t.type.name)
  };
}

// mettre à jour l'affichage d'un slot de combat
function afficherSlot(zoneId, data) {
  const statsHTML = data.stats
    .map(s => `<p>${s.nomFR}<br><progress value="${s.valeur}" max="255"></progress></p>`)
    .join("");
  
  document.getElementById(zoneId).innerHTML = `
    <h2>#${data.id} ${data.nomFR}</h2>
    <img style="height: 120px;" src="${data.image}" />
    ${statsHTML}
  `;
}

// vider un slot
function viderSlot(zoneId) {
  const label = zoneId === "detail" ? "1er Pokémon" : "2e Pokémon";
  document.getElementById(zoneId).innerHTML = `<h2>${label}</h2>`;
}

// clic Pokémon : 1er clic dans detail, 2e clic dans detail2
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".pokemon");

  if (!btn) return;

  const pokemonName = btn.dataset.name;

  // Si on reclique sur le même Pokémon que combatant1 → le retirer
  if (combatant1 && combatant1.nom === pokemonName) {
    combatant1 = null;
    viderSlot("detail");
    document.querySelectorAll('.pokemon').forEach(p => p.classList.remove('selected', 'combatant1', 'combatant2'));
    if (combatant2) {
      btn.classList.add('combatant2');
    }
    document.getElementById("combattez").disabled = true;
    document.getElementById("combattez").textContent = "⚔️ Combattre";
    return;
  }
  
  // Si on reclique sur le même Pokémon que combatant2 → le retirer
  if (combatant2 && combatant2.nom === pokemonName) {
    combatant2 = null;
    viderSlot("detail2");
    document.querySelectorAll('.pokemon').forEach(p => p.classList.remove('selected', 'combatant2'));
    if (combatant1) {
      document.querySelector(`.pokemon[data-name="${combatant1.nom}"]`)?.classList.add('combatant1');
    }
    document.getElementById("combattez").disabled = true;
    document.getElementById("combattez").textContent = "⚔️ Combattre";
    return;
  }

  // Charger les données complètes
  const data = await chargerDonneesPokemon(pokemonName);

  if (!combatant1) {
    // Premier clic → zone 1
    combatant1 = data;
    afficherSlot("detail", data);
    
    document.querySelectorAll('.pokemon').forEach(p => p.classList.remove('selected', 'combatant1', 'combatant2'));
    btn.classList.add('selected');
    btn.classList.add('combatant1');
  } else if (!combatant2) {
    // Deuxième clic → zone 2
    combatant2 = data;
    afficherSlot("detail2", data);
    
    btn.classList.add('combatant2');
    
    document.getElementById("combattez").disabled = false;
    document.getElementById("combattez").textContent = "⚔️ Combattre";
    document.getElementById("resultatCombat").innerHTML = "";
  } else {
    // Troisième clic : remplace combatant1, décale combatant2 → combatant1 si présent
    combatant1 = data;
    combatant2 = null;
    afficherSlot("detail", data);
    viderSlot("detail2");
    
    document.querySelectorAll('.pokemon').forEach(p => p.classList.remove('selected', 'combatant1', 'combatant2'));
    btn.classList.add('selected');
    btn.classList.add('combatant1');
    
    document.getElementById("combattez").disabled = true;
    document.getElementById("combattez").textContent = "⚔️ Combattre";
  }
});

// clic filtre
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("filter")) {
    chargerPokemonParType(e.target.dataset.name);
  }
});

// clic Combattre
document.addEventListener("click", async (e) => {
  if (e.target.id !== "combattez") return;
  
  // Si le bouton est en mode "Recommencer" → réinitialiser
  if (e.target.textContent === "🔄 Recommencer") {
    reinit_fight();
    return;
  }
  
  if (!combatant1 || !combatant2) return;
  
  const total1 = combatant1.stats.reduce((s, stat) => s + stat.valeur, 0);
  const total2 = combatant2.stats.reduce((s, stat) => s + stat.valeur, 0);
  
  // Calculer l'avantage de type dans les deux sens
  let avantage1 = 1;
  let typeFort1 = "";
  let typeFaible1 = "";
  for (const t1 of combatant1.types) {
    for (const t2 of combatant2.types) {
      const val = await avantageType(t1, t2);
      if (val > 1) {
        avantage1 *= val;
        typeFort1 = t1;
        typeFaible1 = t2;
      }
    }
  }
  
  let avantage2 = 1;
  let typeFort2 = "";
  let typeFaible2 = "";
  for (const t1 of combatant2.types) {
    for (const t2 of combatant1.types) {
      const val = await avantageType(t1, t2);
      if (val > 1) {
        avantage2 *= val;
        typeFort2 = t1;
        typeFaible2 = t2;
      }
    }
  }
  
  // Appliquer l'avantage seulement au Pokémon qui en a un
  const score1 = avantage1 > 1 ? total1 * avantage1 : total1;
  const score2 = avantage2 > 1 ? total2 * avantage2 : total2;
  
  let resultatHTML = `
    <h3>⚔️ ${combatant1.nomFR} VS ${combatant2.nomFR}</h3>
    <p>${combatant1.nomFR} : ${total1} pts${avantage1 > 1 ? ' ×' + avantage1 + ' (' + typeFort1 + ' > ' + typeFaible1 + ')' : ''} = ${score1}</p>
    <p>${combatant2.nomFR} : ${total2} pts${avantage2 > 1 ? ' ×' + avantage2 + ' (' + typeFort2 + ' > ' + typeFaible2 + ')' : ''} = ${score2}</p>
  `;
  
  if (score1 > score2) {
    resultatHTML += `<h2>🏆 Le gagnant est ${combatant1.nomFR} !</h2>`;
  } else if (score2 > score1) {
    resultatHTML += `<h2>🏆 Le gagnant est ${combatant2.nomFR} !</h2>`;
  } else {
    resultatHTML += `<h2>🤝 Égalité !</h2>`;
  }
  
  document.getElementById("combattez").textContent = "🔄 Recommencer";
  document.getElementById("resultatCombat").innerHTML = resultatHTML;
});

// Vérifie si type1 a un avantage sur type2
// Retourne : 2 (type1 fort), 0.5 (type1 faible), 1 (neutre)
async function avantageType(type1, type2) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${type1}`);
    const data = await res.json();
    if (data.damage_relations.double_damage_to.some(t => t.name === type2)) return 2;
    if (data.damage_relations.half_damage_to.some(t => t.name === type2)) return 0.5;
    if (data.damage_relations.no_damage_to.some(t => t.name === type2)) return 0;
    return 1;
  } catch (e) {
    return 1;
  }
}

function reinit_fight() {
  combatant1 = null;
  combatant2 = null;
  viderSlot("detail");
  viderSlot("detail2");
  document.getElementById("combattez").disabled = true;
  document.getElementById("combattez").textContent = "⚔️ Combattre";
  document.getElementById("resultatCombat").innerHTML = "";
  document.querySelectorAll('.pokemon').forEach(p => p.classList.remove('selected', 'combatant1', 'combatant2'));
}

// init
chargerListe();