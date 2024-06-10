// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";

// Firebase 구성
const firebaseConfig = {
    apiKey: "AIzaSyB9KqJAFP7mdAC8wOEFJ3_A3n0DIXFd2wE",
    authDomain: "web-project-9b882.firebaseapp.com",
    projectId: "web-project-9b882",
    storageBucket: "web-project-9b882.appspot.com",
    messagingSenderId: "615148650882",
    appId: "1:615148650882:web:d7ff2dde539e9439b1cf9b",
    measurementId: "G-GB18FJJSC9"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    // 로컬 스토리지에서 과목 ID 가져오기
    const courseId = localStorage.getItem('courseId');

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

    document.getElementById('submit-review').addEventListener('click', async function() {
        const reviewText = document.getElementById('review-text').value;
        if (selectedRating === 0) {
            alert('평점을 선택하세요.');
            return;
        }
        if (reviewText.trim() === '') {
            alert('강의평을 작성하세요.');
            return;
        }
    
        try {
            // Firestore에 데이터 추가
            const docRef = await addDoc(collection(db, "reviews"), {
                courseId: courseId,
                rating: selectedRating,
                review: reviewText
            });
            console.log("Document written with ID: ", docRef.id);
    
            // 강의평이 제출되었음을 사용자에게 알림
            alert('강의평이 제출되었습니다.');
    
            // 페이지를 초기화하거나 다른 작업을 수행할 수 있습니다.
            // 여기서는 페이지를 새로고침합니다.
            location.reload();
        } catch (e) {
            console.error("Error adding document: ", e);
            alert('강의평을 제출하는 중 오류가 발생했습니다.');
        }
    });
    
});