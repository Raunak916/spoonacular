//config
const API_KEY = "92bebb1431fd443790f0e3a34ed65bbc"; // <--- PUT YOUR KEY HERE
const API_BASE = "https://api.spoonacular.com/recipes/complexSearch";

//state
let currentUserId = null;
let currentRecipeId = null;

async function createProfile() {
  const username = document.getElementById("username").value;
  const diet = document.getElementById("userDiet").value;
  const allergies = document.getElementById("allergies").value;

  if (!username) return alert("Please enter a name.");

  try {
    // Send data to our MySQL Backend
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, diet, allergies }),
    });

    const data = await response.json();

    if (data.userId) {
      currentUserId = data.userId;
      alert(`Welcome ${username}! Profile saved.`);
      // Auto-fill the search filter based on their preferences
      if (diet) document.getElementById("searchDiet").value = diet;
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Failed to connect to server.");
  }
}

async function searchRecipes() {
  const query = document.getElementById("query").value;
  const diet = document.getElementById("searchDiet").value;

  // iss search ke liye ek unique cache key for local storage
  const cacheKey = `search_${query}_${diet}`;

  //check cache
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    console.log("Serving from cache");
    displayRecipes(JSON.parse(cachedData));
    return;
  }

  //yaa fir spoonacular se fetch karlo
  console.log("Fetching from API...");

  //addRecipeInformation=true se hume recipe ke details bhi milenge, jisse hum review section me use karenge
  const url = `${API_BASE}?apiKey=${API_KEY}&query=${query}&diet=${diet}&addRecipeInformation=true&number=9`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 402)
        return alert("API Limit Reached (Daily quota exceeded)");
      throw new Error("API Error");
    }

    const data = await response.json();

    localStorage.setItem(cacheKey, JSON.stringify(data.results)); //cache me store karlo
    displayRecipes(data.results);
  } catch (error) {
    console.error("API Error:", error);
    alert("Error fetching recipes. Check your API Key.");
  }
}

function displayRecipes(recipes) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!recipes || recipes.length === 0) {
    container.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Ready in ${recipe.readyInMinutes} mins</p>
            <button onclick="openReview(${recipe.id}, '${recipe.title.replace(/'/g, "")}')">Rate & Review</button>
        `;
    container.appendChild(card);
  });
}

async function openReview(recipeId, title) {
  currentRecipeId = recipeId;
  document.getElementById("modalTitle").innerText = "Rate: " + title;
  document.getElementById("reviewModal").style.display = "block";

  // Fetch existing reviews from MySQL
  try {
    const response = await fetch(`/api/reviews/${recipeId}`);
    const reviews = await response.json();

    const list = document.getElementById("existingReviews");
    list.innerHTML = reviews.length
      ? ""
      : "<p>No reviews yet. Be the first!</p>";

    reviews.forEach((r) => {
      list.innerHTML += `
                <div class="review-item">
                    <strong>Rating: ${r.rating}/5</strong>
                    <p>${r.comment}</p>
                </div>`;
    });
  } catch (err) {
    console.error(err);
  }
}


async function submitReview() {
    if (!currentUserId) return alert("Please create a profile first (Step 1)!");

    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewText').value;

    await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            recipeId: currentRecipeId, 
            userId: currentUserId, 
            rating, 
            comment 
        })
    });

    alert("Review Submitted!");
    closeModal();
}

function closeModal() {
    document.getElementById('reviewModal').style.display = 'none';
}