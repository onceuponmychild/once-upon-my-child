const state = {
currentStep: 1,
child: {
name: "",
age: "",
personality: "",
favorites: ""
},
story: {
type: "",
setting: "",
lesson: "",
length: "Medium",
tone: "Warm and magical"
},
photos: [],
generatedStory: null
};

// --------------------------------------------------
// INITIALIZE
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
initializeApp();
});

function initializeApp() {
setupChoiceCards();
setupButtons();
setupPhotoUpload();
setupPhotoDropZone();
updateStepUI();
}

// --------------------------------------------------
// CHOICE CARDS
// --------------------------------------------------

function setupChoiceCards() {
const choiceGroups = document.querySelectorAll("[data-choice]");

choiceGroups.forEach((group) => {
const cards = group.querySelectorAll(".choice-card");

```
cards.forEach((card) => {
  card.addEventListener("click", () => {
    cards.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-selected", "false");
    });

    card.classList.add("selected");
    card.setAttribute("aria-selected", "true");

    const choiceType = group.dataset.choice;
    const value =
      card.dataset.value ||
      card.dataset.choiceValue ||
      card.getAttribute("data-option") ||
      card.textContent.trim();

    saveChoice(choiceType, value);
  });
});
```

});
}

function saveChoice(type, value) {
switch (type) {
case "story-type":
state.story.type = value;
break;

```
case "setting":
  state.story.setting = value;
  break;

case "lesson":
  state.story.lesson = value;
  break;

case "length":
  state.story.length = value;
  break;

case "tone":
  state.story.tone = value;
  break;
```

}
}

// --------------------------------------------------
// BUTTONS
// --------------------------------------------------

function setupButtons() {
document.querySelectorAll("[data-next]").forEach((button) => {
button.addEventListener("click", handleNext);
});

document.querySelectorAll("[data-back]").forEach((button) => {
button.addEventListener("click", handleBack);
});

const generateButton =
document.getElementById("generateStory") ||
document.getElementById("generateStoryBtn") ||
document.querySelector("[data-generate-story]");

if (generateButton) {
generateButton.addEventListener("click", generateAIStory);
}
}

// --------------------------------------------------
// NEXT
// --------------------------------------------------

function handleNext(event) {
event.preventDefault();

if (!validateCurrentStep()) {
return;
}

if (state.currentStep < getTotalSteps()) {
state.currentStep += 1;
updateStepUI();
}
}

// --------------------------------------------------
// BACK
// --------------------------------------------------

function handleBack(event) {
event.preventDefault();

if (state.currentStep > 1) {
state.currentStep -= 1;
updateStepUI();
}
}

// --------------------------------------------------
// STEP VALIDATION
// --------------------------------------------------

function validateCurrentStep() {
if (state.currentStep === 1) {
return collectChildDetails();
}

if (state.currentStep === 2) {
return validateStoryPreferences();
}

if (state.currentStep === 3) {
return validatePhotos();
}

return true;
}

function collectChildDetails() {
const nameInput =
document.getElementById("childName") ||
document.querySelector('[name="childName"]') ||
document.querySelector('[name="name"]');

const ageInput =
document.getElementById("childAge") ||
document.querySelector('[name="childAge"]') ||
document.querySelector('[name="age"]');

const personalityInput =
document.getElementById("childPersonality") ||
document.querySelector('[name="childPersonality"]') ||
document.querySelector('[name="personality"]');

const favoritesInput =
document.getElementById("childFavorites") ||
document.querySelector('[name="childFavorites"]') ||
document.querySelector('[name="favorites"]');

state.child.name = nameInput ? nameInput.value.trim() : "";
state.child.age = ageInput ? ageInput.value.trim() : "";
state.child.personality = personalityInput
? personalityInput.value.trim()
: "";
state.child.favorites = favoritesInput
? favoritesInput.value.trim()
: "";

if (!state.child.name) {
showMessage("Please enter your child's name.", "error");

```
if (nameInput) {
  nameInput.focus();
}

return false;
```

}

return true;
}

