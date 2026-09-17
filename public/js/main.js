// Review modal behavior
const reviewButton = document.getElementById('reviewButton');
const reviewModal = document.getElementById('reviewModal');
const closeReview = document.getElementById('closeReview');

if (reviewButton && reviewModal) {
  reviewButton.addEventListener('click', () => reviewModal.classList.add('show'));
}

if (closeReview && reviewModal) {
  closeReview.addEventListener('click', () => reviewModal.classList.remove('show'));
  reviewModal.addEventListener('click', (event) => {
    if (event.target === reviewModal) reviewModal.classList.remove('show');
  });
}
