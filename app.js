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
    length: "medium",
    tone: "warm"
  },

  photos: [],
  generatedStory: null
};


// ===============================
// ELEMENTS
// ===============================

const childName = document.getElementById("childName");
const childAge = document.getElementById("childAge");
const personality = document.getElementById("personality");
const favorites = document.getElementById("favorites");

const setting = document.getElementById("setting");
const lesson = document.getElementById("lesson");

const storyLength = document.getElementById("storyLength");
const storyTone = document.getElementById("storyTone");

const photoInput = document.getElementById("photoInput");
const photoList = document.getElementById("photoList");
const photoCount = document.getElementById("photoCount");
const dropZone = document.getElementById("dropZone");

const continueToPhotos = document.getElementById("continueToPhotos");
const backToDetails = document.getElementById("backToDetails");
const addMemoryBtn = document.getElementById("addMemoryBtn");
const createStoryBtn = document.getElementById("createStoryBtn");

const editStoryBtn = document.getElementById("editStoryBtn");
const startOverBtn = document.getElementById("startOverBtn");
const printStoryBtn = document.getElementById("printStoryBtn");

const storyTitle = document.getElementById("storyTitle");
const storySubtitle = document.getElementById("storySubtitle");
const coverPhotoWrap = document.getElementById("coverPhotoWrap");
const coverChildName = document.getElementById("coverChildName");
const coverStoryType = document.getElementById("coverStoryType");
const generatedPages = document.getElementById("generatedPages");
const endingText = document.getElementById("endingText");

const progressBar = document.getElementById("progressBar");
const stepLabel = document.getElementById("stepLabel");


// ===============================
// INITIALIZE APP
// ===============================

function initializeApp() {
  setupChoiceCards();
  setupPhotoUpload();
  setupButtons();
  updateStepUI();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}


// ===============================
// CHOICE CARDS
// ===============================

function setupChoiceCards() {
  const cards = document.querySelectorAll(".choice-card");

  cards.forEach(card => {
    card.addEventListener("click", function () {
      const group = card.closest("[data-choice]");

      if (!group) {
        return;
      }

      const groupCards = group.querySelectorAll(".choice-card");

      groupCards.forEach(item => {
        item.classList.remove("selected");
        item.setAttribute("aria-selected", "false");
      });

      card.classList.add("selected");
      card.setAttribute("aria-selected", "true");

      const value =
        card.dataset.value ||
        card.textContent.trim();

      const choiceType = group.dataset.choice;

      if (choiceType === "story-type") {
        state.story.type = value;
      }

      if (choiceType === "setting") {
        state.story.setting = value;
      }

      if (choiceType === "length") {
        state.story.length = value;
      }

      if (choiceType === "tone") {
        state.story.tone = value;
      }
    });
  });
}


// ===============================
// STEP NAVIGATION
// ===============================

