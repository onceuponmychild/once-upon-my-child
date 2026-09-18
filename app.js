var state = {
currentStep: 1,
story: {
type: "Magical Adventure"
},
child: {
name: "",
age: "",
personality: "",
favorites: ""
},
memories: "",
photos: [],
generatedStory: null
};

console.log("ONCE UPON MY CHILD - PRODUCTION APP");

function getElement(id) {
return document.getElementById(id);
}

function getValue(ids) {
for (var i = 0; i < ids.length; i++) {
var element = getElement(ids[i]);

```
if (element && typeof element.value === "string") {
  return element.value.trim();
}
```

}

return "";
}

function setStep(step) {
state.currentStep = step;

var steps = document.querySelectorAll("[data-step]");

steps.forEach(function(section) {
var sectionStep = parseInt(
section.getAttribute("data-step"),
10
);

```
section.hidden = sectionStep !== step;
```

});

var progress = getElement("progress");

if (progress) {
progress.style.width =
(((step - 1) / 2) * 100) + "%";
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

cards.forEach(function(card) {
card.addEventListener("click", function() {

```
  cards.forEach(function(item) {
    item.classList.remove("selected");
    item.setAttribute("aria-selected", "false");
  });

  card.classList.add("selected");
  card.setAttribute("aria-selected", "true");

  var selectedType =
    card.getAttribute("data-value");

  if (selectedType) {
    state.story.type = selectedType;
  }

  console.log(
    "Adventure selected:",
    state.story.type
  );
});
```

});

console.log("Adventure cards ready");
}

function collectChildInformation() {

state.child.name = getValue([
"childName",
"name"
]);

state.child.age = getValue([
"childAge",
"age"
]);

state.child.personality = getValue([
"childPersonality",
"personality"
]);

state.child.favorites = getValue([
"childFavorites",
"favorites"
]);

state.memories = getValue([
"memories",
"familyMemories",
"memoryText",
"storyMemories"
]);
}

function setupPhotoUpload() {

var input =
getElement("photoUpload") ||
getElement("photos") ||
getElement("imageUpload");

if (!input) {
console.log("Photo upload input not found");
return;
}

input.addEventListener("change", function(event) {

```
var files =
  Array.from(event.target.files || []);

files.forEach(function(file) {

  if (
    !file.type ||
    !file.type.startsWith("image/")
  ) {
    return;
  }

  state.photos.push(file);
});

renderPhotoPreview();

console.log(
  "Photos selected:",
  state.photos.length
);
```

});
}

function renderPhotoPreview() {

var preview =
getElement("photoPreview") ||
getElement("photoPreviews") ||
getElement("uploadedPhotos");

if (!preview) {
return;
}

preview.innerHTML = "";

state.photos.forEach(function(file, index) {

```
var wrapper =
  document.createElement("div");

wrapper.className =
  "photo-preview-item";

var image =
  document.createElement("img");

image.alt =
  "Story photo " + (index + 1);

image.src =
  URL.createObjectURL(file);

var remove =
  document.createElement("button");

remove.type = "button";
remove.textContent = "Remove";

remove.setAttribute(
  "data-photo-index",
  String(index)
);

remove.addEventListener(
  "click",
  function() {

    state.photos.splice(index, 1);

    renderPhotoPreview();
  }
);

wrapper.appendChild(image);
wrapper.appendChild(remove);

preview.appendChild(wrapper);
```

});
}

function setupNavigation() {

document.addEventListener(
"click",
function(event) {

```
  var button =
    event.target.closest(
      "[data-next], [data-prev], [data-step-target]"
    );

  if (!button) {
    return;
  }

  if (
    button.hasAttribute(
      "data-step-target"
    )
  ) {

    var target =
      parseInt(
        button.getAttribute(
          "data-step-target"
        ),
        10
      );

    if (!isNaN(target)) {
      collectChildInformation();
      setStep(target);
    }

    return;
  }

  if (
    button.hasAttribute("data-next")
  ) {

    collectChildInformation();

    setStep(
      state.currentStep + 1
    );

    return;
  }

  if (
    button.hasAttribute("data-prev")
  ) {

    setStep(
      Math.max(
        1,
        state.currentStep - 1
      )
    );
  }
}
```

);
}

function createStoryPayload() {

collectChildInformation();

return {
child: state.child,

```
story: {
  type: state.story.type
},

memories: state.memories
```

};
}

async function generateStory() {

var button =
getElement("generateStoryButton") ||
getElement("generateStory") ||
document.querySelector(
"[data-generate-story]"
);

if (button) {

```
button.disabled = true;

button.setAttribute(
  "aria-busy",
  "true"
);
```

}

try {

```
var response =
  await fetch(
    "/api/story",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify(
        createStoryPayload()
      )
    }
  );

var data =
  await response.json();

if (!response.ok) {

  throw new Error(
    data.error ||
    "Unable to generate the story."
  );
}

state.generatedStory = data;

displayGeneratedStory(data);

setStep(
  state.currentStep + 1
);
```

} catch (error) {

```
console.error(
  "Story generation failed:",
  error
);

showMessage(
  error.message ||
  "Something went wrong while creating the story."
);
```

} finally {

```
if (button) {

  button.disabled = false;

  button.removeAttribute(
    "aria-busy"
  );
}
```

}
}

function displayGeneratedStory(data) {

var output =
getElement("storyOutput") ||
getElement("generatedStory") ||
getElement("storyResult");

if (!output) {
return;
}

var storyText = "";

if (typeof data === "string") {

```
storyText = data;
```

} else if (data.story) {

```
storyText =
  typeof data.story === "string"
    ? data.story
    : JSON.stringify(
        data.story,
        null,
        2
      );
```

} else if (data.content) {

```
storyText = data.content;
```

} else if (data.text) {

```
storyText = data.text;
```

} else {

```
storyText =
  JSON.stringify(
    data,
    null,
    2
  );
```

}

output.textContent = storyText;
}

function showMessage(message) {

var messageBox =
getElement("message") ||
getElement("errorMessage") ||
getElement("statusMessage");

if (messageBox) {

```
messageBox.textContent =
  message;

messageBox.hidden = false;
```

} else {

```
alert(message);
```

}
}

function setupGenerateButton() {

var button =
getElement("generateStoryButton") ||
getElement("generateStory") ||
document.querySelector(
"[data-generate-story]"
);

if (!button) {

```
console.log(
  "Generate story button not found"
);

return;
```

}

button.addEventListener(
"click",
function() {
generateStory();
}
);
}

function setupFormState() {

var fields =
document.querySelectorAll(
"input, textarea, select"
);

fields.forEach(function(field) {

```
field.addEventListener(
  "input",
  collectChildInformation
);

field.addEventListener(
  "change",
  collectChildInformation
);
```

});
}

function initializeApp() {

setupAdventureCards();

setupPhotoUpload();

setupNavigation();

setupGenerateButton();

setupFormState();

var initialStep =
document.querySelector(
"[data-step='1']"
);

if (initialStep) {
setStep(1);
}

console.log(
"Once Upon My Child app initialized"
);
}

document.addEventListener(
"DOMContentLoaded",
function() {
initializeApp();
}
);
