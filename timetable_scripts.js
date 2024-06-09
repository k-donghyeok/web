// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";

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

    // Firestore에서 강의 데이터를 가져와서 표시하는 함수 호출
    await displayCourses();
});

async function displayCourses() {
    const coursesCollection = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesCollection);
    const courses = coursesSnapshot.docs.map(doc => doc.data());

    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        courseItem.draggable = true;
        courseItem.innerHTML = `${course.name} (${course.time})
            <div class="course-options">
                <a href="course_review.html">강의평</a>
                <a href="#" onclick="addToTimetable(event)">시간표담기</a>
            </div>`;
        courseItem.dataset.courseId = course.id;
        courseItem.dataset.courseTime = course.time;
        courseItem.addEventListener('dragstart', handleDragStart);
        resultsContainer.appendChild(courseItem);
    });
}

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.courseId);
    event.dataTransfer.setData('text/course-time', event.target.dataset.courseTime);
}

const timetableCells = document.querySelectorAll('#timetable td');
timetableCells.forEach(cell => {
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('drop', handleDrop);
});

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const courseId = event.dataTransfer.getData('text/plain');
    const courseTime = event.dataTransfer.getData('text/course-time');
    const cell = event.target;
    cell.textContent = `Course ID: ${courseId}, Time: ${courseTime}`;
}

function addToTimetable(event) {
    event.preventDefault();
    alert('시간표에 강의가 추가되었습니다.');
}