function updateStepUI() {
  const steps = [
    document.getElementById("step1"),
    document.getElementById("step2"),
    document.getElementById("step3")
  ];

  steps.forEach((step, index) => {
    if (!step) {
      return;
    }

    step.classList.toggle(
      "active",
      index + 1 === state.currentStep
    );
  });

  if (progressBar) {
    progressBar.style.width =
      ((state.currentStep / 3) * 100) + "%";
  }

  if (stepLabel) {
    stepLabel.textContent =
      "Step " + state.currentStep + " of 3";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ===============================
// CHILD DETAILS
// ===============================

function collectChildDetails() {
  if (childName) {
    state.child.name = childName.value.trim();
  }

  if (childAge) {
    state.child.age = childAge.value.trim();
  }

  if (personality) {
    state.child.personality = personality.value.trim();
  }

  if (favorites) {
    state.child.favorites = favorites.value.trim();
  }

  if (setting && setting.value.trim()) {
    state.story.setting = setting.value.trim();
  }

  if (lesson) {
    state.story.lesson = lesson.value.trim();
  }

  if (storyLength && storyLength.value) {
    state.story.length = storyLength.value;
  }

  if (storyTone && storyTone.value) {
    state.story.tone = storyTone.value;
  }
}


// ===============================
// PHOTO UPLOAD
// ===============================

function setupPhotoUpload() {
  if (photoInput) {
    photoInput.addEventListener("change", function (event) {
      addPhotos(event.target.files);

      event.target.value = "";
    });
  }

  if (dropZone) {
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
  }
}


function addPhotos(files) {
  if (!files) {
    return;
  }

  Array.from(files).forEach(function (file) {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const photo = {
      id: Date.now() + Math.random(),
      file: file,
      url: URL.createObjectURL(file),
      memory: ""
    };

    state.photos.push(photo);
  });

  renderPhotos();
}


// ===============================
// RENDER PHOTOS
// ===============================

function renderPhotos() {
  if (!photoList) {
    return;
  }

  photoList.innerHTML = "";

  state.photos.forEach(function (photo, index) {
    const item = document.createElement("div");

    item.className = "photo-item";

    item.innerHTML = `
      <div class="photo-preview">
        <img
          src="${photo.url}"
          alt="Photo ${index + 1}"
        >
      </div>

      <div class="photo-info">

        <strong>Photo ${index + 1}</strong>

        <textarea
          placeholder="What memory does this photo represent?"
          data-photo-id="${photo.id}"
          class="memory-input"
        >${escapeHtml(photo.memory)}</textarea>

        <div class="photo-actions">

          <button
            type="button"
            class="photo-up"
            data-id="${photo.id}"
          >
            ↑
          </button>

          <button
            type="button"
            class="photo-down"
            data-id="${photo.id}"
          >
            ↓
          </button>

          <button
            type="button"
            class="photo-delete"
            data-id="${photo.id}"
          >
            Delete
          </button>

        </div>

      </div>
    `;

    photoList.appendChild(item);
  });

  setupPhotoItemControls();

  if (photoCount) {
    photoCount.textContent =
      state.photos.length +
      " photo" +
      (state.photos.length === 1 ? "" : "s");
  }
}


// ===============================
// PHOTO CONTROLS
// ===============================

function setupPhotoItemControls() {
  const memoryInputs =
    document.querySelectorAll(".memory-input");

  memoryInputs.forEach(function (input) {
    input.addEventListener("input", function (event) {
      const id = Number(event.target.dataset.photoId);

      const photo = state.photos.find(function (item) {
        return Number(item.id) === id;
      });

      if (photo) {
        photo.memory = event.target.value;
      }
    });
  });


  const deleteButtons =
    document.querySelectorAll(".photo-delete");

  deleteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const id = Number(button.dataset.id);

      const index = state.photos.findIndex(function (photo) {
        return Number(photo.id) === id;
      });

      if (index !== -1) {
        URL.revokeObjectURL(
          state.photos[index].url
        );

        state.photos.splice(index, 1);

        renderPhotos();
      }
    });
  });


  const upButtons =
    document.querySelectorAll(".photo-up");

  upButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      movePhoto(
        Number(button.dataset.id),
        -1
      );
    });
  });


  const downButtons =
    document.querySelectorAll(".photo-down");

  downButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      movePhoto(
        Number(button.dataset.id),
        1
      );
    });
  });
}


// ===============================
// MOVE PHOTO
// ===============================

function movePhoto(id, direction) {
  const index = state.photos.findIndex(function (photo) {
    return Number(photo.id) === id;
  });

  if (index === -1) {
    return;
  }

  const newIndex = index + direction;

  if (
    newIndex < 0 ||
    newIndex >= state.photos.length
  ) {
    return;
  }

  const temp = state.photos[index];

  state.photos[index] =
    state.photos[newIndex];

  state.photos[newIndex] =
    temp;

  renderPhotos();
}


// ===============================
// IMAGE COMPRESSION
// ===============================

function compressImage(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const image = new Image();

      image.onload = function () {
        const maxDimension = 1600;

        let width = image.width;
        let height = image.height;

        if (
          width > maxDimension ||
          height > maxDimension
        ) {
          if (width > height) {
            height =
              Math.round(
                height * maxDimension / width
              );

            width = maxDimension;
          } else {
            width =
              Math.round(
                width * maxDimension / height
              );

            height = maxDimension;
          }
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context =
          canvas.getContext("2d");

        if (!context) {
          reject(
            new Error(
              "Could not prepare the photo."
            )
          );

          return;
        }

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const dataUrl =
          canvas.toDataURL(
            "image/jpeg",
            0.78
          );

        resolve(dataUrl);
      };

      image.onerror = function () {
        reject(
          new Error(
            "One of the uploaded photos could not be processed."
          )
        );
      };

      image.src = event.target.result;
    };

    reader.onerror = function () {
      reject(
        new Error(
          "Could not read one of the uploaded photos."
        )
      );
    };

    reader.readAsDataURL(file);
  });
}


// ===============================
// PREPARE PHOTOS FOR AI
// ===============================

async function preparePhotosForAI() {
  const preparedPhotos = [];

  for (
    let index = 0;
    index < state.photos.length;
    index++
  ) {
    const photo = state.photos[index];

    const imageData =
      await compressImage(photo.file);

    preparedPhotos.push({
      index: index,
      memory: photo.memory || "",
      fileName:
        photo.file && photo.file.name
          ? photo.file.name
          : "",
      image: imageData
    });
  }

  return preparedPhotos;
}


// ===============================
// CREATE AI STORY
// ===============================

