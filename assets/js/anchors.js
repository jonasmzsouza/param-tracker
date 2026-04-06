document.querySelectorAll('h2,h3').forEach((h) => {
  if (!h.id) {
    h.id = h.textContent.toLowerCase().replace(/\s+/g, '-');
  }

  const anchor = document.createElement('a');

  anchor.href = '#' + h.id;
  anchor.className = 'anchor';
  anchor.innerHTML = '¶';

  h.appendChild(anchor);
});
