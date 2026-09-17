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

function showStep(step) {
var screens = document.querySelectorAll(".screen");

screens.forEach(function (screen) {
screen.classList.remove("active");
});

var screen = document.getElementById("step" + step);

if (screen) {
screen.classList.add("active");
}

state.currentStep = step;

var label = document.getElementById("stepLabel");

if (label) {
label.textContent = "Step " + step + " of 3";
}

var progress = document.getElementById("progressBar");

if (progress) {
progress.style.width = ((step - 1) / 2) * 100 + "%";
}

window.scrollTo(0, 0);
}

function setupAdventureCards() {
var container = document.getElementById("storyTypeChoices");

if (!container) {
console.log("Adventure container not found");
return;
}

var cards = container.querySelectorAll(".choice-card");

cards.forEach(function (card) {

```
card.addEventListener("click", function () {

  cards.forEach(function (item) {
    item.classList.remove("selected");
    item.setAttribute("aria-selected", "false");
  });

  card.classList.add("selected");
  card.setAttribute("aria-selected", "true");

  var selectedType = card.getAttribute("data-value");

  if (selectedType) {
    state.story.type = selectedType;
  }

  console.log("Adventure selected:", state.story.type);
});
```

});

console.log("Adventure cards ready");
}

function collectChildDetails() {
var nameInput = document.getElementById("childName");
var ageInput = document.getElementById("childAge");
var personalityInput = document.getElementById("personality");
var favoritesInput = document.getElementById("favorites");

var name = "";
var age = "";

if (nameInput) {
name = nameInput.value.trim();
}

if (ageInput) {
age = ageInput.value;
}

if (!name) {
alert("Please enter your child's name.");
return false;
}

if (!age) {
alert("Please choose your child's age.");
return false;
}

state.child.name = name;
state.child.age = age;

if (personalityInput) {
state.child.personality = personalityInput.value.trim();
}

if (favoritesInput) {
state.child.favorites = favoritesInput.value.trim();
}

return true;
}

function collectStoryPreferences() {
var settingInput = document.getElementById("setting");
var lessonInput = document.getElementById("lesson");
var lengthInput = document.getElementById("storyLength");
var toneInput = document.getElementById("storyTone");

if (settingInput) {
state.story.setting = settingInput.value.trim();
}

if (lessonInput) {
state.story.lesson = lessonInput.value.trim();
}

if (lengthInput) {
state.story.length = lengthInput.value;
}

if (toneInput) {
state.story.tone = toneInput.value;
}

return true;
}

function setupNavigation() {
var continueButton =
document.getElementById("continueToPhotos");

var backButton =
document.getElementById("backToDetails");

if (continueButton) {

```
continueButton.addEventListener("click", function () {

  if (!collectChildDetails()) {
    return;
  }

  collectStoryPreferences();

  showStep(2);
});
```

}

if (backButton) {

```
backButton.addEventListener("click", function () {
  showStep(1);
});
```

}

console.log("Navigation ready");
}

function setupPhotoUpload() {
var input =
document.getElementById("photoInput");

var dropZone =
document.getElementById("dropZone");

var addButton =
document.getElementById("addMemoryBtn");

if (input) {

```
input.addEventListener("change", function (event) {

  addPhotos(event.target.files);

  input.value = "";
});
```

}

if (dropZone) {

```
dropZone.addEventListener("dragover", function (event) {

  event.preventDefault();

  dropZone.classList.add("dragging");
});


dropZone.addEventListener("dragleave", function () {

  dropZone.classList.remove("dragging");
});


dropZone.addEventListener("drop", function (event) {

  event.preventDefault();

  dropZone.classList.remove("dragging");

  addPhotos(event.dataTransfer.files);
});
```

}

if (addButton) {

```
addButton.addEventListener("click", function () {

  if (input) {
    input.click();
  }
});
```

}

console.log("Photo upload ready");
}

function addPhotos(files) {
if (!files) {
return;
}

Array.from(files).forEach(function (file) {

```
if (!file.type || !file.type.startsWith("image/")) {
  return;
}

state.photos.push({
  id: Date.now() + Math.random(),
  file: file,
  url: URL.createObjectURL(file),
  memory: ""
});
```

});

renderPhotos();
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

```
if (state.photos.length === 1) {
  count.textContent = "1 photo";
} else {
  count.textContent =
    state.photos.length + " photos";
}
```

}

state.photos.forEach(function (photo, index) {

```
var item =
  document.createElement("div");

item.className = "photo-item";


var image =
  document.createElement("img");

image.src = photo.url;

image.alt =
  "Memory photo " + (index + 1);


var content =
  document.createElement("div");

content.className =
  "photo-item-content";


var title =
  document.createElement("strong");

title.textContent =
  "Memory " + (index + 1);


var textarea =
  document.createElement("textarea");

textarea.placeholder =
  "Tell us what happened in this photo...";

textarea.value =
  photo.memory;


textarea.addEventListener("input", function () {
  photo.memory = textarea.value;
});


var removeButton =
  document.createElement("button");

removeButton.type = "button";

removeButton.className =
  "secondary-btn";

removeButton.textContent =
  "Remove";


removeButton.addEventListener("click", function () {

  if (photo.url) {
    URL.revokeObjectURL(photo.url);
  }

  state.photos.splice(index, 1);

  renderPhotos();
});


content.appendChild(title);
content.appendChild(textarea);
content.appendChild(removeButton);

item.appendChild(image);
item.appendChild(content);

list.appendChild(item);
```

});

}

