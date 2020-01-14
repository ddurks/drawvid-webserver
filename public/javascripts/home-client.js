var curr_post_id = 0;
var latest_post_id = 0;

const url = new URL("http://localhost:3000");
const drawvid_posts_host = url + 'posts/';

function updatePage(current_drawing) {
  curr_post_id = current_drawing.id;
  document.getElementById('drawing-img').src = drawvid_posts_host + current_drawing.image_name;
}

window.onload = async () => {
  latest();
  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.setAttribute( "onClick", "closeModal()" );
}

function latest() {
  console.log("latest");
  const response = fetch(url + 'fetchpost?post=latest')
  .then(response => response.json())
  .then(data => {
      console.log(data.image_name);
      latest_post_id = data.id;
      updatePage(data);
  })
  .catch(error => console.error(error));
}

// GET random post from DB
function random() {
  console.log("random");
  const response = fetch('fetchpost?post=random')
  .then(response => response.json())
  .then(data => {
      console.log(data);
      updatePage(data);
  })
  .catch(error => console.error(error));
}

// GET prev post from db
function prev() {
  console.log("prev");
  if(curr_post_id > 0) {
    var prev_post_id = curr_post_id - 1;
    const response = fetch('fetchpost?post=' + prev_post_id)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        updatePage(data);
    })
    .catch(error => console.error(error));
  }
}

// GET next post from db
function next() {
  console.log("next");
  if(curr_post_id < latest_post_id) {
    var next_post_id = curr_post_id + 1;
    const response = fetch('fetchpost?post=' + next_post_id)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        updatePage(data);
    })
    .catch(error => console.error(error));
  }
}

function showModal(poststring) { 
  var modal = document.getElementById('myModal');
  var modalImg = document.getElementById("modal-img");
  var captionText = document.getElementById("caption");
  console.log("got here");
  modalImg.onload = function() {
      modal.style.display = 'block';
  }
  modalImg.src = poststring;
  captionText.innerHTML = poststring;
}

function closeModal() {
  var modal = document.getElementById('myModal');
  modal.style.display = "none";
}