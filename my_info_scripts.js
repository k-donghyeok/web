document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'flex' ? 'none' : 'flex';
    });
});

function deleteAccount() {
    if (confirm('정말로 회원탈퇴를 하시겠습니까?')) {
        // 여기에서 서버로 회원탈퇴 요청을 보냅니다.
        fetch('/delete_account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: 'user1234' }) // 실제 사용자 ID로 교체하세요.
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('회원탈퇴가 완료되었습니다.');
                // 필요 시 페이지를 리다이렉트할 수 있습니다.
                window.location.href = 'index.html';
            } else {
                alert('회원탈퇴에 실패하였습니다. 다시 시도해주세요.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('회원탈퇴에 실패하였습니다. 다시 시도해주세요.');
        });
    }
}
