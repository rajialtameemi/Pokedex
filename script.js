const pokemonContainer = document.getElementById("pokemon-container");
const loadMoreButton = document.getElementById("load-more");
const searchInput = document.getElementById("search");
const modal = document.getElementById("pokemon-modal");
const modalContent = document.querySelector(".modal-content");
const pokemonDetails = document.getElementById("pokemon-details");
const closeButton = document.querySelector(".close-button");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const typeFilter = document.getElementById("type-filter");
const sortOptions = document.getElementById("sort-options");
const darkModeToggle = document.getElementById("dark-mode-toggle");

let offset = 0;
const limit = 20;
let currentPokemonIndex = 0;
let currentPokemonList = [];
let darkMode = false;
let allPokemon = [];

function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.style.backgroundColor = getPokemonTypeColor(pokemon.types[0].type.name);
  card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${capitalizeFirstLetter(pokemon.name)}</h3>
        <p>${pokemon.types
          .map((type) => capitalizeFirstLetter(type.type.name))
          .join(", ")}</p>
    `;
  card.addEventListener("click", () => showPokemonDetails(pokemon));
  return card;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getPokemonTypeColor(type) {
  const colors = {
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    electric: "#F8D030",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
  };
  return colors[type] || "#68A090";
}

async function fetchPokemon(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const pokemon = await response.json();
  return pokemon;
}

async function loadPokemon(offset, limit) {
  for (let i = offset; i < offset + limit; i++) {
    if (i < allPokemon.length) {
      const pokemon = await fetchPokemon(
        allPokemon[i].url.split("/").reverse()[1]
      );
      currentPokemonList.push(pokemon);
      const card = createPokemonCard(pokemon);
      pokemonContainer.appendChild(card);
    }
  }
}

async function fetchAllPokemon() {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
  const data = await response.json();
  allPokemon = data.results;
  loadPokemon(offset, limit);
}

function createStat(stat, value) {
  return `
        <div class="stat">
            <span class="label">${capitalizeFirstLetter(stat)}</span>
            <span class="value">${value}</span>
        </div>
        <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${value}%; background-color: ${getProgressBarColor(
    value
  )};"></div>
        </div>
    `;
}

function getProgressBarColor(value) {
  if (value > 70) {
    return "#4caf50";
  } else if (value > 40) {
    return "#ffa000";
  } else {
    return "#f44336";
  }
}

function showPokemonDetails(pokemon) {
  currentPokemonIndex = currentPokemonList.indexOf(pokemon);
  pokemonDetails.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${
    pokemon.name
  }" class="large-pokemon-img">
        <h3>${capitalizeFirstLetter(pokemon.name)}</h3>
        <p>Types: ${pokemon.types
          .map((type) => capitalizeFirstLetter(type.type.name))
          .join(", ")}</p>
        <p>ID: ${pokemon.id}</p>
        ${createStat("HP", pokemon.stats[0].base_stat)}
        ${createStat("Attack", pokemon.stats[1].base_stat)}
        ${createStat("Defense", pokemon.stats[2].base_stat)}
        ${createStat("Special Attack", pokemon.stats[3].base_stat)}
        ${createStat("Special Defense", pokemon.stats[4].base_stat)}
        ${createStat("Speed", pokemon.stats[5].base_stat)}
    `;
  modal.style.display = "flex";
}

function showNextPokemon() {
  if (currentPokemonIndex < currentPokemonList.length - 1) {
    currentPokemonIndex++;
    showPokemonDetails(currentPokemonList[currentPokemonIndex]);
  }
}

function showPrevPokemon() {
  if (currentPokemonIndex > 0) {
    currentPokemonIndex--;
    showPokemonDetails(currentPokemonList[currentPokemonIndex]);
  }
}

closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

prevButton.addEventListener("click", showPrevPokemon);
nextButton.addEventListener("click", showNextPokemon);

loadMoreButton.addEventListener("click", () => {
  offset += limit;
  loadPokemon(offset, limit);
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  if (query.length >= 3) {
    filterAndSortPokemon();
  } else {
    pokemonContainer.innerHTML = "";
    currentPokemonList = [];
    offset = 0;
    loadPokemon(offset, limit);
  }
});

typeFilter.addEventListener("change", filterAndSortPokemon);
sortOptions.addEventListener("change", filterAndSortPokemon);

darkModeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
});

function filterAndSortPokemon() {
  const query = searchInput.value.toLowerCase();
  const type = typeFilter.value;
  const sortOption = sortOptions.value;

  const filteredPokemon = currentPokemonList.filter((pokemon) => {
    const matchesType = type
      ? pokemon.types.some((t) => t.type.name === type)
      : true;
    const matchesSearch = pokemon.name.includes(query);
    return matchesType && matchesSearch;
  });

  const sortedPokemon = filteredPokemon.sort((a, b) => {
    if (sortOption === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortOption === "hp") {
      return b.stats[0].base_stat - a.stats[0].base_stat;
    } else {
      return a.id - b.id;
    }
  });

  pokemonContainer.innerHTML = "";
  sortedPokemon.slice(0, limit).forEach((pokemon) => {
    const card = createPokemonCard(pokemon);
    pokemonContainer.appendChild(card);
  });
}

fetchAllPokemon();
