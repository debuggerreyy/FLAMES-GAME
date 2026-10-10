const bgMusic = document.getElementById("bgMusic");

if (bgMusic) {
  bgMusic.volume = 0.35;

  // Try to play as soon as the game opens
  bgMusic.play().catch(() => {
    // If Chrome blocks autoplay, start after the first interaction
    const startMusic = () => {
      bgMusic.play().catch(console.error);
    };

    document.addEventListener("click", startMusic, { once: true });
    document.addEventListener("keydown", startMusic, { once: true });
  });
}
const outcomes = {
  F: {
    title: "FRIENDS",
    file: "friends.gif",
    description: "A friendship full of laughter and wonderful memories! 💛"
  },
  L: {
    title: "LOVERS",
    file: "lovers.gif",
    description: "A romantic connection in your FLAMES universe! 💕"
  },
  A: {
    title: "AFFECTIONATE",
    file: "affectionate.gif",
    description: "Sweetness, care, and plenty of affection! 🥰"
  },
  M: {
    title: "MARRIAGE",
    file: "marriage.gif",
    description: "Wedding bells in this playful prediction! 💍"
  },
  E: {
    title: "ENEMIES",
    file: "enemies.gif",
    description: "Uh-oh! A little rivalry in your FLAMES universe! 😂"
  },
  S: {
    title: "SIBLINGS",
    file: "siblings.gif",
    description: "A bond full of teasing, caring, and chaos! 😆"
  }
};

// Screen elements
const inputScreen = document.getElementById("inputScreen");
const loadingScreen = document.getElementById("loadingScreen");
const resultScreen = document.getElementById("resultScreen");

// Form elements
const name1Input = document.getElementById("name1");
const name2Input = document.getElementById("name2");
const playBtn = document.getElementById("playBtn");
const againBtn = document.getElementById("againBtn");
const error = document.getElementById("error");

// Loading elements
const loadingMessage = document.getElementById("loadingMessage");

// Result elements
const resultGif = document.getElementById("resultGif");
const resultTitle = document.getElementById("resultTitle");
const resultDescription = document.getElementById("resultDescription");

let gameTimer = null;
let messageTimer = null;
let gameRunning = false;

// Normalize names for the FLAMES calculation.
function cleanName(name) {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

// Standard FLAMES letter-cancellation calculation.
function getFlamesResult(firstName, secondName) {
  const first = cleanName(firstName).split("");
  const second = cleanName(secondName).split("");

  for (let i = 0; i < first.length; i++) {
    if (first[i] === null) continue;

    const matchIndex = second.indexOf(first[i]);

    if (matchIndex !== -1) {
      first[i] = null;
      second[matchIndex] = null;
    }
  }

  const count =
    first.filter(letter => letter !== null).length +
    second.filter(letter => letter !== null).length;

  if (count === 0) return null;

  let flames = ["F", "L", "A", "M", "E", "S"];
  let index = 0;

  while (flames.length > 1) {
    index = (index + count - 1) % flames.length;
    flames.splice(index, 1);
  }

  return flames[0];
}

// Display exactly one screen at a time.
function showScreen(screen) {
  inputScreen.classList.add("hidden");
  loadingScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  screen.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });
}

function clearGameTimers() {
  if (gameTimer !== null) {
    clearTimeout(gameTimer);
    gameTimer = null;
  }

  if (messageTimer !== null) {
    clearInterval(messageTimer);
    messageTimer = null;
  }
}

// Start the game.
async function playGame() {
  if (gameRunning) return;

  const firstName = name1Input.value.trim();
  const secondName = name2Input.value.trim();

  error.textContent = "";

  if (!firstName || !secondName) {
    error.textContent = "Please enter both names first! ❤️";
    return;
  }

  if (!cleanName(firstName) || !cleanName(secondName)) {
    error.textContent =
      "Please enter names containing English letters.";
    return;
  }

  const code = getFlamesResult(firstName, secondName);

  if (!code) {
    error.textContent =
      "All letters matched! Try another pair of names.";
    return;
  }

  const outcome = outcomes[code];

  gameRunning = true;
  playBtn.disabled = true;

  // PRELOAD the result GIF while the loading screen is visible.
  const image = new Image();
  image.src = `gif/${outcome.file}`;

  // Show ONLY the loading screen.
  showScreen(loadingScreen);

  

  const messages = [
    "Analyzing your names...",
    "Matching your letters...",
    "Consulting the FLAMES universe...",
    "Preparing your destiny..."
  ];

  let messageIndex = 0;
  loadingMessage.textContent = messages[0];

  messageTimer = setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    loadingMessage.textContent = messages[messageIndex];
  }, 700);

  

  // Guarantee a minimum loading duration of 2.8 seconds.
  const minimumLoading = new Promise(resolve => {
    gameTimer = setTimeout(resolve, 2800);
  });

  try {
    // Wait for the loading time and the actual result image.
    await Promise.all([
      minimumLoading,
      image.decode()
    ]);

    resultGif.src = image.src;
    resultGif.alt = `${outcome.title} relationship result`;
    resultTitle.textContent = outcome.title;
    resultDescription.textContent = outcome.description;

    // Switch directly to the result. No form or loader remains.
    clearGameTimers();
    showScreen(resultScreen);

  } catch (err) {
    clearGameTimers();

    // Return to the entry screen if the result GIF is missing.
    showScreen(inputScreen);

    error.textContent =
      `Could not load gif/${outcome.file}. Check its filename and folder.`;

  } finally {
    gameRunning = false;
    playBtn.disabled = false;
  }
}

// Reveal button
playBtn.addEventListener("click", playGame);

// Press Enter in either input to start.
[name1Input, name2Input].forEach(input => {
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      playGame();
    }
  });
});

// Return to the entry screen.
againBtn.addEventListener("click", () => {
  clearGameTimers();

  gameRunning = false;
  playBtn.disabled = false;

  name1Input.value = "";
  name2Input.value = "";
  error.textContent = "";

  resultGif.removeAttribute("src");

  showScreen(inputScreen);
  name1Input.focus();
});