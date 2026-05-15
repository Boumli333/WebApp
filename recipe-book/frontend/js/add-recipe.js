const { api, authHeaders } = window.recipeCommon;

function parseIngredients(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, quantity, unit] = line.split('|').map((part) => part.trim());
      return { name, quantity: Number(quantity), unit };
    });
}

document.getElementById('add-recipe-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = {
    title: form.get('title'),
    description: form.get('description'),
    category: form.get('category'),
    baseServingSize: Number(form.get('baseServingSize')),
    steps: form.get('steps'),
    ingredients: parseIngredients(form.get('ingredients'))
  };

  try {
    await api('/recipes', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    alert('Recipe added');
    event.currentTarget.reset();
  } catch (error) {
    alert(error.message);
  }
});
