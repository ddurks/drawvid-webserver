var current_post_number = 0;
var r_p = 100;
var current_drawing = 0;

const url = new URL("http://localhost:3000");
const drawvid_posts_host = "https://drawvid-posts.s3.amazonaws.com/";

function updatePage(current_drawing) {
    document.getElementById('drawing-img').src = drawvid_posts_host + current_drawing.art_name.S;
}

window.onload = async () => {
  latest();
}

function latest() {
  console.log("latest");
  const response = fetch(url + 'fetchpost?post=latest')
  .then(response => response.json())
  .then(data => {
      console.log(data.drawing.art_name.S);
      updatePage(data.drawing);
  })
  .catch(error => console.error(error));
}

// GET random post from DB
function random() {
  console.log("random");
}

// GET prev post from db
function prev() {
  console.log("prev");
  if(current_drawing.num > 0) {
    const response = fetch('fetchpost?post=' + current_drawing.num)
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => console.error(error));
  }
}

// GET next post from db
function next() {
  console.log("next");
  if(current_drawing.num < r_p) {
    const response = fetch('fetchpost?post=' + current_drawing.num)
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => console.error(error));
  }
}