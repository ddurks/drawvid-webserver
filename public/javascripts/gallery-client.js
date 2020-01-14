var minRange = 0;
var maxRange = 9;
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

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.setAttribute( "onClick", "closeModal()" );
}

function makeGallery(array) {
  if (array != null) gallery_array = array;

  var galleryImg = null;
  for (var i = minRange; i < maxRange; i++) {
    galleryImg = document.getElementById('g' + String(i%9));
    if (i < posts_max) {
      if (array != null) {
        galleryImg.src = 'http://drawvid.com/posts/' + gallery_array[i].image_name;
      } else {
        galleryImg.src = 'http://drawvid.com/posts/' + gallery_array[getRandomIndex(posts_max)].image_name;
      }
    } else {
      galleryImg.src = '';
    }
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
  if(maxRange + 9 <= gallery_array.length) {
    minRange+=9;
    maxRange+=9;
    console.log(minRange, maxRange);
    makeGallery(gallery_array);
  }
}

// GET next post from db
function next_page() {
  if(minRange - 9 >= 0) {
    minRange-=9;
    maxRange-=9;
    console.log(minRange, maxRange);
    makeGallery(gallery_array);
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

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(var i = this.length - 1; i >= 0; i--) {
      if(this[i] && this[i].parentElement) {
          this[i].parentElement.removeChild(this[i]);
      }
  }
}