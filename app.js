/*
ONCE UPON MY CHILD
Main Frontend Application
*/

"use strict";

// ============================================================
// APPLICATION STATE
// ============================================================

const state = {
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
length: "Medium",
tone: "Warm & loving"
},

photos: [],

generatedStory: null
};

// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
initializeApp();
});

function initializeApp() {

setupAdventureCards();

setupNavigation();

setupPhotoUpload();

setupPhotoDropZone();

setupStorySettings();

setupStoryActions();

updateStep();

updatePhotoCount();

console.log("Once Upon My Child initialized successfully.");
}

// ============================================================
// ADVENTURE CARDS
// ============================================================

function setupAdventureCards() {

const cards = document.querySelectorAll(
"#storyTypeChoices .choice-card"
);

cards.forEach((card) => {

```
card.addEventListener("click", (event) => {

  event.preventDefault();

  cards.forEach((item) => {

    item.classList.remove("selected");

    item.setAttribute(
      "aria-selected",
      "false"
    );

  });

  card.classList.add("selected");

  card.setAttribute(
    "aria-selected",
    "true"
  );

  state.story.type =
    card.dataset.value ||
    card.textContent.trim();

  console.log(
    "Adventure selected:",
    state.story.type
  );
});
```

});
}

// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

const continueButton =
document.getElementById(
"continueToPhotos"
);

const backButton =
document.getElementById(
"backToDetails"
);

