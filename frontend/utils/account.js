const accountButton = document.getElementById('account');
const accountButtonContainer = document.getElementById(
  'accountButtonContainer'
);

if (sessionStorage.getItem('token')) {
  accountButtonContainer.style.display = 'block';
}
