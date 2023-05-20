let lists;
let pageCount;
let pages;
let currentPageIndex = 0;
localStorage.setItem('previousPage', document.referrer);

const createBtn = document.getElementById('create');
createBtn.addEventListener('click', () => {
  createBtn.disabled = true;
  const listForm = document.createElement('form');
  listForm.classList.add('w-100', 'mt-2', 'needs-validation');
  listForm.id = 'modalForm';
  const inputContainer = document.createElement('div');
  inputContainer.classList.add(
    'container-fluid',
    'form-group',
    'has-validation',
    'p-0'
  );
  titleInput = document.createElement('input');
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
  listForm.appendChild(inputContainer);
  titleInput.addEventListener('input', () => {
    const isValid = titleInput.checkValidity();
    if (!isValid) {
      titleInput.classList.add('is-invalid');
    } else {
      titleInput.classList.remove('is-invalid');
    }
    submitBtn.disabled = !isValid;
  });
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Submit';
  submitBtn.classList.add('btn', 'btn-primary', 'w-100', 'mt-2');
  inputContainer.appendChild(submitBtn);
  createBtn.insertAdjacentElement('afterend', listForm);
  listForm.addEventListener('submit', (event) => {
    createBtn.disabled = false;
    event.preventDefault();
    axios
      .post(
        '/lists',
        { title: titleInput.value },
        {
          headers: {
            Accept: 'application/json',
            Authorization: sessionStorage.getItem('token'),
          },
        }
      )
      .then(() => {
        inputContainer.remove();
        const successNotification = document.getElementById(
          'success-notification'
        );
        successNotification.classList.remove('d-none');

        setTimeout(function () {
          successNotification.classList.add('d-none');
        }, 3000);

        initPage();
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
  });
});

function initPage() {
  axios
    .get('/lists', {
      headers: {
        Accept: 'application/json',
        Authorization: sessionStorage.getItem('token'),
      },
    })
    .then((response) => {
      lists = response.data;
      countItems(lists);
      if (lists.length === 0) return;
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

initPage();

function countItems(lists) {
  const itemsPerPage = 5;
  pageCount = Math.ceil(lists.length / itemsPerPage);
  pages = Array.from({ length: pageCount }, (_, i) =>
    lists.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
  );
}

function renderPage(pageIndex) {
  currentPageIndex = pageIndex;
  const currentPage = pages[pageIndex];
  const listsElements = currentPage.map(
    (list) => `
      <li class="list-group-item">
        <button type="button" class="btn btn-link link-dark" data-bs-toggle="modal" data-bs-target="#listModal" data-list-id="${list.id}">
        <h5>${list.title}</h5>
        </button>
      </li>
    `
  );
  document.getElementById('lists').innerHTML = `
      <ul class="list-group">
        ${listsElements.join('')}
      </ul>
    `;

  document.querySelectorAll('button[data-list-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const listId = event.currentTarget.getAttribute('data-list-id');
      const list = lists.find((list) => list.id === listId);
      const modalTitle = document.querySelector('#listModal .modal-title');
      const modalBody = document.querySelector('#listModal .modal-body');
      modalTitle.textContent = list.title;
      modalBody.innerHTML = `
          <ul class="list-group">
          ${
            list.tasks_quantity === 0
              ? `<li class="list-group-item d-flex justify-content-left">List doesn't have any tasks</li>`
              : `<li class="list-group-item btn btn-link d-flex justify-content-left"><button type="button" class="btn btn-link link-dark px-0" data-currentlist-id="${list.id}">Tasks</button></li>`
          }
          </ul>
        `;
      const tasksBtn = document.querySelector('button[data-currentList-id');
      if (tasksBtn) {
        tasksBtn.addEventListener('click', (event) => {
          const curr_list_id = event.currentTarget.getAttribute(
            'data-currentList-id'
          );
          localStorage.setItem('list_id', curr_list_id);
          localStorage.setItem('list_title', list.title);
          document.location.replace('tasks.html');
        });
      }
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

function remove(title) {
  const list_id = lists.find((list) => list.title === title).id;
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
      const updatedLists = lists.filter((list) => list.id !== list_id);
      lists = updatedLists;
      if (lists.length === 0) {
        const listsEl = document.getElementById('lists');
        listsEl.remove();
        const paginationEl = document.getElementById('pg');
        paginationEl.remove();
        return;
      }
      countItems(lists);
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
          text: 'Server error!',
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

function edit(title) {
  const listModalEl = document.getElementById('listModal');
  const originalModalContent = listModalEl.innerHTML;
  listModalEl.addEventListener('hidden.bs.modal', function () {
    listModalEl.innerHTML = originalModalContent;
  });
  const editTitleBtn = document.querySelector('#edit');
  editTitleBtn.disabled = true;
  const list_id = lists.find((list) => list.title === title).id;
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
        lists = lists.map((list) => {
          if (list.title === modalTitleEl.textContent) list = response.data;
          return list;
        });
        modalTitleEl = listModalEl.querySelector('.modal-title');
        modalTitleEl.textContent = response.data.title;
        countItems(lists);
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
            text: 'Server error!',
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

function create(title) {
  const currentListId = lists.find((list) => list.title === title).id;
  localStorage.setItem('list_id', currentListId);
  window.location.replace('taskForm.html');
}