if (continueButton) {

```
continueButton.addEventListener(
  "click",
  (event) => {

    event.preventDefault();

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

```
backButton.addEventListener(
  "click",
  (event) => {

    event.preventDefault();

    goToStep(1);

  }
);
```

}
}

// ============================================================
// STEP CONTROL
// ============================================================

function goToStep(step) {

if (step < 1 || step > 3) {
return;
}

state.currentStep = step;

updateStep();

window.scrollTo({
top: 0,
behavior: "smooth"
});
}

function updateStep() {

const screens =
document.querySelectorAll(
".screen"
);

screens.forEach((screen) => {

```
screen.classList.remove("active");
```

});

const currentScreen =
document.getElementById(
`step${state.currentStep}`
);

if (currentScreen) {

```
currentScreen.classList.add(
  "active"
);
```

}

const stepLabel =
document.getElementById(
"stepLabel"
);

if (stepLabel) {

```
stepLabel.textContent =
  `Step ${state.currentStep} of 3`;
```

}

const progressBar =
document.getElementById(
"progressBar"
);

if (progressBar) {

```
const percentage =
  state.currentStep === 1
    ? 0
    : state.currentStep === 2
    ? 50
    : 100;

progressBar.style.width =
  `${percentage}%`;
```

}
}

// ============================================================
// CHILD DETAILS
// ============================================================

function collectChildDetails() {

const nameInput =
document.getElementById(
"childName"
);

const ageInput =
document.getElementById(
"childAge"
);

const personalityInput =
document.getElementById(
"personality"
);

const favoritesInput =
document.getElementById(
"favorites"
);

state.child.name =
nameInput
? nameInput.value.trim()
: "";

state.child.age =
ageInput
? ageInput.value.trim()
: "";

state.child.personality =
personalityInput
? personalityInput.value.trim()
: "";

state.child.favorites =
favoritesInput
? favoritesInput.value.trim()
: "";

if (!state.child.name) {

```
showMessage(
  "Please enter your child's name."
);

if (nameInput) {
  nameInput.focus();
}

return false;
```

}

if (!state.child.age) {

```
showMessage(
  "Please choose your child's age."
);

if (ageInput) {
  ageInput.focus();
}

return false;
```

}

return true;
}

// ============================================================
// STORY PREFERENCES
// ============================================================

function collectStoryPreferences() {

const settingInput =
document.getElementById(
"setting"
);

const lessonInput =
document.getElementById(
"lesson"
);

state.story.setting =
settingInput
? settingInput.value.trim()
: "";

state.story.lesson =
lessonInput
? lessonInput.value.trim()
: "";

if (!state.story.type) {

```
state.story.type =
  "Magical Adventure";
```

}

if (!state.story.setting) {

```
showMessage(
  "Please choose or describe a story setting."
);

if (settingInput) {
  settingInput.focus();
}

return false;
```

}

if (!state.story.lesson) {

```
showMessage(
  "Please add a special message for the story."
);

if (lessonInput) {
  lessonInput.focus();
}

return false;
```

}

return true;
}

// ============================================================
// STORY SETTINGS
// ============================================================

function setupStorySettings() {

const lengthSelect =
document.getElementById(
"storyLength"
);

const toneSelect =
document.getElementById(
"storyTone"
);

if (lengthSelect) {

```
lengthSelect.addEventListener(
  "change",
  () => {

    const value =
      lengthSelect.value;

    if (value === "short") {
      state.story.length = "Short";
    }

    else if (value === "long") {
      state.story.length = "Long";
    }

    else {
      state.story.length = "Medium";
    }

  }
);
```

}

if (toneSelect) {

```
toneSelect.addEventListener(
  "change",
  () => {

    const value =
      toneSelect.value;

    if (value === "magical") {
      state.story.tone =
        "Magical & whimsical";
    }

    else if (value === "funny") {
      state.story.tone =
        "Funny & playful";
    }

    else if (value === "adventurous") {
      state.story.tone =
        "Exciting & adventurous";
    }

    else if (value === "calm") {
      state.story.tone =
        "Gentle & peaceful";
    }

    else {
      state.story.tone =
        "Warm & loving";
    }

  }
);
```

}
}

// ============================================================
// PHOTO UPLOAD
// ============================================================

function setupPhotoUpload() {

const input =
document.getElementById(
"photoInput"
);

if (!input) {
return;
}

input.addEventListener(
"change",
async (event) => {

```
  const files =
    Array.from(
      event.target.files || []
    );

  if (files.length) {

    await addPhotos(files);

  }

  /*
    Reset the input so the user can
    select the same photo again later.
  */

  input.value = "";

}
```

);
}

// ============================================================
// DRAG AND DROP
// ============================================================

function setupPhotoDropZone() {

const dropZone =
document.getElementById(
"dropZone"
);

if (!dropZone) {
return;
}

dropZone.addEventListener(
"dragover",
(event) => {

```
  event.preventDefault();

  dropZone.classList.add(
    "dragging"
  );

}
```

);

dropZone.addEventListener(
"dragleave",
() => {

```
  dropZone.classList.remove(
    "dragging"
  );

}
```

);

dropZone.addEventListener(
"drop",
async (event) => {

```
  event.preventDefault();

  dropZone.classList.remove(
    "dragging"
  );


  const files =
    Array.from(
      event.dataTransfer.files || []
    ).filter(
      (file) =>
        file.type.startsWith(
          "image/"
        )
    );


  if (files.length) {

    await addPhotos(files);

  }

}
```

);
}

// ============================================================
// ADD PHOTOS
// ============================================================

async function addPhotos(files) {

const imageFiles =
files.filter(
(file) =>
file.type.startsWith(
"image/"
)
);

if (!imageFiles.length) {

```
showMessage(
  "Please choose image files."
);

return;
```

}

for (const file of imageFiles) {

```
try {

  const image =
    await compressImage(file);


  state.photos.push({

    image: image,

    name: file.name,

    memory: ""

  });

}

