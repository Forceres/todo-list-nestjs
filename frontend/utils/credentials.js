const credentialsButton = document.getElementById('credentials');
const credentialsButtonContainer = document.getElementById(
  'credentialsButtonContainer'
);

if (sessionStorage.getItem('token')) {
  credentialsButtonContainer.style.display = 'block';
}
