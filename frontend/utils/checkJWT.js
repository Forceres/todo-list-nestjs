const checkJWT = (url) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    axios
      .get('/auth/check', { headers: { Authorization: `${token}` } })
      .then((response) => {
        if (response.data.success) window.location.replace(url);
        else {
          Swal.fire({
            title: 'Error!',
            text: `${response.data.message}`,
            icon: 'error',
            confirmButtonText: 'ОК',
          });
        }
      })
      .catch((error) => {
        if (error.req.status === 401) {
          refreshAccessToken();
        }
        Swal.fire({
          title: 'Error!',
          text: 'Unauthorized!',
          icon: 'error',
          confirmButtonText: 'ОК',
        });
      });
  } else {
    Swal.fire({
      title: 'Error!',
      text: 'Unauthorized!',
      icon: 'error',
      confirmButtonText: 'ОК',
    });
  }
};

const refreshAccessToken = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  axios
    .post('/auth/refresh', {
      headers: {
        'Content-Type': 'application/json',
      },
      refreshToken: refreshToken,
    })
    .then((response) => {
      const newAcessToken = response.data.accessToken;
      sessionStorage.setItem('token', newAcessToken);
    })
    .catch(() => {
      Swal.fire({
        title: 'Error!',
        text: 'Unauthorized!',
        icon: 'error',
        confirmButtonText: 'ОК',
      });
    });
};
