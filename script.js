const elements = {
  pokemonContainer: document.getElementById("pokemon-container"),
  loadMoreButton: document.getElementById("load-more"),
  searchInput: document.getElementById("search"),
  modal: document.getElementById("pokemon-modal"),
  pokemonDetails: document.getElementById("pokemon-details"),
  closeButton: document.querySelector(".close-button"),
  prevButton: document.getElementById("prev-button"),
  nextButton: document.getElementById("next-button"),
  typeFilter: document.getElementById("type-filter"),
  sortOptions: document.getElementById("sort-options"),
  darkModeToggle: document.getElementById("dark-mode-toggle"),
  favoritesButton: document.getElementById("favorites-button"),
  homeButton: document.getElementById("home-button"),
  loadMoreModalButton: document.getElementById("load-more-modal")
};

let state = {
  offset: 0,
  limit: 20,
  currentPokemonIndex: 0,
  currentPokemonList: [],
  darkMode: localStorage.getItem("darkMode") === "true",
  allPokemon: [],
  favorites: JSON.parse(localStorage.getItem("favorites")) || []
};

document.body.classList.toggle("dark-mode", state.darkMode);

const saveFavorites = () => localStorage.setItem("favorites", JSON.stringify(state.favorites));

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getColor = (type) => ({
  fire: "#F08030", water: "#6890F0", grass: "#78C850", electric: "#F8D030",
  ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0", ground: "#E0C068",
  flying: "#A890F0", psychic: "#F85888", bug: "#A8B820", rock: "#B8A038",
  ghost: "#705898", dragon: "#7038F8", dark: "#705848", steel: "#B8B8D0",
  fairy: "#EE99AC", default: "#68A090"
}[type] || "#68A090");

const createCard = (pokemon) => {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.style.backgroundColor = getColor(pokemon.types[0].type.name);
  card.innerHTML = `
    <img class="pokemon-img" src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}">
    <h3>${capitalize(pokemon.name)}</h3>
    <p>${pokemon.types.map((t) => capitalize(t.type.name)).join(", ")}</p>
    <button class="favorite-button" data-id="${pokemon.id}">${state.favorites.includes(pokemon.id) ? "★" : "☆"}</button>
  `;
  card.querySelector(".favorite-button").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(pokemon.id);
  });
  card.addEventListener("click", () => showDetails(pokemon));
  return card;
};

const fetchPokemon = async (id) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return await response.json();
};

const loadPokemon = async (offset, limit) => {
  for (let i = offset; i < offset + limit && i < state.allPokemon.length; i++) {
    const id = state.allPokemon[i].url.split("/").reverse()[1];
    const pokemon = await fetchPokemon(id);
    state.currentPokemonList.push(pokemon);
    elements.pokemonContainer.appendChild(createCard(pokemon));
  }
};

const fetchAllPokemon = async () => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
  state.allPokemon = (await response.json()).results;
  loadPokemon(state.offset, state.limit);
};

const createStat = (stat, value) => `
  <div class="stat">
    <span class="label">${capitalize(stat)}</span>
    <span class="value">${value}</span>
  </div>
  <div class="progress-bar">
    <div class="progress-bar-fill" style="width: ${value}%; background-color: ${getProgressBarColor(value)};"></div>
  </div>
`;

const getProgressBarColor = (value) => value > 70 ? "#4caf50" : value > 40 ? "#ffa000" : "#f44336";

const showDetails = (pokemon) => {
  state.currentPokemonIndex = state.currentPokemonList.indexOf(pokemon);
  elements.pokemonDetails.innerHTML = `
    <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}" class="large-pokemon-img">
    <h3>${capitalize(pokemon.name)}</h3>
    <p>Types: ${pokemon.types.map((t) => capitalize(t.type.name)).join(", ")}</p>
    <p>ID: ${pokemon.id}</p>
    ${createStat("HP", pokemon.stats[0].base_stat)}
    ${createStat("Attack", pokemon.stats[1].base_stat)}
    ${createStat("Defense", pokemon.stats[2].base_stat)}
    ${createStat("Special Attack", pokemon.stats[3].base_stat)}
    ${createStat("Special Defense", pokemon.stats[4].base_stat)}
    ${createStat("Speed", pokemon.stats[5].base_stat)}
    <button class="favorite-button-modal" data-id="${pokemon.id}">${state.favorites.includes(pokemon.id) ? "★" : "☆"}</button>
  `;
  elements.modal.style.display = "flex";
  elements.prevButton.style.display = state.currentPokemonIndex === 0 ? "none" : "inline-block";
  if (state.currentPokemonIndex === state.currentPokemonList.length - 1) {
    elements.nextButton.style.display = "none";
    elements.loadMoreModalButton.style.display = "inline-block";
  } else {
    elements.nextButton.style.display = "inline-block";
    elements.loadMoreModalButton.style.display = "none";
  }

  // Update favorite button in modal
  document.querySelector(".favorite-button-modal").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(pokemon.id);
  });
};

