```javascript
"use strict";

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


document.addEventListener("DOMContentLoaded", initializeApp);


function initializeApp() {
  setupAdventureCards();
  setupNavigation();
  setupStorySettings();
  setupPhotoUpload();
  setupPhotoButtons();
  setupStoryActions();

  updateStep();

  console.log("Once Upon My Child initialized successfully.");
}


/* =========================================================
   ADVENTURE CARDS
========================================================= */

function setupAdventureCards() {
  const cards = document.querySelectorAll(
    "#storyTypeChoices .choice-card"
  );

  cards.forEach(function(card) {
    card.addEventListener("click", function() {

      cards.forEach(function(item) {
        item.classList.remove("selected");
        item.setAttribute("aria-selected", "false");
      });

      card.classList.add("selected");
      card.setAttribute("aria-selected", "true");

      state.story.type =
        card.getAttribute("data-value") ||
        "Magical Adventure";

      console.log("Adventure selected:", state.story.type);
    });
  });
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  const continueButton =
    document.getElementById("continueToPhotos");

  const backButton =
    document.getElementById("backToDetails");

  if (continueButton) {
    continueButton.addEventListener("click", function() {

      if (!collectChildDetails()) {
        return;
      }

      if (!collectStoryPreferences()) {
        return;
      }

      goToStep(2);
    });
  }

  if (backButton) {
    backButton.addEventListener("click", function() {
      goToStep(1);
    });
  }
}


function goToStep(step) {
  state.currentStep = step;
  updateStep();
}


function updateStep() {

  const screens =
    document.querySelectorAll(".screen");

  screens.forEach(function(screen) {
    screen.classList.remove("active");
  });

  const currentScreen =
    document.getElementById("step" + state.currentStep);

  if (currentScreen) {
    currentScreen.classList.add("active");
  }

  const stepLabel =
    document.getElementById("stepLabel");

  const progressBar =
    document.getElementById("progressBar");

  if (stepLabel) {
    stepLabel.textContent =
      "Step " + state.currentStep + " of 3";
  }

  if (progressBar) {
    const percentage =
      ((state.currentStep - 1) / 2) * 100;

    progressBar.style.width =
      percentage + "%";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   CHILD DETAILS
========================================================= */

function collectChildDetails() {

  const nameInput =
    document.getElementById("childName");

  const ageInput =
    document.getElementById("childAge");

  const personalityInput =
    document.getElementById("personality");

  const favoritesInput =
    document.getElementById("favorites");

  state.child.name =
    nameInput ? nameInput.value.trim() : "";

  state.child.age =
    ageInput ? ageInput.value : "";

  state.child.personality =
    personalityInput
      ? personalityInput.value.trim()
      : "";

  state.child.favorites =
    favoritesInput
      ? favoritesInput.value.trim()
      : "";

  if (!state.child.name) {
    showMessage("Please enter your child's name.");
    return false;
  }

  if (!state.child.age) {
    showMessage("Please choose your child's age.");
    return false;
  }

  return true;
}


/* =========================================================
   STORY PREFERENCES
========================================================= */

function collectStoryPreferences() {

  const settingInput =
    document.getElementById("setting");

  const lessonInput =
    document.getElementById("lesson");

  state.story.setting =
    settingInput
      ? settingInput.value.trim()
      : "";

  state.story.lesson =
    lessonInput
      ? lessonInput.value.trim()
      : "";

  if (!state.story.setting) {
    showMessage("Please enter a story setting.");
    return false;
  }

  if (!state.story.lesson) {
    showMessage("Please enter a special message.");
    return false;
  }

  if (!state.story.type) {
    state.story.type = "Magical Adventure";
  }

  return true;
}


/* =========================================================
   STORY SETTINGS
========================================================= */

function setupStorySettings() {

  const lengthSelect =
    document.getElementById("storyLength");

  const toneSelect =
    document.getElementById("storyTone");

  if (lengthSelect) {

    lengthSelect.addEventListener("change", function() {

      const values = {
        short: "Short",
        medium: "Medium",
        long: "Long"
      };

      state.story.length =
        values[lengthSelect.value] || "Medium";
    });
  }

  if (toneSelect) {

    toneSelect.addEventListener("change", function() {

      const values = {
        warm: "Warm & loving",
        magical: "Magical & whimsical",
        funny: "Funny & playful",
        adventurous: "Exciting & adventurous",
        calm: "Gentle & peaceful"
      };

      state.story.tone =
        values[toneSelect.value] ||
        "Warm & loving";
    });
  }
}


/* =========================================================
   PHOTO UPLOAD
========================================================= */

function setupPhotoUpload() {

  const photoInput =
    document.getElementById("photoInput");

  const dropZone =
    document.getElementById("dropZone");

  if (!photoInput) {
    return;
  }

  photoInput.addEventListener("change", function(event) {

    const files =
      Array.from(event.target.files || []);

    addPhotos(files);

    photoInput.value = "";
  });

  if (dropZone) {

    dropZone.addEventListener("dragover", function(event) {
      event.preventDefault();
      dropZone.classList.add("dragging");
    });

    dropZone.addEventListener("dragleave", function() {
      dropZone.classList.remove("dragging");
    });

    dropZone.addEventListener("drop", function(event) {

      event.preventDefault();

      dropZone.classList.remove("dragging");

      const files =
        Array.from(event.dataTransfer.files || [])
          .filter(function(file) {
            return file.type.startsWith("image/");
          });

      addPhotos(files);
    });
  }
}


async function addPhotos(files) {

  if (!files.length) {
    return;
  }

  for (const file of files) {

    try {

      const compressed =
        await compressImage(file);

      state.photos.push({
        image: compressed,
        name: file.name,
        memory: ""
      });

    } catch (error) {

      console.error(
        "Could not process image:",
        error
      );
    }
  }

  renderPhotos();
}


/* =========================================================
   IMAGE COMPRESSION
========================================================= */

function compressImage(file) {

  return new Promise(function(resolve, reject) {

    const reader = new FileReader();

    reader.onload = function(event) {

      const image =
        new Image();

      image.onload = function() {

        const maxSize = 1600;

        let width = image.width;
        let height = image.height;

        if (width > maxSize || height > maxSize) {

          if (width > height) {

            height =
              Math.round(
                height * maxSize / width
              );

            width = maxSize;

          } else {

            width =
              Math.round(
                width * maxSize / height
              );

            height = maxSize;
          }
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context =
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

      image.onerror = function() {
        reject(
          new Error("Unable to read image.")
        );
      };

      image.src = event.target.result;
    };

    reader.onerror = function() {
      reject(
        new Error("Unable to read file.")
      );
    };

    reader.readAsDataURL(file);
  });
}


/* =========================================================
   PHOTO DISPLAY
========================================================= */

function renderPhotos() {

  const list =
    document.getElementById("photoList");

  const count =
    document.getElementById("photoCount");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (count) {

    count.textContent =
      state.photos.length +
      (state.photos.length === 1
        ? " photo"
        : " photos");
  }

  state.photos.forEach(function(photo, index) {

    const card =
      document.createElement("div");

    card.className = "photo-item";

    card.innerHTML = `
      <div class="photo-preview">
        <img
          src="${photo.image}"
          alt="Memory photo ${index + 1}"
        >
      </div>

      <div class="photo-details">

        <div class="photo-number">
          Memory ${index + 1}
        </div>

        <textarea
          class="memory-input"
          data-index="${index}"
          rows="4"
          placeholder="Tell us what happened in this photo..."
        ></textarea>

        <div class="photo-controls">

          <button
            type="button"
            class="photo-control"
            data-action="up"
            data-index="${index}"
            ${index === 0 ? "disabled" : ""}
          >
            ↑
          </button>

          <button
            type="button"
            class="photo-control"
            data-action="down"
            data-index="${index}"
            ${index === state.photos.length - 1 ? "disabled" : ""}
          >
            ↓
          </button>

          <button
            type="button"
            class="photo-control delete"
            data-action="delete"
            data-index="${index}"
          >
            Remove
          </button>

        </div>

      </div>
    `;

    list.appendChild(card);

    const textarea =
      card.querySelector(".memory-input");

    if (textarea) {
      textarea.value =
        photo.memory || "";

      textarea.addEventListener(
        "input",
        function() {
          state.photos[index].memory =
            textarea.value;
        }
      );
    }
  });
}


/* =========================================================
   PHOTO CONTROLS
========================================================= */

function setupPhotoButtons() {

  const list =
    document.getElementById("photoList");

  if (!list) {
    return;
  }

  list.addEventListener("click", function(event) {

    const button =
      event.target.closest(
        "[data-action]"
      );

    if (!button) {
      return;
    }

    const action =
      button.getAttribute("data-action");

    const index =
      Number(
        button.getAttribute("data-index")
      );

    if (Number.isNaN(index)) {
      return;
    }

    if (action === "delete") {

      state.photos.splice(index, 1);
      renderPhotos();
      return;
    }

    if (action === "up" && index > 0) {

      const temp =
        state.photos[index - 1];

      state.photos[index - 1] =
        state.photos[index];

      state.photos[index] =
        temp;

      renderPhotos();
      return;
    }

    if (
      action === "down" &&
      index < state.photos.length - 1
    ) {

      const temp =
        state.photos[index + 1];

      state.photos[index + 1] =
        state.photos[index];

      state.photos[index] =
        temp;

      renderPhotos();
    }
  });
}


/* =========================================================
   STORY ACTIONS
========================================================= */

function setupStoryActions() {

  const addMemoryButton =
    document.getElementById("addMemoryBtn");

  const createStoryButton =
    document.getElementById("createStoryBtn");

  const editStoryButton =
    document.getElementById("editStoryBtn");

  const startOverButton =
    document.getElementById("startOverBtn");

  const printButton =
    document.getElementById("printStoryBtn");

  if (addMemoryButton) {

    addMemoryButton.addEventListener(
      "click",
      function() {

        const input =
          document.getElementById("photoInput");

        if (input) {
          input.click();
        }
      }
    );
  }

  if (createStoryButton) {

    createStoryButton.addEventListener(
      "click",
      generateAIStory
    );
  }

  if (editStoryButton) {

    editStoryButton.addEventListener(
      "click",
      function() {
        goToStep(1);
      }
    );
  }

  if (startOverButton) {

    startOverButton.addEventListener(
      "click",
      startOver
    );
  }

  if (printButton) {

    printButton.addEventListener(
      "click",
      function() {
        window.print();
      }
    );
  }
}


/* =========================================================
   AI STORY GENERATION
========================================================= */

async function generateAIStory() {

  if (!state.photos.length) {

    showMessage(
      "Please add at least one photo before creating the story."
    );

    return;
  }

  collectStoryPreferences();

  const button =
    document.getElementById("createStoryBtn");

  const originalText =
    button ? button.innerHTML : "";

  if (button) {

    button.disabled = true;

    button.innerHTML =
      "Creating their story... ✨";
  }

  try {

    const response =
      await fetch(
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

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "The story could not be created."
      );
    }

    if (!data.story) {

      throw new Error(
        "The server returned an invalid story."
      );
    }

    state.generatedStory =
      data.story;

    renderGeneratedStory();

    goToStep(3);

  } catch (error) {

    console.error(
      "AI STORY ERROR:",
      error
    );

    showMessage(
      error.message ||
      "We couldn't create the story yet."
    );

  } finally {

    if (button) {

      button.disabled = false;

      button.innerHTML =
        originalText;
    }
  }
}


/* =========================================================
   RENDER GENERATED STORY
========================================================= */

function renderGeneratedStory() {

  const story =
    state.generatedStory;

  if (!story) {
    return;
  }

  const title =
    document.getElementById("storyTitle");

  const subtitle =
    document.getElementById("storySubtitle");

  const coverChildName =
    document.getElementById("coverChildName");

  const coverStoryType =
    document.getElementById("coverStoryType");

  const endingText =
    document.getElementById("endingText");

  const generatedPages =
    document.getElementById("generatedPages");

  const coverPhotoWrap =
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

  if (coverChildName) {
    coverChildName.textContent =
      state.child.name;
  }

  if (coverStoryType) {
    coverStoryType.textContent =
      state.story.type;
  }

  if (endingText) {
    endingText.textContent =
      story.ending || "";
  }

  if (coverPhotoWrap) {

    if (state.photos.length) {

      coverPhotoWrap.innerHTML = `
        <img
          src="${state.photos[0].image}"
          alt="Cover memory"
        >
      `;

    } else {

      coverPhotoWrap.innerHTML =
        '<div class="cover-placeholder">📖</div>';
    }
  }

  if (!generatedPages) {
    return;
  }

  generatedPages.innerHTML = "";

  const pages =
    Array.isArray(story.pages)
      ? story.pages
      : [];

  pages.forEach(function(page, index) {

    const article =
      document.createElement("article");

    article.className =
      "story-page";

    const photoIndex =
      Number.isInteger(page.photoIndex)
        ? page.photoIndex
        : index;

    let imageHTML = "";

    if (
      state.photos[photoIndex] &&
      state.photos[photoIndex].image
    ) {

      imageHTML = `
        <div class="story-photo-wrap">
          <img
            src="${state.photos[photoIndex].image}"
            alt="Story memory ${index + 1}"
          >
        </div>
      `;
    }

    article.innerHTML = `
      ${imageHTML}

      <div class="story-page-content">

        <div class="story-page-number">
          ${index + 1}
        </div>

        <h2>
          ${escapeHtml(
            page.heading || ""
          )}
        </h2>

        <p>
          ${escapeHtml(
            page.text || ""
          )}
        </p>

      </div>
    `;

    generatedPages.appendChild(article);
  });
}


/* =========================================================
   START OVER
========================================================= */

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
  state.generatedStory = null;

  const fields = [
    "childName",
    "personality",
    "favorites",
    "setting",
    "lesson"
  ];

  fields.forEach(function(id) {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }
  });

  const age =
    document.getElementById("childAge");

  if (age) {
    age.value = "";
  }

  const length =
    document.getElementById("storyLength");

  if (length) {
    length.value = "medium";
  }

  const tone =
    document.getElementById("storyTone");

  if (tone) {
    tone.value = "warm";
  }

  const cards =
    document.querySelectorAll(
      "#storyTypeChoices .choice-card"
    );

  cards.forEach(function(card) {

    const selected =
      card.getAttribute("data-value") ===
      "Magical Adventure";

    card.classList.toggle(
      "selected",
      selected
    );

    card.setAttribute(
      "aria-selected",
      selected ? "true" : "false"
    );
  });

  renderPhotos();

  goToStep(1);
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message) {

  let box =
    document.getElementById("appMessage");

  if (!box) {

    box =
      document.createElement("div");

    box.id = "appMessage";

    box.style.position = "fixed";
    box.style.top = "20px";
    box.style.left = "50%";
    box.style.transform =
      "translateX(-50%)";
    box.style.zIndex = "9999";
    box.style.padding = "14px 20px";
    box.style.background = "#ffffff";
    box.style.borderRadius = "12px";
    box.style.boxShadow =
      "0 8px 30px rgba(0,0,0,0.15)";
    box.style.fontWeight = "600";

    document.body.appendChild(box);
  }

  box.textContent = message;

  clearTimeout(
    showMessage.timeout
  );

  showMessage.timeout =
    setTimeout(function() {

      if (box) {
        box.remove();
      }

    }, 4000);
}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```