catch (error) {

  console.error(
    "Photo processing error:",
    error
  );

}
```

}

renderPhotos();

hideMessage();
}

// ============================================================
// IMAGE COMPRESSION
// ============================================================

function compressImage(file) {

return new Promise(
(resolve, reject) => {

```
  const reader =
    new FileReader();


  reader.onload = () => {

    const image =
      new Image();


    image.onload = () => {

      const maxSize =
        1600;

      let width =
        image.width;

      let height =
        image.height;


      if (
        width > maxSize ||
        height > maxSize
      ) {

        if (width > height) {

          height =
            Math.round(
              (height / width) *
                maxSize
            );

          width =
            maxSize;

        }

        else {

          width =
            Math.round(
              (width / height) *
                maxSize
            );

          height =
            maxSize;

        }

      }


      const canvas =
        document.createElement(
          "canvas"
        );


      canvas.width =
        width;

      canvas.height =
        height;


      const context =
        canvas.getContext(
          "2d"
        );


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


    image.onerror = () => {

      reject(
        new Error(
          "Unable to load image."
        )
      );

    };


    image.src =
      reader.result;

  };


  reader.onerror = () => {

    reject(
      new Error(
        "Unable to read image."
      )
    );

  };


  reader.readAsDataURL(file);

}
```

);
}

// ============================================================
// RENDER PHOTO LIST
// ============================================================

function renderPhotos() {

const photoList =
document.getElementById(
"photoList"
);

if (!photoList) {
return;
}

photoList.innerHTML = "";

state.photos.forEach(
(photo, index) => {

```
  const card =
    document.createElement(
      "div"
    );


  card.className =
    "photo-card";


  card.innerHTML = `

    <div class="photo-card-image">

      <img
        src="${photo.image}"
        alt="Memory photo ${index + 1}"
      >

      <span class="photo-number">
        ${index + 1}
      </span>

    </div>


    <div class="photo-card-content">

      <label>
        Tell us about this moment
      </label>

      <textarea
        class="photo-memory"
        data-index="${index}"
        rows="4"
        placeholder="What happened here? How did ${escapeHtml(
          state.child.name || "your child"
        )} feel?"
      >${escapeHtml(
        photo.memory
      )}</textarea>


      <div class="photo-actions">

        <button
          type="button"
          class="photo-action"
          data-up="${index}"
          ${index === 0 ? "disabled" : ""}
        >
          ↑
        </button>


        <button
          type="button"
          class="photo-action"
          data-down="${index}"
          ${
            index ===
            state.photos.length - 1
              ? "disabled"
              : ""
          }
        >
          ↓
        </button>


        <button
          type="button"
          class="photo-action delete"
          data-delete="${index}"
        >
          Remove
        </button>

      </div>

    </div>

  `;


  photoList.appendChild(
    card
  );

}
```

);

attachPhotoControls();

updatePhotoCount();
}

// ============================================================
// PHOTO CONTROLS
// ============================================================

function attachPhotoControls() {

document
.querySelectorAll(
".photo-memory"
)
.forEach(
(textarea) => {

```
    textarea.addEventListener(
      "input",
      () => {

        const index =
          Number(
            textarea.dataset.index
          );


        if (
          state.photos[index]
        ) {

          state.photos[index].memory =
            textarea.value;

        }

      }
    );

  }
);
```

document
.querySelectorAll(
"[data-up]"
)
.forEach(
(button) => {

```
    button.addEventListener(
      "click",
      () => {

        movePhoto(
          Number(
            button.dataset.up
          ),
          -1
        );

      }
    );

  }
);
```

document
.querySelectorAll(
"[data-down]"
)
.forEach(
(button) => {

```
    button.addEventListener(
      "click",
      () => {

        movePhoto(
          Number(
            button.dataset.down
          ),
          1
        );

      }
    );

  }
);
```

document
.querySelectorAll(
"[data-delete]"
)
.forEach(
(button) => {

```
    button.addEventListener(
      "click",
      () => {

        deletePhoto(
          Number(
            button.dataset.delete
          )
        );

      }
    );

  }
);
```

}

// ============================================================
// MOVE PHOTO
// ============================================================

function movePhoto(
index,
direction
) {

const newIndex =
index + direction;

if (
newIndex < 0 ||
newIndex >= state.photos.length
) {
return;
}

const temporary =
state.photos[index];

state.photos[index] =
state.photos[newIndex];

state.photos[newIndex] =
temporary;

renderPhotos();
}

// ============================================================
// DELETE PHOTO
// ============================================================

function deletePhoto(index) {

if (
index < 0 ||
index >= state.photos.length
) {
return;
}

state.photos.splice(
index,
1
);

renderPhotos();
}

// ============================================================
// PHOTO COUNT
// ============================================================

function updatePhotoCount() {

const count =
document.getElementById(
"photoCount"
);

if (!count) {
return;
}

const total =
state.photos.length;

count.textContent =
total === 1
? "1 photo"
: `${total} photos`;
}

// ============================================================
// ADD ANOTHER MEMORY
// ============================================================

function setupStoryActions() {

const addMemoryButton =
document.getElementById(
"addMemoryBtn"
);

const createStoryButton =
document.getElementById(
"createStoryBtn"
);

const editStoryButton =
document.getElementById(
"editStoryBtn"
);

const startOverButton =
document.getElementById(
"startOverBtn"
);

const printButton =
document.getElementById(
"printStoryBtn"
);

if (addMemoryButton) {

```
addMemoryButton.addEventListener(
  "click",
  () => {

    const input =
      document.getElementById(
        "photoInput"
      );

    if (input) {

      input.click();

    }

  }
);
```

}

if (createStoryButton) {

```
createStoryButton.addEventListener(
  "click",
  generateAIStory
);
```

}

if (editStoryButton) {

```
editStoryButton.addEventListener(
  "click",
  () => {

    goToStep(2);

  }
);
```

}

if (startOverButton) {

```
startOverButton.addEventListener(
  "click",
  startOver
);
```

}

if (printButton) {

```
printButton.addEventListener(
  "click",
  () => {

    window.print();

  }
);
```

}
}

// ============================================================
// GENERATE STORY
// ============================================================

async function generateAIStory(
event
) {

if (event) {
event.preventDefault();
}

if (!collectChildDetails()) {
goToStep(1);
return;
}

if (!collectStoryPreferences()) {
goToStep(1);
return;
}

if (
state.photos.length === 0
) {

```
showMessage(
  "Please add at least one photo before creating the story."
);