function setupCreateStory() {
var button =
document.getElementById("createStoryBtn");

if (!button) {
return;
}

button.addEventListener("click", function () {

```
if (state.photos.length === 0) {

  alert(
    "Please add at least one photo before creating the story."
  );

  return;
}

collectStoryPreferences();

generateStory();
```

});

console.log("Create Story button ready");
}

async function generateStory() {
var button =
document.getElementById("createStoryBtn");

if (button) {
button.disabled = true;
button.textContent = "Creating story...";
}

try {

```
var memories = state.photos.map(function (photo) {

  return {
    id: photo.id,
    memory: photo.memory || "",
    filename:
      photo.file ? photo.file.name : "",
    image: photo.url
  };

});


var response =
  await fetch("/api/generate-story", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      child: state.child,
      story: state.story,
      memories: memories
    })

  });


var data =
  await response.json();


if (!response.ok) {

  throw new Error(
    data.error ||
    "The story could not be created."
  );
}


if (!data.story) {

  throw new Error(
    "The server returned an invalid response."
  );
}


state.generatedStory =
  data.story;


renderStory(
  data.story
);


showStep(3);
```

} catch (error) {

```
console.error(
  "AI STORY ERROR:",
  error
);

alert(
  "We couldn't create the story yet.\n\n" +
  error.message
);
```

} finally {

```
if (button) {

  button.disabled = false;

  button.innerHTML =
    'Create their story <span>✨</span>';
}
```

}
}

function renderStory(story) {
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
state.story.type ||
"A Magical Adventure";
}

if (ending) {
ending.textContent =
story.ending || "";
}

renderCoverPhoto();

if (!pages) {
return;
}

pages.innerHTML = "";

var storyPages =
Array.isArray(story.pages)
? story.pages
: [];

storyPages.forEach(function (page, index) {

```
var article =
  document.createElement("article");

article.className =
  "story-page";


var photoArea =
  document.createElement("div");

photoArea.className =
  "story-page-photo";


var photoIndex =
  typeof page.photoIndex === "number"
    ? page.photoIndex
    : index;


var photo =
  state.photos[photoIndex];


if (photo) {

  var image =
    document.createElement("img");

  image.src =
    photo.url;

  image.alt =
    "Story memory " +
    (photoIndex + 1);

  photoArea.appendChild(image);

} else {

  photoArea.textContent = "✦";
}


var content =
  document.createElement("div");

content.className =
  "story-page-content";


var heading =
  document.createElement("h2");

heading.textContent =
  page.heading || "";


var text =
  document.createElement("p");

text.textContent =
  page.text || "";


content.appendChild(heading);
content.appendChild(text);

article.appendChild(photoArea);
article.appendChild(content);

pages.appendChild(article);
```

});
}

function renderCoverPhoto() {
var wrap =
document.getElementById("coverPhotoWrap");

if (!wrap) {
return;
}

wrap.innerHTML = "";

if (state.photos.length > 0) {

```
var image =
  document.createElement("img");

image.src =
  state.photos[0].url;

image.alt =
  state.child.name +
  " cover photo";

wrap.appendChild(image);
```

} else {

```
wrap.textContent = "📖";
```

}
}

function setupEditStory() {
var button =
document.getElementById("editStoryBtn");

if (!button) {
return;
}

button.addEventListener("click", function () {
showStep(2);
});
}

function setupStartOver() {
var button =
document.getElementById("startOverBtn");

if (!button) {
return;
}

button.addEventListener("click", function () {

```
state.photos.forEach(function (photo) {

  if (photo.url) {
    URL.revokeObjectURL(photo.url);
  }

});


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


state.photos = [];

state.generatedStory = null;


var fields =
  document.querySelectorAll(
    "input, textarea, select"
  );


fields.forEach(function (field) {

  if (field.id === "storyLength") {
    field.value = "medium";
  } else if (field.id === "storyTone") {
    field.value = "warm";
  } else {
    field.value = "";
  }

});


var cards =
  document.querySelectorAll(
    "#storyTypeChoices .choice-card"
  );


cards.forEach(function (card) {

  card.classList.remove("selected");

  card.setAttribute(
    "aria-selected",
    "false"
  );

});


if (cards.length > 0) {

  cards[0].classList.add("selected");

  cards[0].setAttribute(
    "aria-selected",
    "true"
  );
}


renderPhotos();

showStep(1);
```

});
}

function setupPrintButton() {
var button =
document.getElementById("printStoryBtn");

if (!button) {
return;
}

button.addEventListener("click", function () {
window.print();
});
}

function initializeApp() {

setupAdventureCards();

setupNavigation();

setupPhotoUpload();

setupCreateStory();

setupEditStory();

setupStartOver();

setupPrintButton();

showStep(1);

console.log(
"Once Upon My Child loaded successfully."
);
}

if (
document.readyState === "loading"
) {

document.addEventListener(
"DOMContentLoaded",
initializeApp
);

} else {

initializeApp();
}
