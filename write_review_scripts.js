document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    menuBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'flex' ? 'none' : 'flex';
    });

    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(star.getAttribute('data-value'));
            updateStars(selectedRating);
        });
    });

    function updateStars(rating) {
        stars.forEach(star => {
            if (parseInt(star.getAttribute('data-value')) <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    document.getElementById('submit-review').addEventListener('click', function() {
        const reviewText = document.getElementById('review-text').value;
        if (selectedRating === 0) {
            alert('평점을 선택하세요.');
            return;
        }
        if (reviewText.trim() === '') {
            alert('강의평을 작성하세요.');
            return;
        }

        // 여기에 강의평을 제출하는 코드 작성
        alert('강의평이 제출되었습니다.');
        // 제출 후 페이지를 초기화하거나 다른 페이지로 이동할 수 있습니다.
    });
});