const showNextPokemon = () => {
  if (state.currentPokemonIndex < state.currentPokemonList.length - 1) {
    showDetails(state.currentPokemonList[++state.currentPokemonIndex]);
  }
  elements.nextButton.style.display = state.currentPokemonIndex === state.currentPokemonList.length - 1 ? "none" : "inline-block";
  elements.loadMoreModalButton.style.display = state.currentPokemonIndex === state.currentPokemonList.length - 1 ? "inline-block" : "none";
};

const showPrevPokemon = () => {
  if (state.currentPokemonIndex > 0) {
    showDetails(state.currentPokemonList[--state.currentPokemonIndex]);
  }
  elements.nextButton.style.display = "inline-block";
  elements.loadMoreModalButton.style.display = "none";
};

const toggleFavorite = (pokemonId) => {
  const index = state.favorites.indexOf(pokemonId);
  index > -1 ? state.favorites.splice(index, 1) : state.favorites.push(pokemonId);
  saveFavorites();
  updateFavoriteButton(pokemonId);
};

const updateFavoriteButton = (pokemonId) => {
  document.querySelectorAll(`.favorite-button[data-id="${pokemonId}"]`).forEach(button => {
    button.textContent = state.favorites.includes(pokemonId) ? "★" : "☆";
  });

  // Update favorite button in modal
  const modalButton = document.querySelector(`.favorite-button-modal[data-id="${pokemonId}"]`);
  if (modalButton) {
    modalButton.textContent = state.favorites.includes(pokemonId) ? "★" : "☆";
  }
};

const filterAndSortPokemon = () => {
  const query = elements.searchInput.value.toLowerCase();
  const type = elements.typeFilter.value;
  const sortOption = elements.sortOptions.value;

  const filtered = state.currentPokemonList.filter((p) => {
    const matchesType = type ? p.types.some((t) => t.type.name === type) : true;
    const matchesSearch = p.name.includes(query) || p.types.some((t) => t.type.name.includes(query));
    return matchesType && matchesSearch;
  });

  const sorted = filtered.sort((a, b) => {
    if (sortOption === "name") return a.name.localeCompare(b.name);
    if (sortOption === "hp") return b.stats[0].base_stat - a.stats[0].base_stat;
    return a.id - b.id;
  });

  elements.pokemonContainer.innerHTML = "";
  sorted.slice(0, state.limit).forEach((pokemon) => elements.pokemonContainer.appendChild(createCard(pokemon)));
};

const displayFavorites = () => {
  elements.pokemonContainer.innerHTML = "";
  state.favorites.forEach(async (id) => {
    const pokemon = await fetchPokemon(id);
    elements.pokemonContainer.appendChild(createCard(pokemon));
  });
};

elements.closeButton.addEventListener("click", () => elements.modal.style.display = "none");

window.addEventListener("click", (e) => {
  if (e.target === elements.modal) elements.modal.style.display = "none";
});

elements.prevButton.addEventListener("click", showPrevPokemon);
elements.nextButton.addEventListener("click", showNextPokemon);

elements.loadMoreButton.addEventListener("click", () => {
  state.offset += state.limit;
  loadPokemon(state.offset, state.limit);
});

elements.loadMoreModalButton.addEventListener("click", () => {
  state.offset += state.limit;
  loadPokemon(state.offset, state.limit).then(() => {
    showDetails(state.currentPokemonList[state.currentPokemonIndex]);
  });
});

let debounceTimer;
elements.searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const query = elements.searchInput.value.toLowerCase();
    if (query.length >= 3) {
      filterAndSortPokemon();
    } else {
      elements.pokemonContainer.innerHTML = "";
      state.currentPokemonList = [];
      state.offset = 0;
      loadPokemon(state.offset, state.limit);
    }
  }, 300);
});

elements.typeFilter.addEventListener("change", filterAndSortPokemon);
elements.sortOptions.addEventListener("change", filterAndSortPokemon);

elements.darkModeToggle.addEventListener("click", () => {
  state.darkMode = !state.darkMode;
  localStorage.setItem("darkMode", state.darkMode);
  document.body.classList.toggle("dark-mode", state.darkMode);
});

elements.favoritesButton.addEventListener("click", () => {
  elements.pokemonContainer.innerHTML = "";
  state.currentPokemonList = [];
  state.offset = 0;
  displayFavorites();
});

elements.homeButton.addEventListener("click", () => {
  elements.pokemonContainer.innerHTML = "";
  state.currentPokemonList = [];
  state.offset = 0;
  fetchAllPokemon();
});

fetchAllPokemon();
