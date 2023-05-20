let tasks;
let pageCount;
let pages;
let currentPageIndex = 0;
let listData;
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
      listData = response.data;
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
          text: 'Server error!',
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
          <button type="button" class="btn btn-link link-dark" data-task-id="${task.id}">
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
      const current_task = listData.task.find((task) => task.id === taskId);
      localStorage.setItem('task_info', JSON.stringify(current_task));
      localStorage.setItem('list_id', listData.id);
      localStorage.setItem('list_title', listData.title);
      localStorage.setItem('task_id', taskId);
      document.location.replace('../task/task.html');
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
