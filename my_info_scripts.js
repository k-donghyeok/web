// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-storage.js";

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
const storage = getStorage(app);

// 기본 이미지 URL
const defaultProfilePicUrl = "https://firebasestorage.googleapis.com/v0/b/web-project-9b882.appspot.com/o/human.jpg?alt=media&token=74cefbd7-643b-48cf-8cfb-5e05b3a79c27";

document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'flex' ? 'none' : 'flex';
    });

    // 사용자 정보 로드
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const userCreatedElement = document.getElementById('user-created');
    const profilePicElement = document.getElementById('profile-pic');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Firebase Auth에서 사용자 이름, 이메일, 가입한 날짜를 가져와서 표시
            userNameElement.textContent = user.displayName || '이름 없음';
            userEmailElement.textContent = user.email;
            userCreatedElement.textContent = new Date(user.metadata.creationTime).toLocaleDateString();

            // 프로필 사진 가져오기
            if (user.photoURL) {
                try {
                    const profilePicRef = ref(storage, user.photoURL);
                    const profilePicUrl = await getDownloadURL(profilePicRef);
                    profilePicElement.src = profilePicUrl;
                } catch (error) {
                    console.error("Error getting profile picture URL:", error);
                    profilePicElement.src = defaultProfilePicUrl;
                }
            } else {
                profilePicElement.src = defaultProfilePicUrl;
            }
        } else {
            // 사용자가 로그인되어 있지 않으면 로그인 페이지로 리디렉션
            window.location.href = 'login.html';
        }
    });
});

function deleteAccount() {
    if (confirm('정말로 회원탈퇴를 하시겠습니까?')) {
        const user = auth.currentUser;
        user.delete().then(() => {
            alert('회원탈퇴가 완료되었습니다.');
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Error:', error);
            alert('회원탈퇴에 실패하였습니다. 다시 시도해주세요.');
        });
    }
}