function validateStoryPreferences() {
const storyTypeSelected =
state.story.type ||
document.querySelector(
'[data-choice="story-type"] .choice-card.selected'
);

const settingSelected =
state.story.setting ||
document.querySelector(
'[data-choice="setting"] .choice-card.selected'
);

const lessonSelected =
state.story.lesson ||
document.querySelector(
'[data-choice="lesson"] .choice-card.selected'
);

if (!storyTypeSelected) {
showMessage("Please choose an adventure.", "error");
return false;
}

if (!settingSelected) {
showMessage("Please choose a setting.", "error");
return false;
}

if (!lessonSelected) {
showMessage("Please choose a lesson.", "error");
return false;
}

return true;
}

function validatePhotos() {
if (state.photos.length === 0) {
showMessage("Please add at least one photo.", "error");
return false;
}

return true;
}

// --------------------------------------------------
// STEP UI
// --------------------------------------------------

function getTotalSteps() {
const steps = document.querySelectorAll(".step");

return steps.length || 3;
}

function updateStepUI() {
const steps = document.querySelectorAll(".step");

steps.forEach((step, index) => {
const stepNumber = index + 1;

```
step.classList.toggle(
  "active",
  stepNumber === state.currentStep
);
```

});

const progress =
document.getElementById("progressBar") ||
document.querySelector(".progress-fill") ||
document.querySelector(".progress-bar-fill");

if (progress) {
const total = getTotalSteps();

```
const percentage =
  total <= 1
    ? 100
    : ((state.currentStep - 1) / (total - 1)) * 100;

progress.style.width = `${percentage}%`;
```

}

const stepLabel =
document.getElementById("stepLabel") ||
document.querySelector(".step-label");

if (stepLabel) {
stepLabel.textContent =
`Step ${state.currentStep} of ${getTotalSteps()}`;
}

const backButtons = document.querySelectorAll("[data-back]");

backButtons.forEach((button) => {
button.style.display =
state.currentStep === 1 ? "none" : "";
});

const nextButtons = document.querySelectorAll("[data-next]");

nextButtons.forEach((button) => {
button.style.display =
state.currentStep === getTotalSteps()
? "none"
: "";
});
}

// --------------------------------------------------
// PHOTO UPLOAD
// --------------------------------------------------

function setupPhotoUpload() {
const input =
document.getElementById("photoUpload") ||
document.getElementById("photoInput") ||
document.querySelector('input[type="file"]');

if (!input) {
return;
}

input.addEventListener("change", (event) => {
const files = Array.from(event.target.files || []);

```
if (files.length > 0) {
  addPhotos(files);
}

input.value = "";
```

});
}

function setupPhotoDropZone() {
const dropZone =
document.getElementById("photoDropZone") ||
document.querySelector(".photo-drop-zone") ||
document.querySelector(".upload-zone");

if (!dropZone) {
return;
}

dropZone.addEventListener("dragover", (event) => {
event.preventDefault();
dropZone.classList.add("dragging");
});

dropZone.addEventListener("dragleave", () => {
dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", (event) => {
event.preventDefault();

```
dropZone.classList.remove("dragging");

const files = Array.from(
  event.dataTransfer.files || []
).filter((file) => file.type.startsWith("image/"));

if (files.length > 0) {
  addPhotos(files);
}
```

});
}

// --------------------------------------------------
// ADD PHOTOS
// --------------------------------------------------

