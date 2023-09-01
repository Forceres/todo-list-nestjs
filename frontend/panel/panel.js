let userData;
let pageCount;
let pages;
let currentPageIndex = 0;
localStorage.setItem('previousPage', document.referrer);

function getUsers() {
  axios
    .get('/users', {
      headers: {
        Accept: 'application/json',
        Authorization: sessionStorage.getItem('token'),
      },
    })
    .then((response) => {
      const excludedUser = localStorage.getItem('personal_username');
      userData = response.data.filter((user) => user.username != excludedUser);
      countItems(userData);
      renderPage(0);
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
}

getUsers();

function countItems(userData) {
  const itemsPerPage = 5;
  pageCount = Math.ceil(userData.length / itemsPerPage);
  pages = Array.from({ length: pageCount }, (_, i) =>
    userData.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
  );
}

function renderPage(pageIndex) {
  currentPageIndex = pageIndex;
  const currentPage = pages[pageIndex];
  const userElements = currentPage.map(
    (userElement) => `
        <li class="list-group-item">
          <button type="button" class="btn btn-link link-dark" data-bs-toggle="modal" data-bs-target="#userModal" data-user-id="${userElement.id}">
          <h5>${userElement.username}</h5>
          </button>
        </li>
      `
  );
  document.getElementById('users').innerHTML = `
        <ul class="list-group">
          ${userElements.join('')}
        </ul>
      `;
  document.querySelectorAll('button[data-user-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const userId = event.currentTarget.getAttribute('data-user-id');
      const data = userData.find((user) => user.id === userId);
      const modalTitle = document.querySelector('#userModal .modal-title');
      const modalBody = document.querySelector('#userModal .modal-body');
      modalTitle.textContent = data.username;
      modalBody.innerHTML = `
              <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-left">ID: ${
                      data.id
                    }</li>
                    <li class="list-group-item d-flex justify-content-left">Created at: ${
                      data.createdAt
                    }</li>
                    <li class="list-group-item d-flex justify-content-left">Updated at: ${
                      data.updatedAt
                    }</li>
                    <li class="list-group-item d-flex justify-content-left">Tasks' quantity: ${
                      data.tasks_quantity
                    }</li>
                    <li class="list-group-item d-flex justify-content-left" id="role">Role: ${
                      data.role.title
                    }</li>
                    ${
                      data.list.length === 0
                        ? `<li class="list-group-item d-flex justify-content-left">User doesn't have any lists</li>`
                        : `<li class="list-group-item btn btn-link d-flex justify-content-left"><button type="button" class="btn btn-link link-dark px-0" data-list-id="${data.id}">Lists</button></li>`
                    }
              </ul>
            `;
      const listsButton = document.querySelector('button[data-list-id]');
      if (listsButton) {
        listsButton.addEventListener('click', () => {
          localStorage.setItem('lists_info', JSON.stringify(data.list));
          window.location.replace('../lists/lists.html');
        });
      }
      localStorage.setItem('user_info', JSON.stringify(data));
    });

    renderPagination(currentPageIndex);
  });
}
function renderPagination(currentPageIndex) {
  const paginationElements = Array.from(
    { length: pageCount },
    (_, i) => `
        <li class="page-item ${i === currentPageIndex ? 'active' : ''}">
          <a class="page-link" href="#" onclick="renderPage(${i})">${i + 1}</a>
        </li>
      `
  );
  document.getElementById('pagination').innerHTML = `
        <li class="page-item ${currentPageIndex === 0 ? 'disabled' : ''}">
          <a class="page-link" href="#" onclick="renderPage(${
            currentPageIndex - 1
          })">Previous</a>
        </li>
        ${paginationElements.join('')}
        <li class="page-item ${
          currentPageIndex === pageCount - 1 ? 'disabled' : ''
        }">
          <a class="page-link" href="#" onclick="renderPage(${
            currentPageIndex + 1
          })">Next</a>
        </li>
      `;
}

function remove(username) {
  const user_id = userData.find((user) => user.username === username).id;
  axios
    .delete('/users/' + user_id, {
      headers: {
        Accept: 'application/json',
        Authorization: sessionStorage.getItem('token'),
      },
    })
    .then(() => {
      const userModalEl = document.getElementById('userModal');
      const userModal = bootstrap.Modal.getInstance(userModalEl);
      if (userModal) {
        userModal.hide();
      }
      const updatedUserData = userData.filter((user) => user.id !== user_id);
      userData = updatedUserData;
      countItems(userData);
      renderPage(currentPageIndex);
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
          text: 'Server Error!',
          icon: 'error',
          confirmButtonText: 'ОК',
        });
    });
}

function createCancelBtn() {
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.classList.add('btn', 'btn-primary', 'w-50', 'me-1');
  return cancelBtn;
}

function createEditBtn() {
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.type = 'submit';
  editBtn.classList.add('btn', 'btn-primary', 'w-50');
  return editBtn;
}

function edit(username) {
  const userModalEl = document.getElementById('userModal');
  const originalModalContent = userModalEl.innerHTML;
  userModalEl.addEventListener('hidden.bs.modal', function () {
    userModalEl.innerHTML = originalModalContent;
  });
  const editTitleBtn = document.querySelector('#edit');
  editTitleBtn.disabled = true;
  const user_id = userData.find((user) => user.username === username).id;
  let modalTitleEl = document.querySelector('#userModal .modal-title');
  let modalFooterEl = document.querySelector('#userModal .modal-footer');
  const form = document.createElement('form');
  form.classList.add('w-100', 'needs-validation');
  form.id = 'modalForm';
  modalFooterEl.appendChild(form);
  modalFooterEl = document.getElementById('modalForm');
  let activeCheckboxInput;
  const inputContainer = document.createElement('div');
  inputContainer.classList.add('container-fluid', 'form-group');
  const outerCheckboxContainer = document.createElement('div');
  outerCheckboxContainer.classList.add('container-fluid');
  const innerCheckboxContainer = document.createElement('div');
  innerCheckboxContainer.classList.add(
    'd-flex',
    'justify-content-between',
    'align-items-center'
  );
  // First checkbox
  const firstCheckboxInput = document.createElement('input');
  firstCheckboxInput.type = 'checkbox';
  firstCheckboxInput.id = 'btn-check-outlined';
  firstCheckboxInput.classList.add('btn-check');
  firstCheckboxInput.setAttribute('autocomplete', 'on');
  firstCheckboxInput.checked =
    JSON.parse(localStorage.getItem('user_info')).role.title === 'USER';
  const firstCheckboxTitle = document.createElement('label');
  firstCheckboxTitle.textContent = 'USER';
  firstCheckboxTitle.classList.add(
    'btn',
    'btn-outline-success',
    'w-50',
    'me-1'
  );
  firstCheckboxTitle.htmlFor = 'btn-check-outlined';
  innerCheckboxContainer.appendChild(firstCheckboxInput);
  innerCheckboxContainer.appendChild(firstCheckboxTitle);
  if (firstCheckboxInput.checked)
    activeCheckboxInput = firstCheckboxTitle.textContent;
  // Second checkbox
  const secondCheckboxInput = document.createElement('input');
  secondCheckboxInput.id = 'btn-check-2-outlined';
  secondCheckboxInput.type = 'checkbox';
  secondCheckboxInput.classList.add('btn-check');
  secondCheckboxInput.setAttribute('autocomplete', 'on');
  secondCheckboxInput.checked =
    JSON.parse(localStorage.getItem('user_info')).role.title === 'MODERATOR';
  const secondCheckboxTitle = document.createElement('label');
  secondCheckboxTitle.textContent = 'MODERATOR';
  secondCheckboxTitle.classList.add(
    'btn',
    'btn-outline-warning',
    'w-50',
    'me-1'
  );
  secondCheckboxTitle.htmlFor = 'btn-check-2-outlined';
  if (secondCheckboxInput.checked)
    activeCheckboxInput = secondCheckboxTitle.textContent;
  innerCheckboxContainer.appendChild(secondCheckboxInput);
  innerCheckboxContainer.appendChild(secondCheckboxTitle);
  // Third checkbox
  const thirdCheckboxInput = document.createElement('input');
  thirdCheckboxInput.id = 'btn-check-3-outlined';
  thirdCheckboxInput.type = 'checkbox';
  thirdCheckboxInput.classList.add('btn-check');
  thirdCheckboxInput.setAttribute('autocomplete', 'on');
  thirdCheckboxInput.checked =
    JSON.parse(localStorage.getItem('user_info')).role.title === 'ADMIN';
  const thirdCheckboxTitle = document.createElement('label');
  thirdCheckboxTitle.textContent = 'ADMIN';
  thirdCheckboxTitle.classList.add('btn', 'btn-outline-danger', 'w-50');
  thirdCheckboxTitle.htmlFor = 'btn-check-3-outlined';
  if (thirdCheckboxInput.checked)
    activeCheckboxInput = thirdCheckboxTitle.textContent;
  innerCheckboxContainer.appendChild(thirdCheckboxInput);
  innerCheckboxContainer.appendChild(thirdCheckboxTitle);
  outerCheckboxContainer.appendChild(innerCheckboxContainer);
  modalFooterEl.appendChild(outerCheckboxContainer);
  firstCheckboxInput.addEventListener('change', function () {
    if (firstCheckboxInput.checked) {
      secondCheckboxInput.checked = false;
      thirdCheckboxInput.checked = false;
      activeCheckboxInput = firstCheckboxTitle.textContent;
    }
  });

  secondCheckboxInput.addEventListener('change', function () {
    if (secondCheckboxInput.checked) {
      firstCheckboxInput.checked = false;
      thirdCheckboxInput.checked = false;
      activeCheckboxInput = secondCheckboxTitle.textContent;
    }
  });

  thirdCheckboxInput.addEventListener('change', function () {
    if (thirdCheckboxInput.checked) {
      firstCheckboxInput.checked = false;
      secondCheckboxInput.checked = false;
      activeCheckboxInput = thirdCheckboxTitle.textContent;
    }
  });
  const editBtn = createEditBtn();
  modalFooterEl.addEventListener('submit', (event) => {
    event.preventDefault();
    axios
      .put(
        '/users/' + user_id,
        {
          title: activeCheckboxInput,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: sessionStorage.getItem('token'),
          },
        }
      )
      .then((response) => {
        userModalEl.innerHTML = originalModalContent;
        userData = userData.map((user) => {
          if (user.username === modalTitleEl.textContent) user = response.data;
          return user;
        });
        const roleModal = document.querySelector(
          '#userModal .modal-body #role'
        );
        roleModal.textContent = `Role: ${response.data.role.title}`;
        localStorage.setItem('user_info', JSON.stringify(response.data));
        countItems(userData);
        renderPage(currentPageIndex);
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
            text: 'Server Error!',
            icon: 'error',
            confirmButtonText: 'ОК',
          });
      });
  });
  const cancelBtn = createCancelBtn();
  cancelBtn.addEventListener('click', () => {
    userModalEl.innerHTML = originalModalContent;
  });
  const outerContainer = document.createElement('div');
  outerContainer.classList.add('container-fluid', 'text-center');
  const innerContainer = document.createElement('div');
  innerContainer.classList.add(
    'd-flex',
    'justify-content-between',
    'align-items-center',
    'mt-2'
  );
  innerContainer.appendChild(cancelBtn);
  innerContainer.appendChild(editBtn);
  outerContainer.appendChild(innerContainer);
  modalFooterEl.appendChild(outerContainer);
}
