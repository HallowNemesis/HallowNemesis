function toggleContent(button) {
    const content = button.parentElement.previousElementSibling;
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        button.innerHTML = "<b>READ LESS «</b>";
    } else {
        content.style.display = "none";
        button.innerHTML = "<b>READ MORE »</b>";
    }
}

function submitComment(button) {
    const container = button.parentElement;
    const nameInput = container.querySelector('.comment-name');
    const commentInput = container.querySelector('.comment-text');
    const commentsList = container.querySelector('.comments-list');

    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();

    if (name && comment) {
        const commentDiv = document.createElement('div');
        commentDiv.style.marginTop = '5px';
        commentDiv.innerHTML = `<strong>${name}:</strong> ${comment}`;
        commentsList.appendChild(commentDiv);

        nameInput.value = '';
        commentInput.value = '';
    } else {
        alert('Please enter your name and comment.');
    }

    function likePost(button) {
        const countSpan = button.querySelector('.like-count');
        let count = parseInt(countSpan.textContent);
        countSpan.textContent = count + 1;
    }
}