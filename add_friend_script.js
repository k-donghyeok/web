// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";
import { getFirestore, collection, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
   
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
    const db = getFirestore(app);

    // 친구 추가 함수
    async function addFriend(event) {
        event.preventDefault();
        const friendUid = document.getElementById('friend-uid').value; // 친구의 UID 입력란

        try {
            // 사용자의 UID 가져오기
            const userId = auth.currentUser.uid;

           
            await setDoc(doc(db, "users", userId), {
                friendUid: friendUid
            }, { merge: true });

            console.log('친구 추가 성공');
            alert('친구 추가 성공!');
        } catch (error) {
            console.error('친구 추가 실패:', error);
            alert('친구 추가 실패: ' + error.message);
        }
    }

    // 폼에 이벤트 리스너 추가
    document.getElementById('add-friend-form').addEventListener('submit', addFriend);
});
