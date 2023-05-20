axios
  .get('/auth/profile', {
    headers: {
      Accept: 'application/json',
      Authorization: sessionStorage.getItem('token'),
    },
  })
  .then((response) => {
    const data = response.data;
    renderProfile(data);
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
    } else
      Swal.fire({
        title: 'Error!',
        text: 'Server error!',
        icon: 'error',
        confirmButtonText: 'ОК',
      });
  });

function renderProfile(data) {
  document.getElementById('profile').innerHTML = `
    <li class="list-group-item">
      <h5>Username</h5>
      <p>${data.username}</p>
    </li>
    <li class="list-group-item">
      <h5>Role</h5>
      <p>${data.role.title}</p>
    </li>
    <li class="list-group-item">
      <h5>Quantity of Lists</h5>
      <p>${data.list.length}</p>
    </li>
    <li class="list-group-item">
      <h5>Quantity of Tasks</h5>
      <p>${data.tasks_quantity}</p>
    </li>
    <li class="list-group-item">
      <button class="btn btn-primary w-100" type="button" id="change">Change password</button>
    </li>
  `;
  const changePasswordBtn = document.getElementById('change');
  changePasswordBtn.addEventListener('click', () => {
    window.location.replace('passwordForm.html');
  });
}
