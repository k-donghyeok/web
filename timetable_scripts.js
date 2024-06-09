document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'flex' ? 'none' : 'flex';
    });
});

function searchCourses() {
    const query = document.getElementById('course-search').value;
    const courses = [
        { id: 1, name: '컴퓨터공학', time: '09:00 - 10:00' },
        { id: 2, name: '교육철학', time: '10:00 - 11:00' }
    ];

    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        courseItem.draggable = true;
        courseItem.innerHTML = `${course.name} (${course.time})
            <div class="course-options">
                <a href="course_review.html">강의평</a>
                <a href="#" onclick="addToTimetable(event)">시간표담기</a>
            </div>`;
        courseItem.dataset.courseId = course.id;
        courseItem.dataset.courseTime = course.time;
        courseItem.addEventListener('dragstart', handleDragStart);
        resultsContainer.appendChild(courseItem);
    });
}

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.courseId);
    event.dataTransfer.setData('text/course-time', event.target.dataset.courseTime);
}

const timetableCells = document.querySelectorAll('#timetable td');
timetableCells.forEach(cell => {
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('drop', handleDrop);
});

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const courseId = event.dataTransfer.getData('text/plain');
    const courseTime = event.dataTransfer.getData('text/course-time');
    const cell = event.target;
    cell.textContent = `Course ID: ${courseId}, Time: ${courseTime}`;
}

function addToTimetable(event) {
    event.preventDefault();
    alert('시간표에 강의가 추가되었습니다.');
}
