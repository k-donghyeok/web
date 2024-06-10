// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
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
            displayAllCourses();
        } else {
            // 사용자가 로그인되어 있지 않으면 로그인 페이지로 리디렉션
            window.location.href = 'login.html';
        }
    });
});

async function displayAllCourses() {
    const coursesCollection = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesCollection);
    const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));

    const resultsContainer = document.getElementById('all-courses');
    resultsContainer.innerHTML = '';

    courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        courseItem.innerHTML = `
            ${course.data.id} - ${course.data.name} (${course.data.professor})<br>
            ${course.data.type} (${course.data.times.map(time => `${time.day} ${time.start}-${time.end}`).join(', ')})<br>
            장소: ${course.data.location}<br>
            학년도: ${course.data.year}<br>
            학점: ${course.data.credit}
            <button class="delete-course-button" data-course-id="${course.id}">삭제</button>
        `;
        resultsContainer.appendChild(courseItem);
    });

    // 삭제 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.delete-course-button').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const courseId = this.dataset.courseId;
            deleteCourse(courseId);
        });
    });
}

function addCourseTime() {
    const courseTimes = document.getElementById('course-times');
    const newCourseTime = document.createElement('div');
    newCourseTime.className = 'course-time';
    newCourseTime.innerHTML = `
        <select class="course-day">
            <option value="월">월</option>
            <option value="화">화</option>
            <option value="수">수</option>
            <option value="목">목</option>
            <option value="금">금</option>
        </select>
        <input type="time" class="course-start">
        <input type="time" class="course-end">
    `;
    courseTimes.appendChild(newCourseTime);
}

async function addCourse() {
    const courseId = document.getElementById('new-course-id').value;
    const courseName = document.getElementById('new-course-name').value;
    const courseProfessor = document.getElementById('new-course-professor').value;
    const courseType = document.getElementById('new-course-type').value;
    const courseLocation = document.getElementById('new-course-location').value;
    const courseYear = document.getElementById('new-course-year').value;
    const courseCredit = document.getElementById('new-course-credit').value;
    const courseTimeElements = document.querySelectorAll('.course-time');

    const courseTimes = Array.from(courseTimeElements).map(el => {
        return {
            day: el.querySelector('.course-day').value,
            start: el.querySelector('.course-start').value,
            end: el.querySelector('.course-end').value
        };
    });

    try {
        const docRef = doc(db, 'courses', courseId);
        await setDoc(docRef, {
            id: courseId,
            name: courseName,
            professor: courseProfessor,
            type: courseType,
            location: courseLocation,
            year: courseYear,
            credit: courseCredit,
            times: courseTimes
        });
        console.log("Document written with ID: ", courseId);
        alert("강의가 추가되었습니다.");
        await displayAllCourses(); // 강의 추가 후 목록 갱신
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("강의 추가 중 오류가 발생했습니다.");
    }
}

async function deleteCourse(courseId) {
    try {
        await deleteDoc(doc(db, 'courses', courseId));
        console.log("Document successfully deleted!");
        alert("강의가 삭제되었습니다.");
        await displayAllCourses(); // 강의 삭제 후 목록 갱신
    } catch (e) {
        console.error("Error deleting document: ", e);
        alert("강의 삭제 중 오류가 발생했습니다.");
    }
}

// addCourse 함수를 전역 범위에 추가
window.addCourse = addCourse;
window.addCourseTime = addCourseTime;
