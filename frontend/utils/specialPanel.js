const panelButtonContainer = document.getElementById('panelButtonContainer');
const panelButton = document.getElementById('panelButton');

const checkRole = () => {
  if (sessionStorage.getItem('token')) {
    axios
      .get('/auth/check/role', {
        headers: {
          Accept: 'application/json',
          Authorization: sessionStorage.getItem('token'),
        },
      })
      .then((response) => {
        if (response.data.success) {
          panelButtonContainer.style.display = 'block';
          panelButton.addEventListener('click', () => {
            if (document.title !== 'Main')
              window.location.replace('../panel/panel.html');
            else window.location.replace('/panel/panel.html');
          });
        } else panelButtonContainer.style.display = 'none';
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
  }
};

checkRole();
