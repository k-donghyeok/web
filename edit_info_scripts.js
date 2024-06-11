// Firebase SDK 추가
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, doc, setDoc, deleteField } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-storage.js";

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

    const form = document.getElementById('edit-info-form');
    const userNameInput = document.getElementById('user-name');
    const userIdInput = document.getElementById('user-id');
    const profilePicInput = document.getElementById('profile-pic');
    const deleteProfilePicButton = document.getElementById('delete-profile-pic');
    const currentProfilePicElement = document.getElementById('current-profile-pic');

    let currentPhotoURL = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            userNameInput.value = user.displayName || '';
            userIdInput.value = user.email;
            currentPhotoURL = user.photoURL;

            if (currentPhotoURL) {
                currentProfilePicElement.src = currentPhotoURL;
            } else {
                currentProfilePicElement.src = defaultProfilePicUrl;
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    deleteProfilePicButton.addEventListener('click', async function() {
        const user = auth.currentUser;
        if (user && currentPhotoURL) {
            const photoRef = ref(storage, currentPhotoURL);
            try {
                await deleteObject(photoRef);
                await updateProfile(user, { photoURL: null });

                // Firestore의 photoURL 필드를 삭제
                await updateDoc(doc(db, "users", user.uid), {
                    photoURL: deleteField()
                }, { merge: true });

                alert('프로필 사진이 삭제되었습니다.');
                currentPhotoURL = null;
                currentProfilePicElement.src = defaultProfilePicUrl;
            } catch (error) {
                console.error('Error deleting profile picture:', error);
                alert('프로필 사진 삭제에 실패하였습니다. 다시 시도해주세요.');
            }
        }
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const user = auth.currentUser;
        if (user) {
            const newName = userNameInput.value;
            const profilePic = profilePicInput.files[0];

            try {
                let photoURL = user.photoURL;
                if (profilePic) {
                    // 기존 사진 삭제
                    if (currentPhotoURL) {
                        try {
                            const oldPhotoRef = ref(storage, currentPhotoURL);
                            await deleteObject(oldPhotoRef);
                        } catch (error) {
                            console.warn('Error deleting old profile picture:', error);
                        }
                    }
                    // 새로운 사진 업로드
                    const storageRef = ref(storage, 'profile_pictures/' + user.uid + '/' + profilePic.name);
                    await uploadBytes(storageRef, profilePic);
                    photoURL = await getDownloadURL(storageRef);
                }

                await updateProfile(user, {
                    displayName: newName,
                    photoURL: photoURL
                });

                // Firestore에 사용자 정보 업데이트
                await setDoc(doc(db, "users", user.uid), {
                    name: newName,
                    photoURL: photoURL || deleteField()
                }, { merge: true });

                alert('내 정보가 수정되었습니다.');
                window.location.href = 'my-info.html';
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('정보 수정에 실패하였습니다. 다시 시도해주세요.');
            }
        } else {
            alert('사용자 정보가 없습니다. 다시 로그인해주세요.');
        }
    });
});
