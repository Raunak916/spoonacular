//config
const API_KEY = "92bebb1431fd443790f0e3a34ed65bbc"; //
const API_BASE = "https://api.spoonacular.com/recipes/complexSearch";

//state
let currentUserId = null;
let currentRecipeId = null;
let currentRecipes = [];

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
  const cacheKey = `search_${query}_${diet}_v2`;

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
  const url = `${API_BASE}?apiKey=${API_KEY}&query=${query}&diet=${diet}&addRecipeInformation=true&addRecipeNutrition=true&number=9`;

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
  currentRecipes = recipes;

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Ready in ${recipe.readyInMinutes} mins</p>
            <button class="view-btn" onclick="showRecipeDetails(${recipe.id})">📖 View Recipe</button>
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

  const rating = document.getElementById("reviewRating").value;
  const comment = document.getElementById("reviewText").value;

  await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipeId: currentRecipeId,
      userId: currentUserId,
      rating,
      comment,
    }),
  });

  alert("Review Submitted!");
  closeModal();
}

function closeModal() {
  document.getElementById("reviewModal").style.display = "none";
}

async function showRecipeDetails(recipeId) {
  console.log("Fetching details for ID:", recipeId);
  if (!recipeId) return;
  document.getElementById("recipeDetailModal").style.display = "block";
  document.getElementById("detailTitle").innerText = "Loading...";

  try {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=true`;
    const response = await fetch(url);
    const recipe = await response.json();

    document.getElementById("detailTitle").innerText = recipe.title;
    document.getElementById("detailImage").src = recipe.image;
    document.getElementById("detailTime").innerText = recipe.readyInMinutes;
    document.getElementById("detailServings").innerText = recipe.servings;

    const ingList = document.getElementById("detailIngredients");
    if (recipe.extendedIngredients) {
      ingList.innerHTML = recipe.extendedIngredients
        .map((ing) => `<li>${ing.original}</li>`)
        .join("");
    } else {
      ingList.innerHTML = "<li>Ingredients info missing.</li>";
    }

    const instList = document.getElementById("detailInstructions");
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
      instList.innerHTML = recipe.analyzedInstructions[0].steps
        .map((step) => `<li>${step.step}</li>`)
        .join("");
    } else {
      instList.innerHTML = "<li>Instructions not provided by source URL.</li>";
    }

    const nutDiv = document.getElementById("detailNutrition");
    if (recipe.nutrition && recipe.nutrition.nutrients) {
      const nutrients = recipe.nutrition.nutrients.filter((n) =>
        ["Calories", "Protein", "Fat", "Carbohydrates"].includes(n.name),
      );
      nutDiv.innerHTML = nutrients
        .map(
          (n) =>
            `<span><strong>${n.name}:</strong> ${n.amount}${n.unit}</span>`,
        )
        .join(" | ");
    } else {
      nutDiv.innerHTML = "Nutrition info not available.";
    }
  } catch (error) {
    console.error(error);
    alert("Failed to load recipe details.");
    closeRecipeModal();
  }
 
}

function closeRecipeModal() {
  document.getElementById("recipeDetailModal").style.display = "none";
}
