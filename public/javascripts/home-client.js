var current_post_number;
var r_p;
var current_drawing;

function updatePage(current_drawing) {
    document.getElementById('main-display').src = current_drawing.image;
    if (current_drawing.text != null) {
        document.getElementById('drawing-text').innerHTML = current_drawing.text;
    } else {
        document.getElementById('drawing-text').innerHTML = current_drawing.imagename;
    }
    var c_d = new Date(current_drawing.created_date);
    document.getElementById('drawing-date').innerHTML = c_d.toLocaleString('en-us', { month: 'long' }) + ' ' + c_d.getUTCDay() + ', ' + c_d.getUTCFullYear();
}

window.onload = async () => {
  latest();
}

function latest() {
  console.log("latest");
}

// GET random post from DB
function random() {
  console.log("random");
}

// GET prev post from db
function prev() {
  console.log("prev");
}

// GET next post from db
function next() {
  console.log("next");
}