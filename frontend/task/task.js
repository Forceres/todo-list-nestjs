localStorage.setItem('previousPage', document.referrer);
const renderTaskPage = () => {
  const current_task = JSON.parse(localStorage.getItem('task_info'));
  const element = `<li class="list-group-item"><button type="button" class="btn btn-link link-dark px-0" data-bs-toggle="modal" data-bs-target="#taskModal" data-curr_task-id="${
    current_task.id
  }">
              <h3>Title:</h3>
              </button><p>${current_task.title}</p></li>
              <li class="list-group-item">
              <button type="button" class="btn btn-link link-dark px-0" data-bs-toggle="modal" data-bs-target="#taskModal" data-curr_task-id="${
                current_task.id
              }">
              <h3>Description:</h3>
              </button>
              <p>${current_task.description}</p></li>
              <li class="list-group-item"><button type="button" class="btn btn-link link-dark px-0" data-bs-toggle="modal" data-bs-target="#taskModal" data-curr_task-id="${
                current_task.id
              }">
              <h3>Urgency:</h3>
              </button><p>${current_task.urgency}</p></li>
              <li class="list-group-item"><button type="button" class="btn btn-link link-dark px-0" data-bs-toggle="modal" data-bs-target="#taskModal" data-curr_task-id="${
                current_task.id
              }">
              <h3>State of completion:</h3>
              </button><p>${
                current_task.isDone
                  ? '<i class="bi bi-check-lg" style="font-size: 1.7rem"></i>'
                  : '<i class="bi bi-x-lg" style="font-size: 1.7rem"></i>'
              }</p></li>
              <li class="list-group-item"><h3>Creation Date: </h3>${
                current_task.createdAt
              }</li>
              <li class="list-group-item"><h3>Update Date: </h3>${
                current_task.updatedAt
              }</li>
              <li class="list-group-item"><h3>Belongs to list:</h3>${localStorage.getItem(
                'list_title'
              )}</li>
              <li class="list-group-item"><button type="button" id="remove" class="btn btn-primary w-100" onclick="">Delete</button></li>
            `;
  const elementLi = document.querySelector('#profile');
  elementLi.innerHTML = element;
  document.querySelectorAll('button[data-curr_task-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const taskTitle = event.currentTarget.querySelector('h3').textContent;
      const parentLi = event.currentTarget.parentNode;
      const taskBody = parentLi.querySelector('p');
      const modalTitle = document.querySelector('#taskModal .modal-title');
      const modalBody = document.querySelector('#taskModal .modal-body');
      modalTitle.textContent = taskTitle;
      modalBody.innerHTML = taskBody.outerHTML;
    });
  });
  document.getElementById('remove').addEventListener('click', () => {
    axios
      .delete('/tasks/' + localStorage.getItem('task_id'), {
        headers: {
          Accept: 'application/json',
          Authorization: sessionStorage.getItem('token'),
        },
      })
      .then(() => {
        window.location.replace(localStorage.getItem('previousPage'));
      })
      .catch(() => {
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
};

function createCancelBtn() {
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.classList.add('btn', 'btn-primary', 'me-1', 'w-50');
  return cancelBtn;
}

function createEditBtn() {
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.type = 'submit';
  editBtn.classList.add('btn', 'btn-primary', 'w-50');
  return editBtn;
}

function edit(body) {
  const taskModalEl = document.getElementById('taskModal');
  const originalModalContent = taskModalEl.innerHTML;
  taskModalEl.addEventListener('hidden.bs.modal', function () {
    taskModalEl.innerHTML = originalModalContent;
  });
  const editTitleBtn = document.querySelector('#edit');
  editTitleBtn.disabled = true;
  let modalTitleEl = document.querySelector('#taskModal .modal-title');
  let modalFooterEl = document.querySelector('#taskModal .modal-footer');
  const form = document.createElement('form');
  form.classList.add('w-100', 'needs-validation');
  form.id = 'modalForm';
  modalFooterEl.appendChild(form);
  modalFooterEl = document.getElementById('modalForm');
  let activeCheckboxInput;
  let titleInput;
  if (modalTitleEl.textContent === 'State of completion:') {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.classList.add('container-fluid');
    const checkboxInput = document.createElement('input');
    checkboxInput.id = 'btn-check-outlined';
    checkboxInput.type = 'checkbox';
    checkboxInput.classList.add('btn-check');
    checkboxInput.setAttribute('autocomplete', 'on');
    checkboxInput.checked = JSON.parse(
      localStorage.getItem('task_info')
    ).isDone;
    checkboxInput.addEventListener('change', () => {
      activeCheckboxInput = checkboxInput;
    });
    const checkboxTitle = document.createElement('label');
    checkboxTitle.textContent = 'Completed';
    checkboxTitle.classList.add('btn', 'btn-outline-primary', 'w-100');
    checkboxTitle.htmlFor = 'btn-check-outlined';
    checkboxContainer.appendChild(checkboxInput);
    checkboxContainer.appendChild(checkboxTitle);
    modalFooterEl.appendChild(checkboxContainer);
  } else if (modalTitleEl.textContent === 'Urgency:') {
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
      JSON.parse(localStorage.getItem('task_info')).urgency === 'LOW';
    const firstCheckboxTitle = document.createElement('label');
    firstCheckboxTitle.textContent = 'LOW';
    firstCheckboxTitle.classList.add(
      'btn',
      'btn-outline-success',
      'w-50',
      'me-1'
    );
    firstCheckboxTitle.htmlFor = 'btn-check-outlined';
    innerCheckboxContainer.appendChild(firstCheckboxInput);
    innerCheckboxContainer.appendChild(firstCheckboxTitle);
    activeCheckboxInput = firstCheckboxTitle;
    // Second checkbox
    const secondCheckboxInput = document.createElement('input');
    secondCheckboxInput.id = 'btn-check-2-outlined';
    secondCheckboxInput.type = 'checkbox';
    secondCheckboxInput.classList.add('btn-check');
    secondCheckboxInput.setAttribute('autocomplete', 'on');
    secondCheckboxInput.checked =
      JSON.parse(localStorage.getItem('task_info')).urgency === 'MEDIUM';
    const secondCheckboxTitle = document.createElement('label');
    secondCheckboxTitle.textContent = 'MEDIUM';
    secondCheckboxTitle.classList.add(
      'btn',
      'btn-outline-warning',
      'w-50',
      'me-1'
    );
    secondCheckboxTitle.htmlFor = 'btn-check-2-outlined';
    innerCheckboxContainer.appendChild(secondCheckboxInput);
    innerCheckboxContainer.appendChild(secondCheckboxTitle);
    // Third checkbox
    const thirdCheckboxInput = document.createElement('input');
    thirdCheckboxInput.id = 'btn-check-3-outlined';
    thirdCheckboxInput.type = 'checkbox';
    thirdCheckboxInput.classList.add('btn-check');
    thirdCheckboxInput.setAttribute('autocomplete', 'on');
    thirdCheckboxInput.checked =
      JSON.parse(localStorage.getItem('task_info')).urgency === 'HIGH';
    const thirdCheckboxTitle = document.createElement('label');
    thirdCheckboxTitle.textContent = 'HIGH';
    thirdCheckboxTitle.classList.add('btn', 'btn-outline-danger', 'w-50');
    thirdCheckboxTitle.htmlFor = 'btn-check-3-outlined';
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
  } else if (modalTitleEl.textContent === 'Title:') {
    const inputContainer = document.createElement('div');
    inputContainer.classList.add(
      'container-fluid',
      'form-group',
      'has-validation'
    );
    titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Input text: ';
    titleInput.classList.add('form-control');
    titleInput.required = true;
    titleInput.pattern = '[a-zA-Z0-9_]{10,25}';
    const invalid = document.createElement('div');
    invalid.classList.add('invalid-feedback');
    invalid.textContent =
      'Title must be 10-25 characters long and can only contain letters, numbers, and underscores.';
    inputContainer.appendChild(titleInput);
    inputContainer.appendChild(invalid);
    modalFooterEl.appendChild(inputContainer);
    titleInput.addEventListener('input', () => {
      const isValid = titleInput.checkValidity();
      if (!isValid) {
        titleInput.classList.add('is-invalid');
      } else {
        titleInput.classList.remove('is-invalid');
      }
      editBtn.disabled = !isValid;
    });
  } else if (modalTitleEl.textContent === 'Description:') {
    const inputContainer = document.createElement('div');
    inputContainer.classList.add(
      'container-fluid',
      'form-group',
      'has-validation'
    );
    titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Input text: ';
    titleInput.classList.add('form-control');
    titleInput.required = true;
    titleInput.pattern = '[a-zA-Z0-9_]{10,500}';
    const invalid = document.createElement('div');
    invalid.classList.add('invalid-feedback');
    invalid.textContent =
      'Description must be 10-500 characters long and can only contain letters, numbers, and underscores.';
    inputContainer.appendChild(titleInput);
    inputContainer.appendChild(invalid);
    modalFooterEl.appendChild(inputContainer);
    titleInput.addEventListener('input', () => {
      const isValid = titleInput.checkValidity();
      if (!isValid) {
        titleInput.classList.add('is-invalid');
      } else {
        titleInput.classList.remove('is-invalid');
      }
      editBtn.disabled = !isValid;
    });
  }
  const editBtn = createEditBtn();
  modalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (
      activeCheckboxInput ===
      JSON.parse(localStorage.getItem('task_info')).urgency
    ) {
      Swal.fire({
        title: 'Error!',
        text: 'Change urgency!',
        icon: 'error',
        confirmButtonText: 'ОК',
      });
    }
    const dto = {};
    if (modalTitleEl.textContent === 'Title:') dto.title = titleInput.value;
    else if (modalTitleEl.textContent === 'Description:')
      dto.description = titleInput.value;
    else if (modalTitleEl.textContent === 'Urgency:')
      dto.urgency = activeCheckboxInput;
    else dto.isDone = activeCheckboxInput.checked;
    axios
      .put('/tasks/' + localStorage.getItem('task_id'), dto, {
        headers: {
          Accept: 'application/json',
          Authorization: sessionStorage.getItem('token'),
        },
      })
      .then((response) => {
        localStorage.setItem('task_info', JSON.stringify(response.data));
        taskModalEl.innerHTML = originalModalContent;
        const modalBodyEl = taskModalEl.querySelector('.modal-body');
        if (dto.urgency) modalBodyEl.textContent = response.data.urgency;
        else if (dto.description)
          modalBodyEl.textContent = response.data.description;
        else if (dto.isDone === false || dto.isDone === true) {
          modalBodyEl.innerHTML = `<p>${
            response.data.isDone
              ? '<i class="bi bi-check-lg" style="font-size: 1.7rem"></i>'
              : '<i class="bi bi-x-lg" style="font-size: 1.7rem"></i>'
          }</p>`;
        } else if (dto.title) modalBodyEl.textContent = response.data.title;
        renderTaskPage();
      })
      .catch((error) => {
        if (error.request.status === 400)
          Swal.fire({
            title: 'Error!',
            text: 'Incorrect input data!',
            icon: 'error',
            confirmButtonText: 'ОК',
          });
        else if (error.request.status === 401) {
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
  });
  const cancelBtn = createCancelBtn();
  cancelBtn.addEventListener('click', () => {
    taskModalEl.innerHTML = originalModalContent;
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
renderTaskPage();
