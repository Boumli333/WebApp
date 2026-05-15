const { api, authHeaders, setToken } = window.recipeCommon;
const recipesNode = document.getElementById('recipes');
const pageLabel = document.getElementById('page-label');

let page = 1;
let totalPages = 1;

async function loadRecipes() {
  const search = document.getElementById('search').value.trim();
  const category = document.getElementById('category').value;
  const params = new URLSearchParams({ page: String(page), limit: '12' });
  if (search) params.set('search', search);
  if (category) params.set('category', category);

  const result = await api(`/recipes?${params.toString()}`);
  totalPages = result.pagination.totalPages;
  pageLabel.textContent = `Page ${page} / ${totalPages}`;
  recipesNode.innerHTML = '';

  result.data.forEach((recipe) => {
    const card = document.createElement('article');
    card.className = 'card recipe-card';

    const title = document.createElement('h3');
    title.textContent = recipe.title;

    const description = document.createElement('p');
    description.textContent = recipe.description;

    const categoryNode = document.createElement('small');
    categoryNode.textContent = `Category: ${recipe.category}`;

    const viewLink = document.createElement('a');
    viewLink.href = `./recipe.html?id=${recipe.id}`;
    viewLink.textContent = 'View recipe';

    const favoriteButton = document.createElement('button');
    favoriteButton.textContent = 'Favorite';
    favoriteButton.addEventListener('click', async () => {
      try {
        await api(`/favorites/${recipe.id}`, { method: 'POST', headers: authHeaders() });
        alert('Added to favorites');
      } catch (error) {
        alert(error.message);
      }
    });

    card.append(title, description, categoryNode, viewLink, favoriteButton);
    recipesNode.appendChild(card);
  });
}

document.getElementById('search').addEventListener('input', () => {
  page = 1;
  loadRecipes().catch((error) => alert(error.message));
});

document.getElementById('category').addEventListener('change', () => {
  page = 1;
  loadRecipes().catch((error) => alert(error.message));
});

document.getElementById('prev-page').addEventListener('click', () => {
  page = Math.max(1, page - 1);
  loadRecipes().catch((error) => alert(error.message));
});

document.getElementById('next-page').addEventListener('click', () => {
  page = Math.min(totalPages, page + 1);
  loadRecipes().catch((error) => alert(error.message));
});

document.getElementById('register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') })
    });
    alert('Registered successfully. Please login.');
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') })
    });
    setToken(data.token);
    alert(`Welcome ${data.user.email}`);
  } catch (error) {
    alert(error.message);
  }
});

loadRecipes().catch((error) => alert(error.message));