return;
```

}

const button =
document.getElementById(
"createStoryBtn"
);

const originalText =
button
? button.textContent
: "";

if (button) {

```
button.disabled = true;

button.innerHTML =
  "Creating their story... ✨";
```

}

showMessage(
"Your story is being created. Our AI is studying the photos and memories...",
"loading"
);

try {

```
const response =
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

          child:
            state.child,

          story:
            state.story,

          memories:
            state.photos

        })
    }
  );


let data;


try {

  data =
    await response.json();

}

catch (error) {

  throw new Error(
    "The server returned an invalid response."
  );

}


if (!response.ok) {

  throw new Error(
    data.error ||
    "Unable to create the story."
  );

}


if (
  !data.story
) {

  throw new Error(
    "The server did not return a story."
  );

}


state.generatedStory =
  data.story;


renderGeneratedStory();


hideMessage();


goToStep(3);
```

}

catch (error) {

```
console.error(
  "AI STORY ERROR:",
  error
);


showMessage(
  error.message ||
  "We couldn't create the story yet.",
  "error"
);
```

}

finally {

```
if (button) {

  button.disabled = false;

  button.textContent =
    originalText ||
    "Create their story ✨";

}
```

}
}

// ============================================================
// RENDER GENERATED STORY
// ============================================================

function renderGeneratedStory() {

const story =
state.generatedStory;

if (!story) {
return;
}

const title =
document.getElementById(
"storyTitle"
);

const subtitle =
document.getElementById(
"storySubtitle"
);

const childName =
document.getElementById(
"coverChildName"
);

const storyType =
document.getElementById(
"coverStoryType"
);

const ending =
document.getElementById(
"endingText"
);

const generatedPages =
document.getElementById(
"generatedPages"
);

if (title) {

```
title.textContent =
  story.title ||
  `Once Upon a Time...`;
```

}

if (subtitle) {

```
subtitle.textContent =
  story.subtitle ||
  "";
```

}

if (childName) {

```
childName.textContent =
  state.child.name;
