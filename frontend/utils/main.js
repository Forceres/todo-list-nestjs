const mainButton = document.getElementById('main');

if (mainButton) {
  mainButton.addEventListener('click', () => {
    if (document.title !== 'Main') window.location.replace('../index.html');
    else window.location.reload();
  });
}
