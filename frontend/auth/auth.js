const loginForm = document.getElementById('authForm');
localStorage.setItem('previousPage', document.referrer);

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const loginData = {
    username: loginForm.elements.username.value,
    password: loginForm.elements.password.value,
    headers: { Accept: 'application/json' },
  };

  axios
    .post('/auth/signin', loginData)
    .then((response) => {
      sessionStorage.setItem('token', `Bearer ${response.data.accessToken}`);
      localStorage.setItem(
        'regreshToken',
        `Bearer ${response.data.regreshToken}`
      );
      window.location.replace('../profile/profile.html');
    })
    .catch((error) => {
      if (error.request.status == 401) {
        Swal.fire({
          title: 'Error!',
          text: 'Incorrect username or password!',
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
