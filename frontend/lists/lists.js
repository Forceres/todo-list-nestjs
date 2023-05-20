let lists;
let pageCount;
let pages;
let currentPageIndex = 0;
localStorage.setItem('previousPage', document.referrer);

function initPage() {
  lists = JSON.parse(localStorage.getItem('lists_info'));
  countItems(lists);
  renderPage(0);
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
          document.location.replace('../tasks/tasks.html');
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
