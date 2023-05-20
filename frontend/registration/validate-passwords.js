const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('password-validate');
const submitButton = document.getElementById('submitBtn');

confirmPasswordField.addEventListener('input', function () {
  if (passwordField.value !== confirmPasswordField.value) {
    confirmPasswordField.classList.add('is-invalid');
    submitButton.disabled = true;
  } else {
    confirmPasswordField.classList.remove('is-invalid');
    submitButton.disabled = false;
  }
});
