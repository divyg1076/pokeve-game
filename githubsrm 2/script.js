const pokemonList = [
  { id: 1, name: "Bulbasaur", types: ["grass", "poison"], rate: 78 },
  { id: 4, name: "Charmander", types: ["fire"], rate: 64 },
  { id: 7, name: "Squirtle", types: ["water"], rate: 75 },
  { id: 25, name: "Pikachu", types: ["electric"], rate: 72 },
  { id: 39, name: "Jigglypuff", types: ["fairy"], rate: 69 },
  { id: 52, name: "Meowth", types: ["normal"], rate: 66 },
  { id: 54, name: "Psyduck", types: ["water"], rate: 70 },
  { id: 92, name: "Gastly", types: ["ghost", "poison"], rate: 52 },
  { id: 133, name: "Eevee", types: ["normal"], rate: 74 },
  { id: 143, name: "Snorlax", types: ["normal"], rate: 42 },
  { id: 147, name: "Dratini", types: ["dragon"], rate: 48 },
  { id: 152, name: "Chikorita", types: ["grass"], rate: 71 }
];

const typeColors = {
  all: "#20294a",
  grass: "#4dbb73",
  poison: "#a865c9",
  fire: "#f06b4a",
  water: "#4b9de8",
  electric: "#e6b322",
  fairy: "#e777b2",
  normal: "#9ba0ad",
  ghost: "#7662aa",
  dragon: "#6073d9"
};

let currentPokemon = pokemonList[3];
let selectedType = "all";
let score = 0;
let balls = 8;
let caughtPokemon = new Set();

const image = document.getElementById("pokemonImage");
const pokemonName = document.getElementById("pokemonName");
const pokemonNumber = document.getElementById("pokemonNumber");
const typeBadges = document.getElementById("typeBadges");
const catchRate = document.getElementById("catchRate");
const progressFill = document.getElementById("progressFill");
const rateText = document.getElementById("rateText");
const message = document.getElementById("message");
const catchBtn = document.getElementById("catchBtn");
const ballsEl = document.getElementById("balls");
const scoreEl = document.getElementById("score");
const collection = document.getElementById("collection");
const caughtCount = document.getElementById("caughtCount");
const totalCount = document.getElementById("totalCount");
const dexProgress = document.getElementById("dexProgress");
const typeFilters = document.getElementById("typeFilters");
const pokemonCount = document.getElementById("pokemonCount");
const toast = document.getElementById("toast");

function pokemonImageUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function titleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function drawFilters() {
  const filters = ["all", "grass", "fire", "water", "electric", "normal", "fairy", "ghost", "dragon"];

  typeFilters.innerHTML = filters.map(type => `
    <button class="type-btn ${type === selectedType ? "active" : ""}" data-type="${type}">
      ${type === "all" ? "✦ All types" : titleCase(type)}
    </button>
  `).join("");

  document.querySelectorAll(".type-btn").forEach(button => {
    button.addEventListener("click", () => {
      selectedType = button.dataset.type;
      drawFilters();

      const available = getAvailablePokemon();
      currentPokemon = available[Math.floor(Math.random() * available.length)];
      displayPokemon();
    });
  });
}

function getAvailablePokemon() {
  if (selectedType === "all") return pokemonList;

  const filtered = pokemonList.filter(pokemon =>
    pokemon.types.includes(selectedType)
  );

  return filtered.length ? filtered : pokemonList;
}

function displayPokemon() {
  image.src = pokemonImageUrl(currentPokemon.id);
  image.alt = currentPokemon.name;
  pokemonName.textContent = currentPokemon.name;
  pokemonNumber.textContent = `#${String(currentPokemon.id).padStart(4, "0")}`;
  catchRate.textContent = `${currentPokemon.rate}%`;
  rateText.textContent = `${currentPokemon.rate}%`;
  progressFill.style.width = `${currentPokemon.rate}%`;
  message.textContent = `A wild ${currentPokemon.name} appeared nearby!`;
  catchBtn.disabled = false;

  typeBadges.innerHTML = currentPokemon.types.map(type => `
    <span class="badge" style="background:${typeColors[type]}">${type}</span>
  `).join("");

  image.style.animation = "none";
  requestAnimationFrame(() => {
    image.style.animation = "";
  });
}

function drawCollection() {
  collection.innerHTML = pokemonList.map(pokemon => `
    <div class="dex-slot ${caughtPokemon.has(pokemon.id) ? "caught" : ""}" title="${pokemon.name}">
      <img src="${pokemonImageUrl(pokemon.id)}" alt="${pokemon.name}">
    </div>
  `).join("");

  caughtCount.textContent = caughtPokemon.size;
  totalCount.textContent = pokemonList.length;
  dexProgress.style.width = `${(caughtPokemon.size / pokemonList.length) * 100}%`;
}

function updateStats() {
  scoreEl.textContent = String(score).padStart(4, "0");
  ballsEl.textContent = balls;
  document.getElementById("level").textContent =
    String(Math.max(1, Math.floor(score / 300) + 1)).padStart(2, "0");
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function findNewPokemon() {
  const available = getAvailablePokemon();
  const otherPokemon = available.filter(pokemon => pokemon.id !== currentPokemon.id);

  currentPokemon = otherPokemon.length
    ? otherPokemon[Math.floor(Math.random() * otherPokemon.length)]
    : available[0];

  balls = Math.min(balls + 1, 10);
  updateStats();
  displayPokemon();
}

function catchPokemon() {
  if (balls <= 0) {
    message.textContent = "You need more Poké Balls. Find another encounter!";
    showToast("Out of Poké Balls");
    return;
  }

  balls--;
  catchBtn.disabled = true;
  updateStats();
  message.textContent = `Throwing a Poké Ball at ${currentPokemon.name}...`;

  const alreadyCaught = caughtPokemon.has(currentPokemon.id);
  const success = Math.random() * 100 < currentPokemon.rate;

  setTimeout(() => {
    if (success) {
      if (!alreadyCaught) {
        caughtPokemon.add(currentPokemon.id);
        score += 100;
      } else {
        score += 25;
      }

      updateStats();
      drawCollection();
      message.textContent = `Gotcha! ${currentPokemon.name} was caught!`;
      showToast(alreadyCaught ? "+25 points — duplicate caught!" : "+100 points — new entry!");

      document.getElementById("pokemonStage").style.transform = "scale(0.98)";
      setTimeout(() => {
        document.getElementById("pokemonStage").style.transform = "";
        findNewPokemon();
      }, 1000);
    } else {
      message.textContent = `Oh no! ${currentPokemon.name} broke free! Try again.`;
      showToast("It escaped!");
      catchBtn.disabled = false;
    }
  }, 900);
}

document.getElementById("catchBtn").addEventListener("click", catchPokemon);
document.getElementById("newPokemonBtn").addEventListener("click", findNewPokemon);

document.addEventListener("keydown", event => {
  if (event.code === "Space" && !event.repeat) {
    event.preventDefault();
    catchPokemon();
  }
});

pokemonCount.textContent = `${pokemonList.length} Pokémon found`;
drawFilters();
drawCollection();
updateStats();
displayPokemon();