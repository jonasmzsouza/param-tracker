const input = document.getElementById('search');

if (input) {
  input.addEventListener('input', function () {
    const term = this.value.toLowerCase();

    document.querySelectorAll('.sidebar li').forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(term)
        ? 'block'
        : 'none';
    });
  });
}
