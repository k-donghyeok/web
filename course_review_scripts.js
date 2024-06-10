import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";

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
    // 현재 페이지의 URL 가져오기
    const urlParams = new URLSearchParams(window.location.search);

    // URL 매개변수에서 course_id 값을 가져오기
    const courseId = urlParams.get('course_id');

    // 가져온 courseId를 사용하여 필요한 작업 수행
    console.log(courseId);

    // Firebase Firestore에서 해당 courseId의 강의 정보 가져오기
    const course = await getCourseFromFirestore(courseId);

    // 강의 정보를 HTML에 추가
    const courseInfoContainer = document.querySelector('.course-info');

    // 강의 정보를 보여줄 HTML 요소 생성
    const courseNameElement = document.createElement('p');
    courseNameElement.innerHTML = `<strong>과목명:</strong> ${course.name}`;
    document.getElementById('course-name').appendChild(courseNameElement);

    const courseProfessorElement = document.createElement('p');
    courseProfessorElement.innerHTML = `<strong>교수명:</strong> ${course.professor}`;
    document.getElementById('course-professor').appendChild(courseProfessorElement);

    const courseIdElement = document.createElement('p');
    courseIdElement.innerHTML = `<strong>과목코드:</strong> ${course.id}`;
    document.getElementById('course-id').appendChild(courseIdElement);

    const courseTypeElement = document.createElement('p');
    courseTypeElement.innerHTML = `<strong>구분:</strong> ${course.type}`;
    document.getElementById('course-type').appendChild(courseTypeElement);

    const courseYearElement = document.createElement('p');
    courseYearElement.innerHTML = `<strong>학년:</strong> ${course.year}`;
    document.getElementById('course-year').appendChild(courseYearElement);

    const courseTimeElement = document.createElement('p');
    courseTimeElement.innerHTML = `<strong>시간:</strong> ${course.times.map(time => `${time.day} ${time.start}-${time.end}`).join(', ')}`;
    document.getElementById('course-time').appendChild(courseTimeElement);

    const courseLocationElement = document.createElement('p');
    courseLocationElement.innerHTML = `<strong>장소:</strong> ${course.location}`;
    document.getElementById('course-location').appendChild(courseLocationElement);

    const courseCreditElement = document.createElement('p');
    courseCreditElement.innerHTML = `<strong>학점:</strong> ${course.credit}`;
    document.getElementById('course-credit').appendChild(courseCreditElement);
    
});

async function getCourseFromFirestore(courseId) {
    // 'courses' 컬렉션에서 해당 courseId를 가진 문서를 가져오는 코드 작성
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data(); // 해당 문서의 데이터 반환
    } else {
        console.log('No such document!');
        return null; // 문서를 찾지 못한 경우 null 반환
    }
}
