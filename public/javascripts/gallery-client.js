const DRAWINGS_PER_PAGE = 9;
var minRange = 0;
var maxRange = DRAWINGS_PER_PAGE;
var gallery_array = [];
var posts_max = 0;

window.onload = async () => {
  const response = fetch('fetchpost?post=all')
  .then(response => {
    response.json()
    .then(result => {
      posts_max = result.length;
      makeGallery(result);
    });
  })
  .catch(error => console.error(error));

  var span = document.getElementsByClassName("close")[0];
  span.setAttribute( "onClick", "closeModal()" );
}

function makeGallery(array) {
  if (array != null) gallery_array = array;

  var galleryImg = null;
  for (var i = minRange; i < maxRange; i++) {
    galleryImg = document.getElementById('g' + String(i%DRAWINGS_PER_PAGE));
    if (i < posts_max) {
      if (array != null) {
        galleryImg.src = 'http://drawvid.com/posts/' + gallery_array[i].image_name;
      } else {
        galleryImg.src = 'http://drawvid.com/posts/' + gallery_array[getRandomIndex(posts_max)].image_name;
      }
    } else {
      galleryImg.src = '';
    }
    galleryImg.setAttribute( "onClick", "showModal(this.src)" );
  }

}

function getRandomIndex(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
// GET random post from DB
function shuffle() {
  makeGallery(null);
}

// GET prev post from db
function prev_page() {
  if(maxRange + DRAWINGS_PER_PAGE <= gallery_array.length) {
    minRange+=DRAWINGS_PER_PAGE;
    maxRange+=DRAWINGS_PER_PAGE;
    console.log(minRange, maxRange);
    makeGallery(gallery_array);
  }
}

// GET next post from db
function next_page() {
  if(minRange - DRAWINGS_PER_PAGE >= 0) {
    minRange-=DRAWINGS_PER_PAGE;
    maxRange-=DRAWINGS_PER_PAGE;
    console.log(minRange, maxRange);
    makeGallery(gallery_array);
  }
}

function showModal(poststring) { 
  var modal = document.getElementById('myModal');
  var modalImg = document.getElementById("modal-img");
  var captionText = document.getElementById("caption");
  console.log(poststring);
  modalImg.src = poststring;
  console.log(modalImg.src);
  modal.style.display = 'block';
  captionText.innerHTML = poststring.substring(poststring.lastIndexOf('/') + 1);
}

function closeModal() {
  var modal = document.getElementById('myModal');
  modal.style.display = "none";
}