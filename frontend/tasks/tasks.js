let tasks;
let pageCount;
let pages;
let currentPageIndex = 0;
localStorage.setItem('previousPage', document.referrer);

function initPage() {
  axios
    .get('/lists/' + localStorage.getItem('list_id'), {
      headers: {
        Accept: 'application/json',
        Authorization: sessionStorage.getItem('token'),
      },
    })
    .then((response) => {
      tasks = response.data.task;
      if (tasks.length === 0) return;
      countItems(tasks);
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
          text: 'Server Error!',
          icon: 'error',
          confirmButtonText: 'ОК',
        });
    });
}

initPage();

function countItems(tasks) {
  const itemsPerPage = 5;
  pageCount = Math.ceil(tasks.length / itemsPerPage);
  pages = Array.from({ length: pageCount }, (_, i) =>
    tasks.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
  );
}

function renderPage(pageIndex) {
  currentPageIndex = pageIndex;
  const currentPage = pages[pageIndex];
  const tasksElements = currentPage.map(
    (task) => `
        <li class="list-group-item">
          <button type="button" class="btn btn-link link-dark" data-bs-toggle="modal" data-bs-target="#taskModal" data-task-id="${task.id}">
          <h5>${task.title}</h5>
          </button>
        </li>
      `
  );
  document.getElementById('tasks').innerHTML = `
        <ul class="list-group">
          ${tasksElements.join('')}
        </ul>
      `;

  document.querySelectorAll('button[data-task-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const taskId = event.currentTarget.getAttribute('data-task-id');
      const task = tasks.find((task) => task.id === taskId);
      const modalTitle = document.querySelector('#taskModal .modal-title');
      const modalBody = document.querySelector('#taskModal .modal-body');
      modalTitle.textContent = task.title;
      modalBody.innerHTML = `
            <ul class="list-group">
                <li class="list-group-item d-flex flex-row">
                    <p>Description:</p>
                    <p class="mx-1">${task.description}</p>
                </li>
                <li class="list-group-item d-flex flex-row">
                    <p>Urgency:</p>
                    <p class="mx-1">${task.urgency}</p>
                </li>
                <li class="list-group-item d-flex flex-row">
                    <p>State of completion:</p>
                    <p class="mx-1">${
                      task.isDone
                        ? '<i class="bi bi-check-lg" style="font-size: 1.5rem"></i>'
                        : '<i class="bi bi-x-lg" style="font-size: 1.5rem"></i>'
                    }</p>
                </li>
                <li class="list-group-item d-flex flex-row">
                    <p>Creation Date:</p>
                    <p class="mx-1">${task.createdAt}</p>
                </li>
                <li class="list-group-item d-flex flex-row">
                    <p>Update Date:</p>
                    <p class="mx-1">${task.updatedAt}</p></li>
                <li class="list-group-item d-flex flex-row">
                    <p>Belongs to list:</p>
                    <p class="mx-1">${localStorage.getItem('list_title')}</p>
                </li>
            </ul>
          `;
    });
  });

  renderPagination(currentPageIndex);
}

function renderPagination(currentPageIndex) {
  const paginationElements = Array.from(
    { length: pageCount },
    (_, i) => `
          <li class="page-item ${i === currentPageIndex ? 'active' : ''}">
            <a class="page-link" href="#" onclick="renderPage(${i})">${
      i + 1
    }</a>
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
