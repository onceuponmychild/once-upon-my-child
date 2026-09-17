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

var screens = document.querySelectorAll(".screen");
var progressBar = document.getElementById("progressBar");
var stepLabel = document.getElementById("stepLabel");

function goToStep(step) {
state.currentStep = step;

screens.forEach(function (screen) {
screen.classList.remove("active");
});

var target = document.getElementById("step" + step);

if (target) {
target.classList.add("active");
}

if (stepLabel) {
stepLabel.textContent = "Step " + step + " of 3";
}

if (progressBar) {
progressBar.style.width = ((step - 1) / 2) * 100 + "%";
}

window.scrollTo({
top: 0,
behavior: "smooth"
});
}

function setupAdventureCards() {
var container = document.getElementById("storyTypeChoices");

if (!container) {
return;
}

var cards = container.querySelectorAll(".choice-card");

cards.forEach(function (card) {
card.addEventListener("click", function () {

```
  cards.forEach(function (item) {
    item.classList.remove("selected");
    item.setAttribute("aria-selected", "false");
  });

  card.classList.add("selected");
  card.setAttribute("aria-selected", "true");

  state.story.type =
    card.getAttribute("data-value") ||
    "Magical Adventure";

  console.log(
    "Adventure selected:",
    state.story.type
  );
});
```

});
}

function collectChildDetails() {
var nameInput = document.getElementById("childName");
var ageInput = document.getElementById("childAge");
var personalityInput = document.getElementById("personality");
var favoritesInput = document.getElementById("favorites");

var name = nameInput ? nameInput.value.trim() : "";
var age = ageInput ? ageInput.value : "";

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

state.child.personality =
personalityInput
? personalityInput.value.trim()
: "";

state.child.favorites =
favoritesInput
? favoritesInput.value.trim()
: "";

return true;
}

function collectStoryPreferences() {
var settingInput =
document.getElementById("setting");

var lessonInput =
document.getElementById("lesson");

var lengthInput =
document.getElementById("storyLength");

var toneInput =
document.getElementById("storyTone");

state.story.setting =
settingInput
? settingInput.value.trim()
: "";

state.story.lesson =
lessonInput
? lessonInput.value.trim()
: "";

state.story.length =
lengthInput
? lengthInput.value
: "medium";

state.story.tone =
toneInput
? toneInput.value
: "warm";

return true;
}

function setupNavigation() {
var continueButton =
document.getElementById("continueToPhotos");

var backButton =
document.getElementById("backToDetails");

if (continueButton) {
continueButton.addEventListener(
"click",
function () {

```
    if (!collectChildDetails()) {
      return;
    }

    if (!collectStoryPreferences()) {
      return;
    }

    goToStep(2);
  }
);
```

}

if (backButton) {
backButton.addEventListener(
"click",
function () {
goToStep(1);
}
);
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
input.addEventListener(
"change",
function (event) {

```
    addPhotos(event.target.files);

    input.value = "";
  }
);
```

}

if (dropZone) {

```
dropZone.addEventListener(
  "dragover",
  function (event) {

    event.preventDefault();

    dropZone.classList.add("dragging");
  }
);

dropZone.addEventListener(
  "dragleave",
  function () {

    dropZone.classList.remove("dragging");
  }
);

dropZone.addEventListener(
  "drop",
  function (event) {

    event.preventDefault();

    dropZone.classList.remove("dragging");

    if (event.dataTransfer.files) {
      addPhotos(event.dataTransfer.files);
    }
  }
);
```

}

if (addMemoryButton) {

```
addMemoryButton.addEventListener(
  "click",
  function () {

    if (input) {
      input.click();
    }
  }
);
```

}
}

function addPhotos(fileList) {

var files =
Array.from(fileList || []);

files.forEach(function (file) {

```
if (!file.type.startsWith("image/")) {
  return;
}

var photo = {
  id: Date.now() + Math.random(),
  file: file,
  url: URL.createObjectURL(file),
  memory: ""
};

state.photos.push(photo);
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
count.textContent =
  state.photos.length +
  (
    state.photos.length === 1
      ? " photo"
      : " photos"
  );
```

}

state.photos.forEach(
function (photo, index) {

```
  var wrapper =
    document.createElement("div");

  wrapper.className =
    "photo-item";

  var image =
    document.createElement("img");

  image.src = photo.url;

  image.alt =
    "Memory photo " +
    (index + 1);

  var content =
    document.createElement("div");

  content.className =
    "photo-item-content";

  var title =
    document.createElement("strong");

  title.textContent =
    "Memory " +
    (index + 1);

  var textarea =
    document.createElement("textarea");

  textarea.placeholder =
    "Tell us what happened in this photo...";

  textarea.value =
    photo.memory;

  textarea.addEventListener(
    "input",
    function () {

      photo.memory =
        textarea.value;
    }
  );

  var removeButton =
    document.createElement("button");

  removeButton.type =
    "button";

  removeButton.className =
    "secondary-btn";

  removeButton.textContent =
    "Remove";

  removeButton.addEventListener(
    "click",
    function () {

      if (photo.url) {
        URL.revokeObjectURL(
          photo.url
        );
      }

      state.photos.splice(
        index,
        1
      );

      renderPhotos();
    }
  );

  content.appendChild(title);
  content.appendChild(textarea);
  content.appendChild(removeButton);

  wrapper.appendChild(image);
  wrapper.appendChild(content);

  list.appendChild(wrapper);
}
```

);
}

function setupCreateStory() {

var button =
document.getElementById(
"createStoryBtn"
);

if (!button) {
return;
}

button.addEventListener(
"click",
function () {

```
  if (state.photos.length === 0) {

    alert(
      "Please add at least one photo."
    );

    return;
  }

  collectStoryPreferences();

  generateStory();
}
```

);
}

function setupEditStory() {

var button =
document.getElementById(
"editStoryBtn"
);

if (button) {

```
button.addEventListener(
  "click",
  function () {

    goToStep(2);
  }
);
```

}
}

function setupStartOver() {

var button =
document.getElementById(
"startOverBtn"
);

if (!button) {
return;
}

button.addEventListener(
"click",
function () {

```
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

      if (photo.url) {
        URL.revokeObjectURL(
          photo.url
        );
      }
    }
  );

  state.photos = [];

  state.generatedStory = null;

  var inputs =
    document.querySelectorAll(
      "input, textarea, select"
    );

  inputs.forEach(
    function (input) {

      if (
        input.id === "storyLength"
      ) {

        input.value = "medium";

      } else if (
        input.id === "storyTone"
      ) {

        input.value = "warm";

      } else {

        input.value = "";
      }
    }
  );

  renderPhotos();

  goToStep(1);
}
```

);
}

function setupPrint() {

var button =
document.getElementById(
"printStoryBtn"
);

if (button) {

```
button.addEventListener(
  "click",
  function () {

    window.print();
  }
);
```

}
}

async function generateStory() {

var button =
document.getElementById(
"createStoryBtn"
);

if (button) {

```
button.disabled = true;

button.textContent =
  "Creating story...";
```

}

try {

```
var memories =
  state.photos.map(
    function (photo) {

      return {
        id: photo.id,
        memory: photo.memory || "",
        filename:
          photo.file
            ? photo.file.name
            : "",
        image: photo.url
      };
    }
  );

var response =
  await fetch(
    "/api/generate-story",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({
        child: state.child,
        story: state.story,
        memories: memories
      })
    }
  );

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

renderStory(data.story);

goToStep(3);
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
document.getElementById(
"storyTitle"
);

var subtitle =
document.getElementById(
"storySubtitle"
);

var childName =
document.getElementById(
"coverChildName"
);

var storyType =
document.getElementById(
"coverStoryType"
);

var ending =
document.getElementById(
"endingText"
);

var pages =
document.getElementById(
"generatedPages"
);

if (title) {

```
title.textContent =
  story.title ||
  "Once Upon a Time...";
```

}

if (subtitle) {

```
subtitle.textContent =
  story.subtitle || "";
```

}

if (childName) {

```
childName.textContent =
  state.child.name ||
  "Your Child";
```

}

if (storyType) {

```
storyType.textContent =
  state.story.type ||
  "A Magical Adventure";
```

}

if (ending) {

```
ending.textContent =
  story.ending || "";
```

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

storyPages.forEach(
function (page, index) {

```
  var article =
    document.createElement(
      "article"
    );

  article.className =
    "story-page";

  var imageWrap =
    document.createElement(
      "div"
    );

  imageWrap.className =
    "story-page-photo";

  var photoIndex =
    typeof page.photoIndex === "number"
      ? page.photoIndex
      : index;

  var photo =
    state.photos[photoIndex];

  if (photo) {

    var image =
      document.createElement(
        "img"
      );

    image.src =
      photo.url;

    image.alt =
      "Story memory " +
      (photoIndex + 1);

    imageWrap.appendChild(
      image
    );

  } else {

    imageWrap.textContent =
      "✦";
  }

  var content =
    document.createElement(
      "div"
    );

  content.className =
    "story-page-content";

  var heading =
    document.createElement(
      "h2"
    );

  heading.textContent =
    page.heading || "";

  var text =
    document.createElement(
      "p"
    );

  text.textContent =
    page.text || "";

  content.appendChild(
    heading
  );

  content.appendChild(
    text
  );

  article.appendChild(
    imageWrap
  );

  article.appendChild(
    content
  );

  pages.appendChild(
    article
  );
}
```

);
}

function renderCoverPhoto() {

var wrap =
document.getElementById(
"coverPhotoWrap"
);

if (!wrap) {
return;
}

wrap.innerHTML = "";

if (state.photos.length > 0) {

```
var image =
  document.createElement(
    "img"
  );

image.src =
  state.photos[0].url;

image.alt =
  state.child.name +
  " cover photo";

wrap.appendChild(
  image
);
```

} else {

```
wrap.textContent =
  "📖";
```

}
}

function initializeApp() {

setupAdventureCards();

setupNavigation();

setupPhotoUpload();

setupCreateStory();

setupEditStory();

setupStartOver();

setupPrint();

goToStep(1);

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
