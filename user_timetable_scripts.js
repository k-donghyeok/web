// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

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
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'flex' ? 'none' : 'flex';
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // 사용자 정보가 확인되면 강의 목록을 표시
            displayCourses();
            // 사용자 시간표 로드
            loadUserTimetable(user.uid);
        } else {
            // 사용자가 로그인되어 있지 않으면 로그인 페이지로 리디렉션
            window.location.href = 'login.html';
        }
    });
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
        courseItem.innerHTML = `${course.name} (${course.times.map(time => `${time.day} ${time.start}-${time.end}`).join(', ')})
            <div class="course-options">
                <a href="course_review.html">강의평</a>
                <a href="#" onclick="addToTimetable(event, '${course.id}')">시간표담기</a>
            </div>`;
        courseItem.dataset.courseId = course.id;
        courseItem.dataset.courseTimes = JSON.stringify(course.times);
        courseItem.addEventListener('dragstart', handleDragStart);
        resultsContainer.appendChild(courseItem);
    });
}

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.courseId);
    event.dataTransfer.setData('text/course-times', event.target.dataset.courseTimes);
}

const timetableCells = document.querySelectorAll('#timetable td');
timetableCells.forEach(cell => {
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('drop', handleDrop);
});

function handleDragOver(event) {
    event.preventDefault();
}

async function handleDrop(event) {
    event.preventDefault();
    const courseId = event.dataTransfer.getData('text/plain');
    const courseTimes = JSON.parse(event.dataTransfer.getData('text/course-times'));
    const cell = event.target;
    
    const user = auth.currentUser;
    if (user) {
        const userTimetableRef = doc(db, `users/${user.uid}/timetable`, courseId);
        await setDoc(userTimetableRef, {
            courseId: courseId,
            times: courseTimes
        });
        alert('시간표에 강의가 추가되었습니다.');
        // 시간표 업데이트
        loadUserTimetable(user.uid);
    }
}

function addToTimetable(event, courseId) {
    event.preventDefault();
    alert(`Course ${courseId} has been added to your timetable.`);
}

async function loadUserTimetable(userId) {
    const timetableRef = collection(db, `users/${userId}/timetable`);
    const timetableSnapshot = await getDocs(timetableRef);
    const timetable = timetableSnapshot.docs.map(doc => doc.data());

    // 시간표 초기화
    const timetableCells = document.querySelectorAll('#timetable td');
    timetableCells.forEach(cell => cell.textContent = '');

    // 시간표에 강의 표시
    timetable.forEach(course => {
        course.times.forEach(time => {
            const dayIndex = getDayIndex(time.day);
            const startHour = parseInt(time.start.split(':')[0]);
            const endHour = parseInt(time.end.split(':')[0]);

            for (let hour = startHour; hour < endHour; hour++) {
                const cell = document.querySelector(`#timetable tr:nth-child(${hour - 8}) td:nth-child(${dayIndex})`);
                if (cell) {
                    cell.textContent = `${course.courseId}`;
                }
            }
        });
    });
}

function getDayIndex(day) {
    const days = ['월', '화', '수', '목', '금'];
    return days.indexOf(day) + 2; // 월요일은 2번째 열부터 시작
}
