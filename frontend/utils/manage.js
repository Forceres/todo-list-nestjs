const manageButton = document.getElementById('manage');
const manageButtonContainer = document.getElementById('manageButtonContainer');

if (sessionStorage.getItem('token')) {
  manageButtonContainer.style.display = 'block';
}
