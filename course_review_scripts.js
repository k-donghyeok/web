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
    // 현재 페이지의 URL에서 course_id 값을 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');
    // 과목 ID를 로컬 스토리지에 저장
    localStorage.setItem('courseId', courseId);

    // Firestore에서 해당 courseId의 강의 정보 가져오기
    const course = await getCourseFromFirestore(courseId);
    // 강의 정보 표시
    displayCourseInfo(course);

    // 리뷰 표시
    displayReviews(courseId);
});

// Firestore에서 courseId에 해당하는 강의 정보 가져오기
async function getCourseFromFirestore(courseId) {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data(); // 해당 문서의 데이터 반환
    } else {
        console.log('No such document!');
        return null; // 문서를 찾지 못한 경우 null 반환
    }
}

// 강의 정보를 HTML에 표시하는 함수
function displayCourseInfo(course) {
    const courseNameElement = document.getElementById('course-name');
    const courseProfessorElement = document.getElementById('course-professor');
    const courseIdElement = document.getElementById('course-id');
    const courseTypeElement = document.getElementById('course-type');
    const courseYearElement = document.getElementById('course-year');
    const courseTimeElement = document.getElementById('course-time');
    const courseLocationElement = document.getElementById('course-location');
    const courseCreditElement = document.getElementById('course-credit');

    courseNameElement.innerHTML = `<strong>과목명:</strong> ${course.name}`;
    courseProfessorElement.innerHTML = `<strong>교수명:</strong> ${course.professor}`;
    courseIdElement.innerHTML = `<strong>과목코드:</strong> ${course.id}`;
    courseTypeElement.innerHTML = `<strong>구분:</strong> ${course.type}`;
    courseYearElement.innerHTML = `<strong>학년:</strong> ${course.year}`;
    courseTimeElement.innerHTML = `<strong>시간:</strong> ${course.times.map(time => `${time.day} ${time.start}-${time.end}`).join(', ')}`;
    courseLocationElement.innerHTML = `<strong>장소:</strong> ${course.location}`;
    courseCreditElement.innerHTML = `<strong>학점:</strong> ${course.credit}`;
}

// 리뷰 데이터를 HTML에 추가하는 함수
async function displayReviews(courseId) {
    const reviewContainer = document.querySelector('.course-reviews');
    
    // Firestore에서 해당 courseId의 리뷰 컬렉션의 모든 문서 가져오기
    const querySnapshot = await getDocs(collection(db, "reviews"));
    
    // 각 리뷰에 대해 HTML에 추가
    querySnapshot.forEach(doc => {
        const reviewData = doc.data();
        if (reviewData.courseId === courseId) {
            const reviewElement = createReviewElement(reviewData);
            reviewContainer.appendChild(reviewElement);
        }
    });
}

// 리뷰 데이터를 HTML 요소로 변환하는 함수
function createReviewElement(reviewData) {
    const reviewElement = document.createElement('div');
    reviewElement.classList.add('review');
    
    // 별점 표시
    const ratingElement = document.createElement('p');
    ratingElement.classList.add('rating');
    ratingElement.textContent = `${reviewData.rating.toFixed(2)} ${getStars(reviewData.rating)}`;
    reviewElement.appendChild(ratingElement);
    
    // 리뷰 내용 표시
    const reviewContentElement = document.createElement('p');
    reviewContentElement.textContent = reviewData.review;
    reviewElement.appendChild(reviewContentElement);
    
    return reviewElement;
}

// 별점에 따라 별표시를 반환하는 함수
function getStars(rating) {
    const filledStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return filledStars + emptyStars;
}

