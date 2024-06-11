// Firebase 구성
const firebaseConfig = {
    apiKey: "Your-API-Key",
    authDomain: "Your-Auth-Domain",
    projectId: "Your-Project-ID",
    storageBucket: "Your-Storage-Bucket",
    messagingSenderId: "Your-Messaging-Sender-ID",
    appId: "Your-App-ID",
    measurementId: "Your-Measurement-ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 친구 추가 및 시간표 보기 함수
async function addFriendAndShowTimetable() {
    const userEmail = document.getElementById("user-email").value; // 현재 사용자 이메일
    const friendEmail = document.getElementById("friend-email").value; // 친구의 이메일

    // 친구의 시간표 가져오기
    const friendTimetableRef = db.collection("user_timetables").doc(friendEmail);
    const friendTimetableSnapshot = await friendTimetableRef.get();

    if (friendTimetableSnapshot.exists) {
        const friendTimetableData = friendTimetableSnapshot.data();
        console.log("Friend's Timetable:", friendTimetableData);

        // 시간표 표시하기
        const timetableContainer = document.getElementById("timetable-container");
        timetableContainer.innerHTML = `<h2>${friendEmail}의 시간표</h2>`;
        // 여기에 시간표를 HTML로 표시하는 코드를 추가합니다.
    } else {
        console.log("Friend's Timetable does not exist.");
        alert("친구의 시간표가 존재하지 않습니다.");
    }
}

// HTML에서 사용할 버튼에 이벤트 리스너 추가
document.getElementById("add-friend-btn").addEventListener("click", addFriendAndShowTimetable);
