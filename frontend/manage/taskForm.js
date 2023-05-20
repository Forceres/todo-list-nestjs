const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const submitBtn = document.getElementById('submitBtn');
localStorage.setItem('previousPage', document.referrer);

titleInput.addEventListener('input', () => {
  const isValid = titleInput.checkValidity();
  if (!isValid) {
    titleInput.classList.add('is-invalid');
  } else {
    titleInput.classList.remove('is-invalid');
  }
  submitBtn.disabled = !isValid;
});

descriptionInput.addEventListener('input', () => {
  const isValid = descriptionInput.checkValidity();
  if (!isValid) {
    descriptionInput.classList.add('is-invalid');
  } else {
    descriptionInput.classList.remove('is-invalid');
  }
  submitBtn.disabled = !isValid;
});

function initUrgencyForm() {
  const urgencyContainer = document.getElementById('urgency');
  let activeCheckboxInput;
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
  firstCheckboxInput.checked = true;
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
  activeCheckboxInput = firstCheckboxTitle.textContent;
  // Second checkbox
  const secondCheckboxInput = document.createElement('input');
  secondCheckboxInput.id = 'btn-check-2-outlined';
  secondCheckboxInput.type = 'checkbox';
  secondCheckboxInput.classList.add('btn-check');
  secondCheckboxInput.setAttribute('autocomplete', 'on');
  secondCheckboxInput.checked = false;
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
  thirdCheckboxInput.checked = false;
  const thirdCheckboxTitle = document.createElement('label');
  thirdCheckboxTitle.textContent = 'HIGH';
  thirdCheckboxTitle.classList.add('btn', 'btn-outline-danger', 'w-50');
  thirdCheckboxTitle.htmlFor = 'btn-check-3-outlined';
  innerCheckboxContainer.appendChild(thirdCheckboxInput);
  innerCheckboxContainer.appendChild(thirdCheckboxTitle);
  outerCheckboxContainer.appendChild(innerCheckboxContainer);
  urgencyContainer.appendChild(outerCheckboxContainer);
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

  const taskForm = document.getElementById('taskForm');
  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    axios
      .post(
        '/tasks/' + localStorage.getItem('list_id'),
        {
          title: titleInput.value,
          description: descriptionInput.value,
          urgency: activeCheckboxInput,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: sessionStorage.getItem('token'),
          },
        }
      )
      .then(() => {
        const successNotification = document.getElementById(
          'success-notification'
        );
        successNotification.classList.remove('d-none');

        setTimeout(function () {
          successNotification.classList.add('d-none');
          window.location.replace('manage.html');
        }, 3000);
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
}

initUrgencyForm();
