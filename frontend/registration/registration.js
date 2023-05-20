localStorage.setItem('previousPage', document.referrer);
const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const registerData = {
    username: registerForm.elements.username.value,
    password: registerForm.elements.password.value,
    headers: { Accept: 'application/json' },
  };

  axios
    .post('/auth/signup', registerData)
    .then(() => {
      window.location.replace('../auth/auth.html');
    })
    .catch((error) => {
      if (error.request.status == 400) {
        Swal.fire({
          title: 'Error!',
          text: 'The user with this username already exists!',
          icon: 'error',
          confirmButtonText: 'ОК',
        });
      } else if (error.request.status == 405) {
        Swal.fire({
          title: 'Error!',
          text: 'Not allowed!',
          icon: 'error',
          confirmButtonText: 'ОК',
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Server Error!',
          icon: 'error',
          confirmButtonText: 'ОК',
        });
      }
    });
});