async function generateAIStory() {
  collectChildDetails();

  if (!state.child.name) {
    alert("Please enter the child's name.");
    return;
  }

  if (!state.child.age) {
    alert("Please enter the child's age.");
    return;
  }

  if (state.photos.length === 0) {
    alert("Please upload at least one photo.");
    return;
  }

  if (!createStoryBtn) {
    return;
  }

  const originalText =
    createStoryBtn.textContent;

  createStoryBtn.disabled = true;

  createStoryBtn.textContent =
    "Preparing your memories...";

  try {
    const memories =
      await preparePhotosForAI();

    createStoryBtn.textContent =
      "Creating your story...";

    const requestData = {
      child: state.child,
      story: state.story,
      memories: memories
    };

    const response = await fetch(
      "/api/generate-story",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(requestData)
      }
    );

    let data;

    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error(
        "The server returned an invalid response."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
        "The AI story engine could not create the story."
      );
    }

    if (!data.story) {
      throw new Error(
        "The AI returned an unexpected response."
      );
    }

    state.generatedStory =
      data.story;

    renderAIStory();

    state.currentStep = 3;

    updateStepUI();

  } catch (error) {
    console.error(
      "AI STORY ERROR:",
      error
    );

    alert(
      "We couldn't create the story yet.\n\n" +
      error.message
    );

  } finally {
    createStoryBtn.disabled = false;

    createStoryBtn.textContent =
      originalText ||
      "Create My Story";
  }
}


// ===============================
// RENDER AI STORY
// ===============================

function renderAIStory() {
  const story =
    state.generatedStory;

  if (!story) {
    return;
  }

  if (storyTitle) {
    storyTitle.textContent =
      story.title ||
      "Our Story";
  }

  if (storySubtitle) {
    storySubtitle.textContent =
      story.subtitle ||
      "";
  }

  if (coverChildName) {
    coverChildName.textContent =
      state.child.name;
  }

  if (coverStoryType) {
    coverStoryType.textContent =
      state.story.type;
  }

  if (
    coverPhotoWrap &&
    state.photos.length > 0
  ) {
    coverPhotoWrap.innerHTML = `
      <img
        src="${state.photos[0].url}"
        alt="${escapeHtml(state.child.name)}"
      >
    `;
  }

  if (generatedPages) {
    generatedPages.innerHTML = "";

    if (story.dedication) {
      const dedication =
        document.createElement("div");

      dedication.className =
        "story-page";

      dedication.innerHTML = `
        <div class="story-page-content">

          <div class="story-page-label">
            A Special Dedication
          </div>

          <p class="story-text">
            ${escapeHtml(story.dedication)}
          </p>

        </div>
      `;

      generatedPages.appendChild(
        dedication
      );
    }

    const pages =
      Array.isArray(story.pages)
        ? story.pages
        : [];

    pages.forEach(function (page, index) {
      const pageElement =
        document.createElement("div");

      pageElement.className =
        "story-page";

      let photoIndex =
        typeof page.photoIndex === "number"
          ? page.photoIndex
          : index;

      let imageHTML = "";

      if (
        state.photos.length > 0 &&
        photoIndex >= 0 &&
        photoIndex < state.photos.length
      ) {
        imageHTML = `
          <div class="story-page-image">

            <img
              src="${state.photos[photoIndex].url}"
              alt="Memory ${photoIndex + 1}"
            >

          </div>
        `;
      }

      pageElement.innerHTML = `
        ${imageHTML}

        <div class="story-page-content">

          <div class="story-page-label">
            ${escapeHtml(
              page.heading ||
              "Chapter " + (index + 1)
            )}
          </div>

          <p class="story-text">
            ${escapeHtml(
              page.text ||
              ""
            )}
          </p>

        </div>
      `;

      generatedPages.appendChild(
        pageElement
      );
    });
  }

  if (endingText) {
    endingText.textContent =
      story.ending ||
      "And that was the beginning of another wonderful adventure for " +
      state.child.name +
      ".";
  }
}


// ===============================
// BUTTONS
// ===============================

function setupButtons() {

  if (continueToPhotos) {
    continueToPhotos.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        collectChildDetails();

        if (!state.child.name) {
          alert("Please enter the child's name.");
          return;
        }

        if (!state.child.age) {
          alert("Please enter the child's age.");
          return;
        }

        state.currentStep = 2;

        updateStepUI();
      }
    );
  }


  if (backToDetails) {
    backToDetails.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        state.currentStep = 1;

        updateStepUI();
      }
    );
  }


  if (createStoryBtn) {
    createStoryBtn.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        generateAIStory();
      }
    );
  }


  if (editStoryBtn) {
    editStoryBtn.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        state.currentStep = 1;

        updateStepUI();
      }
    );
  }


  if (startOverBtn) {
    startOverBtn.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        location.reload();
      }
    );
  }


  if (printStoryBtn) {
    printStoryBtn.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        window.print();
      }
    );
  }


  if (addMemoryBtn) {
    addMemoryBtn.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        if (photoInput) {
          photoInput.click();
        }
      }
    );
  }
}


// ===============================
// SECURITY / HTML ESCAPING
// ===============================

function escapeHtml(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
