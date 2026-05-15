const { api, authHeaders } = window.recipeCommon;
const node = document.getElementById('favorites');

api('/favorites', { headers: authHeaders() })
  .then((result) => {
    node.innerHTML = '';
    result.data.forEach((recipe) => {
      const card = document.createElement('article');
      card.className = 'card recipe-card';

      const title = document.createElement('h3');
      title.textContent = recipe.title;
      const link = document.createElement('a');
      link.href = `./recipe.html?id=${recipe.id}`;
      link.textContent = 'View';

      const remove = document.createElement('button');
      remove.textContent = 'Remove';
      remove.addEventListener('click', async () => {
        await api(`/favorites/${recipe.id}`, { method: 'DELETE', headers: authHeaders() });
        window.location.reload();
      });

      card.append(title, link, remove);
      node.appendChild(card);
    });
  })
  .catch((error) => {
    node.textContent = error.message;
  });