async function addPhotos(files) {
const imageFiles = files.filter((file) =>
file.type.startsWith("image/")
);

if (imageFiles.length === 0) {
showMessage("Please select image files.", "error");
return;
}

for (const file of imageFiles) {
try {
const compressedImage = await compressImage(file);

```
  state.photos.push({
    image: compressedImage,
    name: file.name,
    memory: ""
  });
} catch (error) {
  console.error("PHOTO PROCESSING ERROR:", error);
}
```

}

renderPhotos();
}

// --------------------------------------------------
// IMAGE COMPRESSION
// --------------------------------------------------

function compressImage(file) {
return new Promise((resolve, reject) => {
const reader = new FileReader();

```
reader.onload = () => {
  const image = new Image();

  image.onload = () => {
    const maxSize = 1600;

    let width = image.width;
    let height = image.height;

    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = Math.round(
          (height / width) * maxSize
        );
        width = maxSize;
      } else {
        width = Math.round(
          (width / height) * maxSize
        );
        height = maxSize;
      }
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    context.drawImage(
      image,
      0,
      0,
      width,
      height
    );

    resolve(
      canvas.toDataURL("image/jpeg", 0.78)
    );
  };

  image.onerror = () => {
    reject(new Error("Unable to load image."));
  };

  image.src = reader.result;
};

reader.onerror = () => {
  reject(new Error("Unable to read image."));
};

reader.readAsDataURL(file);
```

});
}

// --------------------------------------------------
// RENDER PHOTOS
// --------------------------------------------------

function renderPhotos() {
const container =
document.getElementById("photoPreview") ||
document.getElementById("photoGrid") ||
document.getElementById("uploadedPhotos") ||
document.querySelector(".photo-preview");

if (!container) {
return;
}

container.innerHTML = "";

state.photos.forEach((photo, index) => {
const card = document.createElement("div");

```
card.className = "photo-card";

card.innerHTML = `
  <div class="photo-card-image">
    <img
      src="${photo.image}"
      alt="Uploaded photo ${index + 1}"
    />
    <div class="photo-number">
      ${index + 1}
    </div>
  </div>

  <div class="photo-card-content">
    <label>
      What do you remember about this moment?
    </label>

    <textarea
      class="photo-memory"
      data-index="${index}"
      placeholder="Example: Emma was so excited when she saw the ocean for the first time..."
    >${escapeHtml(photo.memory)}</textarea>

    <div class="photo-actions">
      <button
        type="button"
        class="photo-action"
        data-move-up="${index}"
        ${index === 0 ? "disabled" : ""}
      >
        ↑
      </button>

      <button
        type="button"
        class="photo-action"
        data-move-down="${index}"
        ${index === state.photos.length - 1 ? "disabled" : ""}
      >
        ↓
      </button>

      <button
        type="button"
        class="photo-action delete"
        data-delete-photo="${index}"
      >
        Remove
      </button>
    </div>
  </div>
`;

container.appendChild(card);
```

});

container
.querySelectorAll(".photo-memory")
.forEach((textarea) => {
textarea.addEventListener("input", () => {
const index = Number(textarea.dataset.index);

```
    if (state.photos[index]) {
      state.photos[index].memory =
        textarea.value;
    }
  });
});
```

container
.querySelectorAll("[data-move-up]")
.forEach((button) => {
button.addEventListener("click", () => {
movePhoto(
Number(button.dataset.moveUp),
-1
);
});
});

container
.querySelectorAll("[data-move-down]")
.forEach((button) => {
button.addEventListener("click", () => {
movePhoto(
Number(button.dataset.moveDown),
1
);
});
});

container
.querySelectorAll("[data-delete-photo]")
.forEach((button) => {
button.addEventListener("click", () => {
deletePhoto(
Number(button.dataset.deletePhoto)
);
});
});

updatePhotoCount();
}

// --------------------------------------------------
// PHOTO MANAGEMENT
// --------------------------------------------------

function movePhoto(index, direction) {
const newIndex = index + direction;

if (
index < 0 ||
index >= state.photos.length ||
newIndex < 0 ||
newIndex >= state.photos.length
) {
return;
}

const temporary = state.photos[index];

state.photos[index] = state.photos[newIndex];
state.photos[newIndex] = temporary;

renderPhotos();
}

function deletePhoto(index) {
if (
index < 0 ||
index >= state.photos.length
) {
return;
}

state.photos.splice(index, 1);

renderPhotos();
}

function updatePhotoCount() {
const counters =
document.querySelectorAll("[data-photo-count]");

counters.forEach((counter) => {
counter.textContent = state.photos.length;
});
}

// --------------------------------------------------
// GENERATE AI STORY
// --------------------------------------------------

async function generateAIStory(event) {
if (event) {
event.preventDefault();
}

collectChildDetails();

if (!validateStoryPreferences()) {
return;
}

if (!validatePhotos()) {
return;
}

const generateButton =
document.getElementById("generateStory") ||
document.getElementById("generateStoryBtn") ||
document.querySelector("[data-generate-story]");

if (generateButton) {
generateButton.disabled = true;
generateButton.dataset.originalText =
generateButton.textContent;

```
generateButton.textContent =
  "Creating Your Story...";
```

}

showMessage(
"Your story is being created. The AI is studying the photos and memories...",
"loading"
);

try {
const response = await fetch(
"/api/generate-story",
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
child: state.child,
story: state.story,
memories: state.photos
})
}
);

```
const data = await response.json();

if (!response.ok) {
  throw new Error(
    data.error ||
    "The story could not be generated."
  );
}

if (!data.story) {
  throw new Error(
    "The server returned an invalid story."
  );
}

state.generatedStory = data.story;

renderGeneratedStory();

const totalSteps = getTotalSteps();

if (state.currentStep < totalSteps) {
  state.currentStep = totalSteps;
  updateStepUI();
}

hideMessage();
```

} catch (error) {
console.error(
"AI STORY ERROR:",
error
);

```
showMessage(
  error.message ||
  "We couldn't create the story yet.",
  "error"
);
```

} finally {
if (generateButton) {
generateButton.disabled = false;

```
  generateButton.textContent =
    generateButton.dataset.originalText ||
    "Generate My Story";
}
```

}
}

// --------------------------------------------------
// STORY RENDERING
// --------------------------------------------------

function renderGeneratedStory() {
const story = state.generatedStory;

if (!story) {
return;
}

const container =
document.getElementById("storyResult") ||
document.getElementById("generatedStory") ||
document.querySelector(".story-result");

if (!container) {
console.log(
"Generated story:",
story
);
return;
}

container.innerHTML = "";

const title = document.createElement("h1");
title.textContent =
story.title || "Once Upon My Child";

container.appendChild(title);

if (story.subtitle) {
const subtitle =
document.createElement("p");

```
subtitle.className =
  "story-subtitle";

subtitle.textContent =
  story.subtitle;

container.appendChild(subtitle);
```

}

if (story.dedication) {
const dedication =
document.createElement("p");

```
dedication.className =
  "story-dedication";

dedication.textContent =
  story.dedication;

container.appendChild(dedication);
```

}

const pages =
Array.isArray(story.pages)
? story.pages
: [];

pages.forEach((page, index) => {
const pageElement =
document.createElement("article");

```
pageElement.className =
  "story-page";

const photoIndex =
  Number(page.photoIndex);

const photo =
  state.photos[photoIndex];

if (photo) {
  const image =
    document.createElement("img");

  image.src = photo.image;

  image.alt =
    `Story page ${index + 1}`;

  image.className =
    "story-page-image";

  pageElement.appendChild(image);
}

if (page.heading) {
  const heading =
    document.createElement("h2");

  heading.textContent =
    page.heading;

  pageElement.appendChild(heading);
}

if (page.text) {
  const text =
    document.createElement("p");

  text.textContent =
    page.text;

  pageElement.appendChild(text);
}

container.appendChild(pageElement);
```

});

if (story.ending) {
const ending =
document.createElement("div");

```
ending.className =
  "story-ending";

const endingHeading =
  document.createElement("h2");

endingHeading.textContent =
  "The End";

const endingText =
  document.createElement("p");

endingText.textContent =
  story.ending;

ending.appendChild(
  endingHeading
);

ending.appendChild(
  endingText
);

container.appendChild(ending);
```

}
}

// --------------------------------------------------
// MESSAGES
// --------------------------------------------------

function showMessage(message, type = "info") {
let messageElement =
document.getElementById("appMessage");

if (!messageElement) {
messageElement =
document.createElement("div");

```
messageElement.id =
  "appMessage";

document.body.prepend(
  messageElement
);
```

}

messageElement.textContent =
message;

messageElement.className =
`app-message ${type}`;

messageElement.style.display =
"block";
}

function hideMessage() {
const messageElement =
document.getElementById("appMessage");

if (messageElement) {
messageElement.style.display =
"none";
}
}

// --------------------------------------------------
// UTILITY
// --------------------------------------------------

function escapeHtml(value) {
return String(value || "")
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}
