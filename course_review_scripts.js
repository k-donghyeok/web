import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', async function() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'flex' ? 'none' : 'flex';
    });
    
    const urlParams = new URLSearchParams(window.location.search); // URL의 쿼리 문자열 파싱
    const courseId = urlParams.get('course_id');
    localStorage.setItem('courseId', courseId); // coureId 값을 로컬 스토리지에 저장

    const course = await getCourseFromFirestore(courseId);
    displayCourseInfo(course);

    displayReviews(courseId);
});

async function getCourseFromFirestore(courseId) {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log('No such document!');
        return null;
    }
}

function displayCourseInfo(course) {
    const courseNameElement = document.getElementById('course-name');
    courseNameElement.innerHTML = `${course.name}`;
    
    const table = document.getElementById('course-table');
    const rows = table.getElementsByTagName('tr');

    rows[0].cells[1].textContent = course.professor;
    rows[1].cells[1].textContent = course.id;
    rows[2].cells[1].textContent = course.type;
    rows[3].cells[1].textContent = course.year;
    rows[4].cells[1].textContent = course.times.map(time => `${time.day} ${time.start}-${time.end}`).join(', ');
    rows[5].cells[1].textContent = course.location;
    rows[6].cells[1].textContent = course.credit;
}

async function displayReviews(courseId) {
    const reviewContainer = document.querySelector('.review-container');

    const querySnapshot = await getDocs(collection(db, "reviews"));

    querySnapshot.forEach(doc => {
        const reviewData = doc.data();
        if (reviewData.courseId === courseId) {
            const reviewElement = createReviewElement(reviewData);
            reviewContainer.appendChild(reviewElement);
        }
    });
}

function createReviewElement(reviewData) {
    const reviewElement = document.createElement('div');
    reviewElement.classList.add('review');

    const ratingElement = document.createElement('p');
    ratingElement.classList.add('rating');
    ratingElement.textContent = `${reviewData.rating.toFixed(2)} `;
    ratingElement.appendChild(getStars(reviewData.rating));
    reviewElement.appendChild(ratingElement);

    const reviewContentElement = document.createElement('p');
    reviewContentElement.textContent = reviewData.review;
    reviewElement.appendChild(reviewContentElement);

    return reviewElement;
}

function getStars(rating) {
    const starContainer = document.createElement('span');
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        if (i <= rating) {
            star.classList.add('filled-star');
        } else {
            star.classList.add('empty-star');
        }
        starContainer.appendChild(star);
    }
    return starContainer;
}
