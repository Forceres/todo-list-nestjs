const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');

passwordInput.addEventListener('input', () => {
  const isValid = passwordInput.checkValidity();

  if (!isValid) {
    passwordInput.classList.add('is-invalid');
  } else {
    passwordInput.classList.remove('is-invalid');
  }

  submitBtn.disabled = !isValid;
});
