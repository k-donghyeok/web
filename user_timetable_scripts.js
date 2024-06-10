// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
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
    const searchButton = document.getElementById('search-button');

    menuBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'flex' ? 'none' : 'flex';
    });

    searchButton.addEventListener('click', searchCourses);

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

async function displayCourses(courses = null) {
    const coursesCollection = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesCollection);
    const allCourses = coursesSnapshot.docs.map(doc => doc.data());
    const filteredCourses = courses || allCourses;

    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    filteredCourses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        courseItem.innerHTML = `
            ${course.id} - ${course.name} (${course.professor})<br>
            ${course.type} (${course.times.map(time => `${time.day} ${time.start}-${time.end}`).join(', ')})<br>
            장소: ${course.location}<br>
            학년도: ${course.year}<br>
            학점: ${course.credit}
            <div class="course-options">
                <a href="course_review.html">강의평</a>
                <a href="#" class="add-timetable-button" data-course='${JSON.stringify(course)}'>시간표담기</a>
            </div>`;
        resultsContainer.appendChild(courseItem);
    });

    // 시간표담기 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.add-timetable-button').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const course = JSON.parse(this.dataset.course);
            addToTimetable(course);
        });
    });
}

window.addToTimetable = async function(course) {
    const user = auth.currentUser;
    if (user) {
        const timetableRef = collection(db, `users/${user.uid}/timetable`);
        const timetableSnapshot = await getDocs(timetableRef);
        const timetable = timetableSnapshot.docs.map(doc => doc.data());

        // 새로운 강의 시간이 기존 시간표와 겹치는지 확인
        for (const courseData of timetable) {
            const courseDoc = await getDoc(doc(db, 'courses', courseData.courseId));
            const existingCourse = courseDoc.data();

            if (isTimeOverlap(existingCourse.times, course.times)) {
                alert("이미 그 시간에 다른 강의가 있습니다.");
                return;
            }
        }

        // 배경색 할당
        const color = getColor(timetable.length);

        const userTimetableRef = doc(db, `users/${user.uid}/timetable`, course.id);
        setDoc(userTimetableRef, {
            courseId: course.id,
            color: color // 배경색 추가
        }).then(() => {
            alert('시간표에 강의가 추가되었습니다.');
            loadUserTimetable(user.uid);
        }).catch((error) => {
            console.error("Error adding to timetable: ", error);
            alert("시간표에 강의 추가 중 오류가 발생했습니다.");
        });
    }
};

window.deleteFromTimetable = async function(courseId) {
    const user = auth.currentUser;
    if (user) {
        const userTimetableRef = doc(db, `users/${user.uid}/timetable`, courseId);
        await deleteDoc(userTimetableRef).then(() => {
            alert('강의가 시간표에서 삭제되었습니다.');
            loadUserTimetable(user.uid);
        }).catch((error) => {
            console.error("Error deleting from timetable: ", error);
            alert("시간표에서 강의 삭제 중 오류가 발생했습니다.");
        });
    }
};

function isTimeOverlap(existingTimes, newTimes) {
    for (const newTime of newTimes) {
        for (const existingTime of existingTimes) {
            if (newTime.day === existingTime.day) {
                const newStart = parseTime(newTime.start);
                const newEnd = parseTime(newTime.end);
                const existingStart = parseTime(existingTime.start);
                const existingEnd = parseTime(existingTime.end);

                if ((newStart >= existingStart && newStart < existingEnd) || (newEnd > existingStart && newEnd <= existingEnd) || (existingStart >= newStart && existingStart < newEnd) || (existingEnd > newStart && existingEnd <= newEnd)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function parseTime(timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number);
    return hour * 60 + minute;
}

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
        const color = course.color;

        courseData.times.forEach(time => {
            const dayIndex = getDayIndex(time.day);
            const startHour = parseInt(time.start.split(':')[0]);
            const startMinute = parseInt(time.start.split(':')[1]);
            const endHour = parseInt(time.end.split(':')[0]);
            const endMinute = parseInt(time.end.split(':')[1]);
            const rowStart = ((startHour - 9) * 2) + (startMinute >= 30 ? 1 : 0);
            const rowEnd = ((endHour - 9) * 2) + (endMinute >= 30 ? 1 : 0);

            for (let i = rowStart; i < rowEnd; i++) {
                const cell = document.querySelector(`#timetable tr:nth-child(${i + 1}) td:nth-child(${dayIndex})`);
                if (cell) {
                    cell.innerHTML = `${courseData.name}<br>${courseData.location}`;
                    cell.style.backgroundColor = color;
                    cell.dataset.courseId = course.courseId; // 셀에 courseId를 저장
                    cell.classList.add('clickable-cell'); // 셀에 클릭 가능 클래스 추가
                    cell.addEventListener('click', showDeleteConfirmation); // 셀 클릭 시 삭제 확인 창 표시
                }
            }
        });
    }
}

function showDeleteConfirmation(event) {
    const courseId = event.target.dataset.courseId;
    const courseName = event.target.innerText.split('\n')[0]; // 강의 이름 추출
    const confirmation = confirm(`"${courseName}" 강의를 삭제하시겠습니까?`);
    if (confirmation) {
        deleteFromTimetable(courseId);
    }
}

function getDayIndex(day) {
    const days = ['월', '화', '수', '목', '금'];
    return days.indexOf(day) + 2; // 월요일은 2번째 열부터 시작
}

function getColor(index) {
    const colors = [
        '#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9',
        '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9',
        '#DCEDC8', '#F0F4C3', '#FFF9C4', '#FFECB3', '#FFE0B2'
    ];
    return colors[index];
}

function searchCourses() {
    const searchId = document.getElementById('search-id').value.toLowerCase();
    const searchName = document.getElementById('search-name').value.toLowerCase();
    const searchProfessor = document.getElementById('search-professor').value.toLowerCase();
    const searchType = document.getElementById('search-type').value.toLowerCase();
    const searchYear = document.getElementById('search-year').value.toLowerCase();
    const searchCredit = document.getElementById('search-credit').value.toLowerCase();

    const coursesCollection = collection(db, 'courses');

    getDocs(coursesCollection).then((coursesSnapshot) => {
        const allCourses = coursesSnapshot.docs.map(doc => doc.data());
        const filteredCourses = allCourses.filter(course => {
            return (
                (!searchId || course.id.toLowerCase().includes(searchId)) &&
                (!searchName || course.name.toLowerCase().includes(searchName)) &&
                (!searchProfessor || course.professor.toLowerCase().includes(searchProfessor)) &&
                (!searchType || course.type.toLowerCase().includes(searchType)) &&
                (!searchYear || course.year.toLowerCase().includes(searchYear)) &&
                (!searchCredit || course.credit.toString().includes(searchCredit))
            );
        });

        displayCourses(filteredCourses);
    }).catch((error) => {
        console.error("Error searching courses: ", error);
    });
}
