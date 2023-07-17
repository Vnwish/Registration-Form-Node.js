window.addEventListener('DOMContentLoaded', () => {
  const emailElement = document.getElementById('email');

  // Retrieve the email from the backend and display it on the profile page
  fetch('/api/profile')
    .then(response => response.json())
    .then(data => {
      emailElement.textContent = data.email;
    })
    .catch(error => console.error(error));
});
