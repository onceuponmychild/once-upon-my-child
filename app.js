var state = {
currentStep: 1,

child: {
name: "",
age: "",
personality: "",
favorites: ""
},

story: {
type: "Magical Adventure",
setting: "",
lesson: "",
length: "medium",
tone: "warm"
},

photos: [],
generatedStory: null
};

document.addEventListener("DOMContentLoaded", function () {
initializeApp();
});

function initializeApp() {
setupAdventureCards();
setupNavigation();
setupStorySettings();
setupPhotoUpload();
setupStoryActions();
updateStep();
renderPhotos();
}

function setupAdventureCards() {
var container = document.getElementById("storyTypeChoices");

if (!container) {
return;
}

var cards = container.querySelectorAll(".choice-card");

cards.forEach(function (card) {
card.addEventListener("click", function () {
cards.forEach(function (item) {
item.classList.remove("selected");
item.setAttribute("aria-selected", "false");
});

```
  card.classList.add("selected");
  card.setAttribute("aria-selected", "true");

  state.story.type =
    card.getAttribute("data-value") ||
    "Magical Adventure";

  console.log("Adventure selected:", state.story.type);
});
```

});
}

function setupNavigation() {
var continueButton =
document.getElementById("continueToPhotos");

var backButton =
document.getElementById("backToDetails");

if (continueButton) {
continueButton.addEventListener("click", function () {
if (!collectChildDetails()) {
return;
}

```
  collectStoryPreferences();
  goToStep(2);
});
```

}

if (backButton) {
backButton.addEventListener("click", function () {
goToStep(1);
});
}
}

function goToStep(stepNumber) {
state.currentStep = stepNumber;
updateStep();

window.scrollTo({
top: 0,
behavior: "smooth"
});
}

function updateStep() {
var screens = document.querySelectorAll(".screen");

screens.forEach(function (screen) {
screen.classList.remove("active");
});

var activeScreen =
document.getElementById("step" + state.currentStep);

if (activeScreen) {
activeScreen.classList.add("active");
}

var stepLabel =
document.getElementById("stepLabel");

if (stepLabel) {
stepLabel.textContent =
"Step " +
state.currentStep +
" of 3";
}

var progressBar =
document.getElementById("progressBar");

if (progressBar) {
progressBar.style.width =
((state.currentStep / 3) * 100) + "%";
}
}

function collectChildDetails() {
var name =
document.getElementById("childName");

var age =
document.getElementById("childAge");

var personality =
document.getElementById("personality");

var favorites =
document.getElementById("favorites");

state.child.name =
name ? name.value.trim() : "";

state.child.age =
age ? age.value : "";

state.child.personality =
personality ? personality.value.trim() : "";

state.child.favorites =
favorites ? favorites.value.trim() : "";

if (!state.child.name) {
showMessage("Please enter the child's name.");

```
if (name) {
  name.focus();
}

return false;
```

}

if (!state.child.age) {
showMessage("Please choose the child's age.");

```
if (age) {
  age.focus();
}

return false;
```

}

return true;
}

function collectStoryPreferences() {
var setting =
document.getElementById("setting");

var lesson =
document.getElementById("lesson");

var length =
document.getElementById("storyLength");

var tone =
document.getElementById("storyTone");

state.story.setting =
setting ? setting.value.trim() : "";

state.story.lesson =
lesson ? lesson.value.trim() : "";

if (length) {
state.story.length = length.value;
}

if (tone) {
state.story.tone = tone.value;
}
}

function setupStorySettings() {
var length =
document.getElementById("storyLength");

var tone =
document.getElementById("storyTone");

if (length) {
length.addEventListener("change", function () {
state.story.length = length.value;
});
}

if (tone) {
tone.addEventListener("change", function () {
state.story.tone = tone.value;
});
}
}

function setupPhotoUpload() {
var input =
document.getElementById("photoInput");

var dropZone =
document.getElementById("dropZone");

var addMemoryButton =
document.getElementById("addMemoryBtn");

if (input) {
input.addEventListener("change", function (event) {
if (
event.target.files &&
event.target.files.length
) {
addPhotos(event.target.files);
}

```
  input.value = "";
});
```

}

if (dropZone) {
dropZone.addEventListener("dragover", function (event) {
event.preventDefault();
dropZone.classList.add("dragging");
});

```
dropZone.addEventListener("dragleave", function () {
  dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", function (event) {
  event.preventDefault();
  dropZone.classList.remove("dragging");

  if (
    event.dataTransfer.files &&
    event.dataTransfer.files.length
  ) {
    addPhotos(event.dataTransfer.files);
  }
});
```

}

if (addMemoryButton) {
addMemoryButton.addEventListener("click", function () {
if (input) {
input.click();
}
});
}
}

function addPhotos(fileList) {
var files = Array.from(fileList);

files.forEach(function (file) {
if (
!file.type ||
file.type.indexOf("image/") !== 0
) {
return;
}

```
state.photos.push({
  id:
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 9),

  file: file,
  name: file.name,
  url: URL.createObjectURL(file),
  memory: "",
  dataUrl: null
});
```

});

renderPhotos();
}

function compressImage(file) {
return new Promise(function (resolve, reject) {
var reader = new FileReader();

```
reader.onload = function (event) {
  var image = new Image();

  image.onload = function () {
    var maxSize = 1600;

    var width = image.width;
    var height = image.height;

    if (
      width > maxSize ||
      height > maxSize
    ) {
      if (width > height) {
        height =
          Math.round(
            height *
            maxSize /
            width
          );

        width = maxSize;
      } else {
        width =
          Math.round(
            width *
            maxSize /
            height
          );

        height = maxSize;
      }
    }

    var canvas =
      document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    var context =
      canvas.getContext("2d");

    context.drawImage(
      image,
      0,
      0,
      width,
      height
    );

    resolve(
      canvas.toDataURL(
        "image/jpeg",
        0.78
      )
    );
  };

  image.onerror = reject;
  image.src = event.target.result;
};

reader.onerror = reject;

reader.readAsDataURL(file);
```

});
}

function renderPhotos() {
var list =
document.getElementById("photoList");

var count =
document.getElementById("photoCount");

if (!list) {
return;
}

list.innerHTML = "";

if (count) {
count.textContent =
state.photos.length +
(
state.photos.length === 1
? " photo"
: " photos"
);
}

state.photos.forEach(function (photo, index) {
var item =
document.createElement("div");

```
item.className = "photo-item";

item.innerHTML =
  '<div class="photo-preview">' +
    '<img src="' +
    escapeHtml(photo.url) +
    '" alt="Memory photo ' +
    (index + 1) +
    '">' +
  '</div>' +

  '<div class="photo-details">' +

    '<div class="photo-number">' +
      "Memory " +
      (index + 1) +
    '</div>' +

    '<textarea class="memory-input" ' +
      'placeholder="Tell us what happened in this photo...">' +
      escapeHtml(photo.memory) +
    '</textarea>' +

    '<div class="photo-controls">' +

      '<button type="button" ' +
        'class="photo-control move-up" ' +
        'data-index="' +
        index +
        '"' +
        (
          index === 0
            ? " disabled"
            : ""
        ) +
      '>↑</button>' +

      '<button type="button" ' +
        'class="photo-control move-down" ' +
        'data-index="' +
        index +
        '"' +
        (
          index === state.photos.length - 1
            ? " disabled"
            : ""
        ) +
      '>↓</button>' +

      '<button type="button" ' +
        'class="photo-control delete-photo" ' +
        'data-index="' +
        index +
      '">Remove</button>' +

    '</div>' +

  '</div>';

list.appendChild(item);
```

});

setupPhotoButtons();
}

function setupPhotoButtons() {
var memoryInputs =
document.querySelectorAll(".memory-input");

memoryInputs.forEach(function (input, index) {
input.addEventListener("input", function () {
if (state.photos[index]) {
state.photos[index].memory =
input.value;
}
});
});

var upButtons =
document.querySelectorAll(".move-up");

upButtons.forEach(function (button) {
button.addEventListener("click", function () {
var index =
parseInt(
button.getAttribute("data-index"),
10
);

```
  if (index <= 0) {
    return;
  }

  var temp =
    state.photos[index - 1];

  state.photos[index - 1] =
    state.photos[index];

  state.photos[index] =
    temp;

  renderPhotos();
});
```

});

var downButtons =
document.querySelectorAll(".move-down");

downButtons.forEach(function (button) {
button.addEventListener("click", function () {
var index =
parseInt(
button.getAttribute("data-index"),
10
);

```
  if (
    index >=
    state.photos.length - 1
  ) {
    return;
  }

  var temp =
    state.photos[index + 1];

  state.photos[index + 1] =
    state.photos[index];

  state.photos[index] =
    temp;

  renderPhotos();
});
```

});

var deleteButtons =
document.querySelectorAll(".delete-photo");

deleteButtons.forEach(function (button) {
button.addEventListener("click", function () {
var index =
parseInt(
button.getAttribute("data-index"),
10
);

```
  if (state.photos[index]) {
    URL.revokeObjectURL(
      state.photos[index].url
    );
  }

  state.photos.splice(index, 1);

  renderPhotos();
});
```

});
}

function setupStoryActions() {
var createButton =
document.getElementById("createStoryBtn");

var editButton =
document.getElementById("editStoryBtn");

var startOverButton =
document.getElementById("startOverBtn");

var printButton =
document.getElementById("printStoryBtn");

if (createButton) {
createButton.addEventListener("click", function () {
generateAIStory();
});
}

if (editButton) {
editButton.addEventListener("click", function () {
goToStep(1);
});
}

if (startOverButton) {
startOverButton.addEventListener("click", function () {
startOver();
});
}

if (printButton) {
printButton.addEventListener("click", function () {
window.print();
});
}
}

async function generateAIStory() {
var createButton =
document.getElementById("createStoryBtn");

if (!state.photos.length) {
showMessage(
"Please add at least one photo before creating the story."
);

```
return;
```

}

collectChildDetails();
collectStoryPreferences();

if (createButton) {
createButton.disabled = true;

```
createButton.innerHTML =
  "Creating their story... <span>✨</span>";
```

}

try {
var memories = [];

```
for (
  var i = 0;
  i < state.photos.length;
  i++
) {
  var photo =
    state.photos[i];

  if (!photo.dataUrl) {
    photo.dataUrl =
      await compressImage(
        photo.file
      );
  }

  memories.push({
    index: i,
    filename: photo.name,
    memory: photo.memory || "",
    image: photo.dataUrl
  });
}

var response =
  await fetch(
    "/api/generate-story",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body:
        JSON.stringify({
          child: state.child,
          story: state.story,
          memories: memories
        })
    }
  );

var result =
  await response.json();

if (!response.ok) {
  throw new Error(
    result.error ||
    "The story could not be created."
  );
}

if (!result.story) {
  throw new Error(
    "The server returned an invalid response."
  );
}

state.generatedStory =
  result.story;

renderGeneratedStory();
goToStep(3);
```

} catch (error) {
console.error(
"AI STORY ERROR:",
error
);

```
showMessage(
  error.message ||
  "We couldn't create the story yet."
);
```

} finally {
if (createButton) {
createButton.disabled = false;

```
  createButton.innerHTML =
    'Create their story <span>✨</span>';
}
```

}
}

function renderGeneratedStory() {
var story =
state.generatedStory;

if (!story) {
return;
}

var title =
document.getElementById("storyTitle");

var subtitle =
document.getElementById("storySubtitle");

var coverName =
document.getElementById("coverChildName");

var coverType =
document.getElementById("coverStoryType");

var ending =
document.getElementById("endingText");

var pages =
document.getElementById("generatedPages");

var coverPhotoWrap =
document.getElementById("coverPhotoWrap");

if (title) {
title.textContent =
story.title ||
"Once Upon a Time...";
}

if (subtitle) {
subtitle.textContent =
story.subtitle || "";
}

if (coverName) {
coverName.textContent =
state.child.name ||
"Your Child";
}

if (coverType) {
coverType.textContent =
state.story.type;
}

if (ending) {
ending.textContent =
story.ending || "";
}

if (
coverPhotoWrap &&
state.photos.length
) {
coverPhotoWrap.innerHTML =
'<img src="' +
   escapeHtml(
     state.photos[0].url
   ) +
   '" alt="Story cover photo">';
}

if (!pages) {
return;
}

pages.innerHTML = "";

var storyPages =
Array.isArray(story.pages)
? story.pages
: [];

storyPages.forEach(
function (page, index) {

```
  var photoIndex =
    Number.isInteger(
      page.photoIndex
    )
      ? page.photoIndex
      : index %
        state.photos.length;

  var photo =
    state.photos[
      photoIndex
    ];

  var article =
    document.createElement(
      "article"
    );

  article.className =
    "story-page";

  var imageHtml =
    "";

  if (photo) {
    imageHtml =
      '<div class="story-photo-wrap">' +
        '<img src="' +
        escapeHtml(
          photo.url
        ) +
        '" alt="Story memory">' +
      '</div>';
  }

  article.innerHTML =
    imageHtml +

    '<div class="story-page-content">' +

      '<div class="story-page-number">' +
        "Chapter " +
        (index + 1) +
      '</div>' +

      '<h2>' +
        escapeHtml(
          page.heading || ""
        ) +
      '</h2>' +

      '<p>' +
        escapeHtml(
          page.text || ""
        ) +
      '</p>' +

    '</div>';

  pages.appendChild(
    article
  );
}
```

);
}

function startOver() {
state.currentStep = 1;

state.child = {
name: "",
age: "",
personality: "",
favorites: ""
};

state.story = {
type: "Magical Adventure",
setting: "",
lesson: "",
length: "medium",
tone: "warm"
};

state.photos.forEach(
function (photo) {
try {
URL.revokeObjectURL(
photo.url
);
} catch (error) {
}
}
);

state.photos = [];
state.generatedStory = null;

var fields = [
"childName",
"childAge",
"personality",
"favorites",
"setting",
"lesson"
];

fields.forEach(
function (id) {
var element =
document.getElementById(id);

```
  if (element) {
    element.value = "";
  }
}
```

);

var length =
document.getElementById(
"storyLength"
);

if (length) {
length.value = "medium";
}

var tone =
document.getElementById(
"storyTone"
);

if (tone) {
tone.value = "warm";
}

var cards =
document.querySelectorAll(
"#storyTypeChoices .choice-card"
);

cards.forEach(
function (card) {
card.classList.remove(
"selected"
);

```
  card.setAttribute(
    "aria-selected",
    "false"
  );
}
```

);

if (cards.length) {
cards[0].classList.add(
"selected"
);

```
cards[0].setAttribute(
  "aria-selected",
  "true"
);
```

}

renderPhotos();
updateStep();
}

function showMessage(message) {
var existing =
document.querySelector(
".app-message"
);

if (existing) {
existing.remove();
}

var box =
document.createElement(
"div"
);

box.className =
"app-message";

box.textContent =
message;

box.style.position =
"fixed";

box.style.left =
"50%";

box.style.bottom =
"24px";

box.style.transform =
"translateX(-50%)";

box.style.zIndex =
"9999";

box.style.padding =
"14px 20px";

box.style.borderRadius =
"12px";

box.style.background =
"#222";

box.style.color =
"#fff";

box.style.fontSize =
"14px";

box.style.maxWidth =
"90%";

box.style.boxShadow =
"0 10px 30px rgba(0,0,0,0.2)";

document.body.appendChild(
box
);

clearTimeout(
showMessage.timeout
);

showMessage.timeout =
setTimeout(
function () {
if (box) {
box.remove();
}
},
4000
);
}

function escapeHtml(value) {
var text =
value == null
? ""
: String(value);

return text
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}
