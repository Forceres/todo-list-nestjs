const firstPasswordInput = document.getElementById('first-password');
const secondPasswordInput = document.getElementById('second-password');
const submitBtn = document.getElementById('submitBtn');
const backBtn = document.getElementById('backBtn');
const passForm = document.getElementById('passForm');

firstPasswordInput.addEventListener('input', () => {
  const isValid = firstPasswordInput.checkValidity();
  if (!isValid) {
    firstPasswordInput.classList.add('is-invalid');
  } else {
    firstPasswordInput.classList.remove('is-invalid');
  }
  submitBtn.disabled = !isValid;
});

secondPasswordInput.addEventListener('input', function () {
  if (firstPasswordInput.value !== secondPasswordInput.value) {
    secondPasswordInput.classList.add('is-invalid');
    submitBtn.disabled = true;
  } else {
    secondPasswordInput.classList.remove('is-invalid');
    submitBtn.disabled = false;
  }
});

passForm.addEventListener('submit', (event) => {
  event.preventDefault();
  axios
    .put(
      '/auth/update',
      { password: secondPasswordInput.value },
      {
        headers: {
          Accept: 'application/json',
          Authorization: sessionStorage.getItem('token'),
        },
      }
    )
    .then(() => {
      const successNotification = document.getElementById(
        'success-notification'
      );
      successNotification.classList.remove('d-none');

      setTimeout(function () {
        successNotification.classList.add('d-none');
        window.location.replace('profile.html');
      }, 3000);
    })
    .catch((error) => {
      if (error.request.status === 401) {
        refreshAccessToken();
        Swal.fire({
          title: 'Error!',
          text: 'Unauthorized!',
          icon: 'error',
          confirmButtonText: 'ОК',
        });
      } else if (error.request.status === 400) {
        Swal.fire({
          title: 'Error!',
          text: 'You entered your previous password!',
          icon: 'error',
          confirmButtonText: 'ОК',
        });
      } else
        Swal.fire({
          title: 'Error!',
          text: 'Server error!',
          icon: 'error',
          confirmButtonText: 'ОК',
        });
    });
});

backBtn.addEventListener('click', () => {
  window.location.replace('profile.html');
});
