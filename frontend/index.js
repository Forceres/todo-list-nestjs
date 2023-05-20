localStorage.setItem('previousPage', document.referrer);
const checkState = (url) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    axios
      .get('/auth/check', { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        window.location.replace('profile/profile.html');
      })
      .catch((error) => {
        if (error.request.status === 401) {
          refreshAccessToken();
        }
        window.location.replace(url);
      });
  } else {
    window.location.replace(url);
  }
};
