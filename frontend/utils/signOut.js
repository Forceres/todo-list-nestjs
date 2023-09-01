const signOutButton = document.getElementById('signOutButton');
const signOutButtonContainer = document.getElementById(
  'signOutButtonContainer'
);

if (sessionStorage.getItem('token')) {
  signOutButtonContainer.style.display = 'block';
  signOutButton.addEventListener('click', function () {
    sessionStorage.clear();
    signOutButtonContainer.style.display = 'none';
    if (document.title !== 'Main') window.location.replace('../index.html');
    else document.location.reload();
  });
}
