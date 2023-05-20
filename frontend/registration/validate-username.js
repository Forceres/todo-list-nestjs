const usernameInput = document.getElementById('username');
const subButton = document.getElementById('submitBtn');

usernameInput.addEventListener('input', () => {
  const isValid = usernameInput.checkValidity();

  if (!isValid) {
    usernameInput.classList.add('is-invalid');
  } else {
    usernameInput.classList.remove('is-invalid');
  }

  subButton.disabled = !isValid;
});
