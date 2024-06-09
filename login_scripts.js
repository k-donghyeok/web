// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

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
const auth = getAuth(app);

// 로그인 함수
async function login(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log(`Email: ${email}, Password: ${password}`); // 디버깅 로그

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Logged in:", userCredential.user);
        alert("로그인 성공!");
        // 로그인 성공 시 "내 시간표" 페이지로 이동
        window.location.href = 'main.html'; // 이동할 페이지의 경로를 적절히 수정하세요
    } catch (error) {
        console.error("Error logging in:", error);
        alert("로그인 실패: " + error.message);
    }
}

// 폼에 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('form').addEventListener('submit', login);
});
