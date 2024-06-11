import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, doc, collection, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";

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

    menuBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'flex' ? 'none' : 'flex';
    });

    // URL에서 friendUid를 가져옴
    const urlParams = new URLSearchParams(window.location.search);
    const friendUid = urlParams.get('friendUid');

    // 해당 친구의 시간표를 불러오는 함수 실행
    viewFriendTimetable(friendUid);
});
async function viewFriendTimetable(friendUid) {
    try {
        // 사용자의 UID를 기반으로 해당 사용자의 시간표 문서에 접근합니다.
        const userDocRef = doc(db, 'users', friendUid);
        const userDocSnapshot = await getDoc(userDocRef);
        
        if (userDocSnapshot.exists()) {
            // 사용자 문서가 존재하면 시간표 데이터를 가져옵니다.
            const timetableRef = collection(userDocRef, 'timetable');
            const timetableSnapshot = await getDocs(timetableRef);

            // 시간표 데이터가 있는지 확인합니다.
            if (!timetableSnapshot.empty) {
                // 시간표가 있으면 displayTimetable 함수를 호출하여 시간표를 표시합니다.
                displayTimetable(timetableSnapshot);
            } else {
                // 시간표가 없으면 알림을 표시합니다.
                alert('친구의 시간표가 없습니다.');
            }
        } else {
            // 사용자 문서가 존재하지 않으면 알림을 표시합니다.
            alert('친구의 사용자 정보를 찾을 수 없습니다.');
        }
    } catch (error) {
        // 오류가 발생하면 콘솔에 오류를 기록하고 알림을 표시합니다.
        console.error('시간표를 불러오는 중 오류가 발생했습니다:', error);
        alert('시간표를 불러오는 중 오류가 발생했습니다.');
    }
}

// 시간표를 화면에 표시하는 함수입니다.
async function displayTimetable(timetableSnapshot) {
    const timetableTable = document.getElementById('timetable');

    // 요일 배열을 정의합니다.
    const daysOfWeek = ['월', '화', '수', '목', '금'];

    // 각 시간대와 요일에 해당하는 셀에 데이터를 채웁니다.
    for (let i = 0; i < 18; i++) { // 18개의 시간대 (30분 간격으로 총 9시부터 17시30분까지)
        const row = timetableTable.insertRow(-1); // 행을 추가합니다.
        const timeCell = row.insertCell(0); // 시간 셀을 추가합니다.
        timeCell.textContent = `${Math.floor(i / 2) + 9}:${i % 2 === 0 ? '00' : '30'} - ${Math.floor((i + 1) / 2) + 9}:${(i + 1) % 2 === 0 ? '00' : '30'}`;

        for (let j = 0; j < 5; j++) { // 요일별로 데이터를 채웁니다.
            const cell = row.insertCell(j + 1);
            const day = daysOfWeek[j];
            
            // 해당 시간과 요일에 해당하는 시간표 데이터를 찾습니다.
            const docRef = timetableSnapshot.docs.find(doc => doc.id === day);
            if (docRef) {
                // 문서가 있으면 데이터를 가져와서 셀에 표시합니다.
                const data = docRef.data();
                const courseId = data[i]; // 해당 시간에 해당 요일에 수업이 있는 courseId를 가져옵니다.

                // 각 수업의 정보를 가져와서 표시합니다.
                if (courseId) {
                    const courseDocRef = doc(db, 'courses', courseId);
                    const courseDocSnapshot = await getDoc(courseDocRef);
                    if (courseDocSnapshot.exists()) {
                        const courseData = courseDocSnapshot.data();
                        cell.textContent = courseData.name; // 강의 이름을 셀에 표시합니다.
                    } else {
                        cell.textContent = ''; // 해당 강의 정보가 없을 경우 빈 문자열로 표시합니다.
                    }
                } else {
                    cell.textContent = ''; // 해당 시간에 강의가 없을 경우 빈 문자열로 표시합니다.
                }
            } else {
                cell.textContent = ''; // 해당 시간과 요일에 해당하는 문서가 없으면 빈 문자열을 사용합니다.
            }
        }
    }
}