```

}

if (storyType) {

```
storyType.textContent =
  state.story.type;
```

}

if (ending) {

```
ending.textContent =
  story.ending ||
  "";
```

}

renderCoverPhoto();

if (!generatedPages) {
return;
}

generatedPages.innerHTML =
"";

const pages =
Array.isArray(
story.pages
)
? story.pages
: [];

pages.forEach(
(page, index) => {

```
  const article =
    document.createElement(
      "article"
    );


  article.className =
    "story-page generated-story-page";


  const photoIndex =
    Number(
      page.photoIndex
    );


  const photo =
    state.photos[
      photoIndex
    ];


  if (photo) {

    const image =
      document.createElement(
        "img"
      );


    image.src =
      photo.image;


    image.alt =
      `Story illustration ${index + 1}`;


    image.className =
      "story-page-image";


    article.appendChild(
      image
    );

  }


  const content =
    document.createElement(
      "div"
    );


  content.className =
    "story-page-content";


  if (page.heading) {

    const heading =
      document.createElement(
        "h2"
      );


    heading.textContent =
      page.heading;


    content.appendChild(
      heading
    );

  }


  if (page.text) {

    const text =
      document.createElement(
        "p"
      );


    text.textContent =
      page.text;


    content.appendChild(
      text
    );

  }


  article.appendChild(
    content
  );


  generatedPages.appendChild(
    article
  );

}
```

);
}

// ============================================================
// COVER PHOTO
// ============================================================

function renderCoverPhoto() {

const container =
document.getElementById(
"coverPhotoWrap"
);

if (!container) {
return;
}

container.innerHTML =
"";

if (
state.photos.length === 0
) {

```
container.innerHTML =
  `<div class="cover-placeholder">📖</div>`;

return;
```

}

const image =
document.createElement(
"img"
);

image.src =
state.photos[0].image;

image.alt =
`${state.child.name}'s story`;

container.appendChild(
image
);
}

// ============================================================
// START OVER
// ============================================================

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
length: "Medium",
tone: "Warm & loving"
};

state.photos = [];

state.generatedStory =
null;

resetForm();

renderPhotos();

const cards =
document.querySelectorAll(
"#storyTypeChoices .choice-card"
);

cards.forEach(
(card, index) => {

```
  card.classList.toggle(
    "selected",
    index === 0
  );


  card.setAttribute(
    "aria-selected",
    index === 0
      ? "true"
      : "false"
  );

}
```

);

goToStep(1);

}

// ============================================================
// RESET FORM
// ============================================================

function resetForm() {

const fields =
document.querySelectorAll(
"input, textarea, select"
);

fields.forEach(
(field) => {

```
  if (
    field.type === "file"
  ) {
    field.value = "";
    return;
  }


  if (
    field.tagName ===
    "SELECT"
  ) {

    field.selectedIndex = 0;

  }

  else {

    field.value = "";

  }

}
```

);

const length =
document.getElementById(
"storyLength"
);

if (length) {

```
length.value =
  "medium";
```

}

const tone =
document.getElementById(
"storyTone"
);

if (tone) {

```
tone.value =
  "warm";
```

}
}

// ============================================================
// MESSAGE
// ============================================================

function showMessage(
message,
type = "error"
) {

let element =
document.getElementById(
"appMessage"
);

if (!element) {

```
element =
  document.createElement(
    "div"
  );


element.id =
  "appMessage";


document.body.appendChild(
  element
);
```

}

element.textContent =
message;

element.className =
`app-message ${type}`;

element.style.display =
"block";

/*
Keep errors visible.
Loading messages are also visible
until explicitly hidden.
*/

}

function hideMessage() {

const element =
document.getElementById(
"appMessage"
);

if (element) {

```
element.style.display =
  "none";
```

}
}

// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(
value
) {

return String(
value || ""
)
.replace(
/&/g,
"&"
)
.replace(
/</g,
"<"
)
.replace(
/>/g,
">"
)
.replace(
/"/g,
"""
)
.replace(
/'/g,
"'"
);

}
