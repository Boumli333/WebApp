const { api } = window.recipeCommon;
const detailsNode = document.getElementById('recipe-details');

function getRecipeId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderRecipe(recipe) {
  const steps = recipe.steps
    .split('\n')
    .filter(Boolean)
    .map((step) => `<li>${step}</li>`)
    .join('');

  detailsNode.innerHTML = `
    <h2>${recipe.title}</h2>
    <p>${recipe.description}</p>
    <p><strong>Category:</strong> ${recipe.category}</p>
    <label>Serving Size
      <input id="serving-size" type="number" min="1" value="${recipe.base_serving_size}" />
    </label>
    <h3>Ingredients</h3>
    <ul id="ingredient-list"></ul>
    <h3>Steps</h3>
    <ol>${steps}</ol>
  `;

  const list = document.getElementById('ingredient-list');
  const servingInput = document.getElementById('serving-size');

  function redrawIngredients() {
    const factor = Number(servingInput.value) / recipe.base_serving_size;
    list.innerHTML = '';
    recipe.ingredients.forEach((ingredient) => {
      const li = document.createElement('li');
      const amount = (Number(ingredient.quantity) * factor).toFixed(2).replace(/\.00$/, '');
      li.textContent = `${ingredient.name}: ${amount} ${ingredient.unit}`;
      list.appendChild(li);
    });
  }

  servingInput.addEventListener('input', redrawIngredients);
  redrawIngredients();
}

api(`/recipes/${getRecipeId()}`)
  .then(renderRecipe)
  .catch((error) => {
    detailsNode.textContent = error.message;
  });
