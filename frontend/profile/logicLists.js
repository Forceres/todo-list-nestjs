let taskLists;
let pageCount;
let pages;
let currentPageIndex = 0;
localStorage.setItem('previousPage', document.referrer);

function getLists() {
  axios
    .get('/lists', {
      headers: {
        Accept: 'application/json',
        Authorization: sessionStorage.getItem('token'),
      },
    })
    .then((response) => {
      taskLists = response.data;
      countItems(taskLists);
      if (taskLists.length === 0) return;
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
          text: 'Unauthorized!',
          icon: 'error',
          confirmButtonText: 'ОК',
        });
    });
}

getLists();

function countItems(taskLists) {
  const itemsPerPage = 5;
  pageCount = Math.ceil(taskLists.length / itemsPerPage);
  pages = Array.from({ length: pageCount }, (_, i) =>
    taskLists.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
  );
}

function renderPage(pageIndex) {
  currentPageIndex = pageIndex;
  const currentPage = pages[pageIndex];
  const taskListElements = currentPage.map(
    (taskList) => `
      <li class="list-group-item">
        <button type="button" class="btn btn-link link-dark" data-bs-toggle="modal" data-bs-target="#listModal" data-list-id="${taskList.id}">
        <h5>${taskList.title}</h5>
        </button>
      </li>
    `
  );
  document.getElementById('lists').innerHTML = `
      <ul class="list-group">
        ${taskListElements.join('')}
      </ul>
    `;

  document.querySelectorAll('button[data-list-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const listId = event.currentTarget.getAttribute('data-list-id');
      const list = taskLists.find((list) => list.id === listId);
      const modalTitle = document.querySelector('#listModal .modal-title');
      const modalBody = document.querySelector('#listModal .modal-body');
      modalTitle.textContent = list.title;
      modalBody.innerHTML = `
          <ul class="list-group">
            ${list.task
              .map(
                (task) =>
                  `<li class="list-group-item d-flex justify-content-between">
                    <button type="button" class="btn btn-link link-dark d-flex justify-content-between" data-task-id="${task.id}"><span class="text-start">${task.title}</span></button>
                    <button type="button" class="btn btn-link link-secondary btn-delete p-0" id="delete" data-currentTask-id="${task.id}"><i class="bi bi-x-lg" style="font-size: 1.7rem;"></i></button>
                  </li>`
              )
              .join('')}
          </ul>
        `;
      document
        .querySelectorAll('button[data-currentTask-id]')
        .forEach((button) => {
          button.addEventListener('click', (event) => {
            const curr_task_id = event.currentTarget.getAttribute(
              'data-currentTask-id'
            );
            const parentNd = button.parentNode;
            axios
              .delete('/tasks/' + curr_task_id, {
                headers: {
                  Accept: 'application/json',
                  Authorization: sessionStorage.getItem('token'),
                },
              })
              .then(() => {
                let current_list = taskLists.find((list) => list.id === listId);
                const current_task_info = current_list.task.filter(
                  (task) => task.id !== curr_task_id
                );
                current_list.task = current_task_info;
                current_list.tasks_quantity -= 1;
                taskLists = taskLists.map((list) => {
                  if (list.id === current_list.id) list = current_list;
                  return list;
                });
                parentNd.remove();
                const listModalElement = document.getElementById('listModal');
                listModalElement.addEventListener(
                  'hidden.bs.modal',
                  function () {
                    countItems(taskLists);
                    renderPage(currentPageIndex);
                  }
                );
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
        });
      document.querySelectorAll('button[data-task-id]').forEach((button) => {
        button.addEventListener('click', (event) => {
          const taskId = event.currentTarget.getAttribute('data-task-id');
          const current_list = taskLists.find((list) => list.id === listId);
          const current_task = current_list.task.find(
            (task) => task.id === taskId
          );
          localStorage.setItem('task_info', JSON.stringify(current_task));
          localStorage.setItem('list_id', listId);
          localStorage.setItem('list_title', list.title);
          localStorage.setItem('task_id', taskId);
          document.location.replace('../task/task.html');
        });
      });
    });
  });

  renderPagination(currentPageIndex);
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

function remove(id) {
  const list_id = taskLists.find(
    (list) => list.id === id.getAttribute('data-list-id')
  ).id;
  axios
    .delete('/lists/' + list_id, {
      headers: {
        Accept: 'application/json',
        Authorization: sessionStorage.getItem('token'),
      },
    })
    .then(() => {
      const listModalEl = document.getElementById('listModal');
      const listModal = bootstrap.Modal.getInstance(listModalEl);
      if (listModal) {
        listModal.hide();
      }
      const updatedTaskLists = taskLists.filter((list) => list.id !== list_id);
      taskLists = updatedTaskLists;
      if (taskLists.length === 0) {
        const listsEl = document.getElementById('lists');
        listsEl.remove();
        const paginationEl = document.getElementById('pg');
        paginationEl.remove();
        return;
      }
      countItems(taskLists);
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

function edit(id) {
  const listModalEl = document.getElementById('listModal');
  const originalModalContent = listModalEl.innerHTML;
  listModalEl.addEventListener('hidden.bs.modal', function () {
    listModalEl.innerHTML = originalModalContent;
  });
  const editTitleBtn = document.querySelector('#edit');
  editTitleBtn.disabled = true;
  const list_id = taskLists.find(
    (list) => list.id === id.getAttribute('data-list-id')
  ).id;
  let modalTitleEl = document.querySelector('#listModal .modal-title');
  let modalFooterEl = document.querySelector('#listModal .modal-footer');
  const form = document.createElement('form');
  form.classList.add('w-100', 'needs-validation');
  form.id = 'modalForm';
  modalFooterEl.appendChild(form);
  modalFooterEl = document.getElementById('modalForm');
  const inputContainer = document.createElement('div');
  inputContainer.classList.add(
    'container-fluid',
    'form-group',
    'has-validation'
  );
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = 'Input title: ';
  titleInput.classList.add('form-control');
  titleInput.required = true;
  titleInput.pattern = '[a-zA-Z0-9_]{10,40}';
  const invalid = document.createElement('div');
  invalid.classList.add('invalid-feedback');
  invalid.textContent =
    'Title must be 10-40 characters long and can only contain letters, numbers, and underscores.';
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
  const editBtn = createEditBtn();
  modalFooterEl.addEventListener('submit', (event) => {
    event.preventDefault();
    axios
      .put(
        '/lists/' + list_id,
        {
          title: titleInput.value,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: sessionStorage.getItem('token'),
          },
        }
      )
      .then((response) => {
        listModalEl.innerHTML = originalModalContent;
        taskLists = taskLists.map((list) => {
          if (list.id === list_id) list = response.data;
          return list;
        });
        modalTitleEl = listModalEl.querySelector('.modal-title');
        modalTitleEl.textContent = response.data.title;
        countItems(taskLists);
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
    listModalEl.innerHTML = originalModalContent;
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
