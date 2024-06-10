// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
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
            // 사용자 정보가 확인되면 사용자 시간표 로드
            loadUserTimetable(user.uid);
        } else {
            // 사용자가 로그인되어 있지 않으면 로그인 페이지로 리디렉션
            window.location.href = 'login.html';
        }
    });
});

async function loadUserTimetable(userId) {
    const timetableRef = collection(db, `users/${userId}/timetable`);
    const timetableSnapshot = await getDocs(timetableRef);
    const timetable = timetableSnapshot.docs.map(doc => doc.data());

    // 시간표 초기화
    const timetableBody = document.querySelector('#timetable tbody');
    timetableBody.innerHTML = ''; // 기존 내용 제거

    const times = [
        "09:00 - 09:30",
        "09:30 - 10:00",
        "10:00 - 10:30",
        "10:30 - 11:00",
        "11:00 - 11:30",
        "11:30 - 12:00",
        "12:00 - 12:30",
        "12:30 - 13:00",
        "13:00 - 13:30",
        "13:30 - 14:00",
        "14:00 - 14:30",
        "14:30 - 15:00",
        "15:00 - 15:30",
        "15:30 - 16:00",
        "16:00 - 16:30",
        "16:30 - 17:00",
        "17:00 - 17:30",
        "17:30 - 18:00"
    ];

    // 시간표 초기화
    times.forEach(time => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = time;
        row.appendChild(timeCell);

        for (let i = 0; i < 5; i++) {
            const cell = document.createElement('td');
            row.appendChild(cell);
        }

        timetableBody.appendChild(row);
    });

    // 시간표에 강의 표시
    for (const course of timetable) {
        const courseDoc = await getDoc(doc(db, 'courses', course.courseId));
        const courseData = courseDoc.data();
        const color = course.color; // 배경색 가져오기

        courseData.times.forEach(time => {
            const dayIndex = getDayIndex(time.day);
            const startHour = parseInt(time.start.split(':')[0]);
            const startMinute = parseInt(time.start.split(':')[1]);
            const endHour = parseInt(time.end.split(':')[0]);
            const endMinute = parseInt(time.end.split(':')[1]);
            const rowStart = ((startHour - 9) * 2) + (startMinute >= 30 ? 1 : 0);
            const rowEnd = ((endHour - 9) * 2) + (endMinute >= 30 ? 1 : 0);

            for (let i = rowStart; i < rowEnd; i++) {
                const cell = document.querySelector(`#timetable tbody tr:nth-child(${i + 1}) td:nth-child(${dayIndex})`);
                if (cell) {
                    cell.innerHTML = `${courseData.name}<br>${courseData.location}`;
                    cell.style.backgroundColor = color; // 배경색 적용
                }
            }
        });
    }
}

function getDayIndex(day) {
    const days = ['월', '화', '수', '목', '금'];
    return days.indexOf(day) + 2; // 월요일은 2번째 열부터 시작
}
