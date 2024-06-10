// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, doc, getDocs, deleteDoc, collection } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";
import { getStorage, ref, deleteObject } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-storage.js";

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

    // 특정 컬렉션의 모든 문서 삭제 함수
    async function deleteAllDocumentsInCollection(collectionRef) {
        const querySnapshot = await getDocs(collectionRef);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    }

    // 회원탈퇴 함수 정의
    async function deleteAccount() {
        if (confirm('정말로 회원탈퇴를 하시겠습니까?')) {
            const user = auth.currentUser;
            if (user) {
                try {
                    // 재인증 절차
                    const credential = EmailAuthProvider.credential(user.email, prompt('비밀번호를 입력해주세요.'));
                    await reauthenticateWithCredential(user, credential);

                    // Firestore에서 사용자 문서 및 하위 컬렉션 삭제
                    const userDocRef = doc(db, 'users', user.uid);
                    const timetableCollectionRef = collection(userDocRef, 'timetable');

                    console.log(`Deleting timetable documents for user: ${user.uid}`);
                    await deleteAllDocumentsInCollection(timetableCollectionRef);

                    console.log(`Deleting timetable collection for user: ${user.uid}`);
                    await deleteDoc(userDocRef);

                    console.log(`Deleted Firestore document for user: ${user.uid}`);

                    // 프로필 사진 삭제
                    if (user.photoURL) {
                        const photoRef = ref(storage, user.photoURL);
                        await deleteObject(photoRef);
                        console.log(`Deleted profile picture for user: ${user.uid}`);
                    }

                    // 계정 삭제
                    await user.delete();
                    alert('회원탈퇴가 완료되었습니다.');
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Error:', error);
                    if (error.code === 'auth/wrong-password') {
                        alert('비밀번호가 틀렸습니다. 다시 시도해주세요.');
                    } else if (error.code === 'auth/requires-recent-login') {
                        alert('최근 로그인 기록이 없습니다. 다시 로그인해주세요.');
                        window.location.href = 'login.html';
                    } else {
                        alert('회원탈퇴에 실패하였습니다. 다시 시도해주세요.');
                    }
                }
            }
        }
    }

    // 회원탈퇴 버튼에 이벤트 리스너 추가
    const deleteAccountBtn = document.querySelector('.delete-account-btn');
    deleteAccountBtn.addEventListener('click', deleteAccount);
});
