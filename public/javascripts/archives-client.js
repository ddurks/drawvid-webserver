var archive_postlist;

window.onload = async () => {
    const response = fetch('fetchpost?post=all')
    .then(response => {
      response.json()
      .then(result => makeList(result));
    })
    .catch(error => console.error(error));

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.setAttribute( "onClick", "closeModal()" );
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function makeList(array) {
    var list = document.getElementById('archive-list');
    document.getElementById('drawvid-footer').remove();

    var year = '2019';
    var yearMarker = document.createElement('p');
    yearMarker.style.textDecoration = 'underline';
    yearMarker.appendChild(document.createTextNode(year));
    list.appendChild(yearMarker);
    for (var i = 0; i < array.length; i++) {
        if (array[i].created_date.substr(0,4) != year) {
            year = array[i].created_date.substr(0,4);
            yearMarker = document.createElement('p');
            yearMarker.style.textDecoration = 'underline';
            yearMarker.appendChild(document.createTextNode(year));
            list.appendChild(yearMarker);
        }
        var button = document.createElement('button');
        var text = document.createTextNode( array[i].image_name );
        button.appendChild(text);
        button.title = array[i].image_name;
        var color = getRandomColor();
        button.style.background = color;
        button.style.color = invertColor(color, true);
        button.classList.add('archive-button');
        button.setAttribute( "onClick", "showModal(this.title)" );

        var date = document.createTextNode(" - " + array[i].created_date.substr(0,10));

        var li = document.createElement('li');
        li.appendChild(button);
        li.appendChild(date);

        li.className = 'archive-item';

        // Add it to the list:
        list.appendChild(li);
        var br = document.createElement("br");
        list.appendChild(br);
    }

}

function changeSrc(image_src, change_img) {
    change_img.src = image_src;
}

function loadImage(image_src, change_img) {
    var load_image = new Image();
    console.log("got here 2");
    load_image.onload = changeSrc(image_src, change_img);
    load_image.src = image_src;
}

function showModal(poststring) { 
    var modal = document.getElementById('myModal');
    var modalImg = document.getElementById("modal-img");
    var captionText = document.getElementById("caption");
    console.log("got here");
    modalImg.onload = function() {
        modal.style.display = 'block';
    }
    modalImg.src = 'http://drawvid.com/posts/' + poststring;
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