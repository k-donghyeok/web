// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
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

document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('User is signed in:', user);
            await loadFriends(user.uid);
        } else {
            console.log('No user is signed in.');
            window.location.href = 'login.html';
        }
    });

    document.getElementById('add-friend-form').addEventListener('submit', addFriend);
});

async function loadFriends(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            console.error('No such document!');
            return;
        }

        const userData = userDoc.data();
        const friends = userData.friends || [];
        const friendList = document.getElementById('friend-list');
        friendList.innerHTML = ''; // 기존 목록 초기화

        for (const friendUid of friends) {
            const friendDoc = await getDoc(doc(db, 'users', friendUid));
            if (friendDoc.exists()) {
                const friendData = friendDoc.data();
                const friendItem = document.createElement('li');
                friendItem.className = 'friend-item';

                // 친구의 프로필 사진 가져오기
                let profilePicUrl = 'human.jpg'; // 기본 프로필 사진 URL
                if (friendData.photoURL) {
                    try {
                        profilePicUrl = await getDownloadURL(ref(storage, friendData.photoURL));
                    } catch (error) {
                        console.error('Error getting profile picture URL:', error);
                    }
                }

                const profilePic = document.createElement('img');
                profilePic.src = profilePicUrl;
                profilePic.alt = `${friendData.name}의 프로필 사진`;
                profilePic.className = 'profile-pic';
                friendItem.appendChild(profilePic);

                const friendName = document.createElement('span');
                friendName.className = 'friend-name';
                friendName.textContent = friendData.name;
                friendItem.appendChild(friendName);

                const friendOptions = document.createElement('div');
                friendOptions.className = 'friend-options';

                const deleteLink = document.createElement('a');
                deleteLink.href = '#';
                deleteLink.textContent = '친구 삭제';
                deleteLink.addEventListener('click', () => deleteFriend(userId, friendUid));
                friendOptions.appendChild(deleteLink);

                const hr = document.createElement('hr');
                friendOptions.appendChild(hr);

                const viewTimetableLink = document.createElement('a');
                viewTimetableLink.href = `view_timetable.html?friendUid=${friendUid}`;
                viewTimetableLink.target = '_self';
                viewTimetableLink.textContent = '시간표 보기';
                friendOptions.appendChild(viewTimetableLink);

                friendItem.appendChild(friendOptions);
                friendList.appendChild(friendItem);
            } else {
                console.log(`No such friend document: ${friendUid}`);
            }
        }
    } catch (error) {
        console.error('Error loading friends:', error);
    }
}

async function deleteFriend(userId, friendUid) {
    try {
        await updateDoc(doc(db, 'users', userId), {
            friends: arrayRemove(friendUid)
        });
        alert('친구가 삭제되었습니다.');
        await loadFriends(userId);
    } catch (error) {
        console.error('친구 삭제 실패:', error);
        alert('친구 삭제 실패: ' + error.message);
    }
}

async function addFriend(event) {
    event.preventDefault();
    const friendUid = document.getElementById('friend-uid').value.trim();

    try {
        const friendDoc = await getDoc(doc(db, 'users', friendUid));
        if (!friendDoc.exists()) {
            throw new Error('존재하지 않는 UID입니다.');
        }

        const userId = auth.currentUser.uid;
        await updateDoc(doc(db, "users", userId), {
            friends: arrayUnion(friendUid)
        });

        console.log('친구 추가 성공');
        alert('친구 추가 성공!');
        closeAddFriendPopup();
        await loadFriends(userId);
    } catch (error) {
        console.error('친구 추가 실패:', error);
        alert('친구 추가 실패: ' + error.message);
    }
}

window.showAddFriendPopup = function() {
    document.getElementById('add-friend-popup').style.display = 'block';
}

window.closeAddFriendPopup = function() {
    document.getElementById('add-friend-popup').style.display = 'none';
}
