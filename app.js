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
// INITIAL SETUP
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  setupChoiceCards();
  setupPhotoUpload();
  updateStepUI();
});


// ===============================
// CHOICE CARDS
// ===============================

function setupChoiceCards() {
  const cards = document.querySelectorAll(".choice-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {

      const group = card.parentElement;

      group.querySelectorAll(".choice-card").forEach(c => {
        c.classList.remove("selected");
      });

      card.classList.add("selected");

      const value = card.dataset.value || card.textContent.trim();

      if (group.dataset.choice === "story-type") {
        state.story.type = value;
      }

      if (group.dataset.choice === "setting") {
        state.story.setting = value;
      }

      if (group.dataset.choice === "length") {
        state.story.length = value;
      }

      if (group.dataset.choice === "tone") {
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
    if (!step) return;

    step.classList.toggle(
      "active",
      index + 1 === state.currentStep
    );
  });

  if (progressBar) {
    progressBar.style.width =
      `${(state.currentStep / 3) * 100}%`;
  }

  if (stepLabel) {
    stepLabel.textContent =
      `Step ${state.currentStep} of 3`;
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

  state.child.name = childName?.value.trim() || "";
  state.child.age = childAge?.value.trim() || "";
  state.child.personality = personality?.value.trim() || "";
  state.child.favorites = favorites?.value.trim() || "";

  state.story.setting = setting?.value.trim() || state.story.setting;
  state.story.lesson = lesson?.value.trim() || "";

  if (storyLength) {
    state.story.length = storyLength.value || state.story.length;
  }

  if (storyTone) {
    state.story.tone = storyTone.value || state.story.tone;
  }
}


// ===============================
// PHOTO UPLOAD
// ===============================

function setupPhotoUpload() {

  if (photoInput) {
    photoInput.addEventListener("change", event => {
      addPhotos(event.target.files);
    });
  }

  if (dropZone) {

    dropZone.addEventListener("dragover", event => {
      event.preventDefault();
      dropZone.classList.add("dragging");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragging");
    });

    dropZone.addEventListener("drop", event => {
      event.preventDefault();

      dropZone.classList.remove("dragging");

      addPhotos(event.dataTransfer.files);
    });
  }
}


function addPhotos(files) {

  Array.from(files).forEach(file => {

    if (!file.type.startsWith("image/")) return;

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


function renderPhotos() {

  if (!photoList) return;

  photoList.innerHTML = "";

  state.photos.forEach((photo, index) => {

    const item = document.createElement("div");

    item.className = "photo-item";

    item.innerHTML = `
      <div class="photo-preview">
        <img src="${photo.url}" alt="Photo ${index + 1}">
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

  document.querySelectorAll(".memory-input").forEach(input => {

    input.addEventListener("input", event => {

      const id = Number(event.target.dataset.photoId);

      const photo = state.photos.find(
        p => Number(p.id) === id
      );

      if (photo) {
        photo.memory = event.target.value;
      }
    });

  });

  document.querySelectorAll(".photo-delete").forEach(button => {

    button.addEventListener("click", () => {

      const id = Number(button.dataset.id);

      const index = state.photos.findIndex(
        p => Number(p.id) === id
      );

      if (index !== -1) {

        URL.revokeObjectURL(state.photos[index].url);

        state.photos.splice(index, 1);

        renderPhotos();
      }

    });

  });

  document.querySelectorAll(".photo-up").forEach(button => {

    button.addEventListener("click", () => {

      movePhoto(Number(button.dataset.id), -1);
    });

  });

  document.querySelectorAll(".photo-down").forEach(button => {

    button.addEventListener("click", () => {

      movePhoto(Number(button.dataset.id), 1);
    });

  });

  if (photoCount) {
    photoCount.textContent =
      `${state.photos.length} photo${state.photos.length === 1 ? "" : "s"}`;
  }
}


function movePhoto(id, direction) {

  const index = state.photos.findIndex(
    p => Number(p.id) === id
  );

  if (index === -1) return;

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

  state.photos[newIndex] = temp;

  renderPhotos();
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

  const originalText =
    createStoryBtn.textContent;

  createStoryBtn.disabled = true;

  createStoryBtn.textContent =
    "✨ Creating your story...";

  try {

    const requestData = {

      child: state.child,

      story: state.story,

      memories: state.photos.map((photo, index) => ({
        index: index,
        memory: photo.memory || "",
        fileName: photo.file?.name || ""
      }))

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


    const data = await response.json();


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


    state.generatedStory = data.story;

    renderAIStory();

    state.currentStep = 3;

    updateStepUI();

  }

  catch (error) {

    console.error("AI STORY ERROR:", error);

    alert(
      "We couldn't create the story yet.\n\n" +
      error.message
    );

  }

  finally {

    createStoryBtn.disabled = false;

    createStoryBtn.textContent =
      originalText || "Create My Story";

  }
}


// ===============================
// RENDER AI STORY
// ===============================

function renderAIStory() {

  const story = state.generatedStory;

  if (!story) return;


  // TITLE

  if (storyTitle) {
    storyTitle.textContent =
      story.title || "Our Story";
  }


  if (storySubtitle) {
    storySubtitle.textContent =
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


  // COVER PHOTO

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


  // STORY PAGES

  if (generatedPages) {

    generatedPages.innerHTML = "";


    // Dedication

    if (story.dedication) {

      const dedication =
        document.createElement("div");

      dedication.className = "story-page";

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

      generatedPages.appendChild(dedication);
    }


    // AI pages

    (story.pages || []).forEach(
      (page, index) => {

        const pageElement =
          document.createElement("div");

        pageElement.className =
          "story-page";


        let imageHTML = "";

        let photoIndex =
          typeof page.photoIndex === "number"
            ? page.photoIndex
            : index;


        if (
          state.photos.length > 0 &&
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
                `Chapter ${index + 1}`
              )}
            </div>

            <p class="story-text">
              ${escapeHtml(
                page.text || ""
              )}
            </p>

          </div>

        `;

        generatedPages.appendChild(
          pageElement
        );
      }
    );

  }


  // ENDING

  if (endingText) {

    endingText.textContent =
      story.ending ||
      `And that was the beginning of another wonderful adventure for ${state.child.name}.`;
  }
}


// ===============================
// BUTTONS
// ===============================

if (continueToPhotos) {

  continueToPhotos.addEventListener(
    "click",
    () => {

      collectChildDetails();

      state.currentStep = 2;

      updateStepUI();
    }
  );

}


if (backToDetails) {

  backToDetails.addEventListener(
    "click",
    () => {

      state.currentStep = 1;

      updateStepUI();
    }
  );

}


if (createStoryBtn) {

  createStoryBtn.addEventListener(
    "click",
    generateAIStory
  );

}


if (editStoryBtn) {

  editStoryBtn.addEventListener(
    "click",
    () => {

      state.currentStep = 1;

      updateStepUI();
    }
  );

}


if (startOverBtn) {

  startOverBtn.addEventListener(
    "click",
    () => {

      location.reload();

    }
  );

}


if (printStoryBtn) {

  printStoryBtn.addEventListener(
    "click",
    () => {

      window.print();

    }
  );

}


// ===============================
// ADD MEMORY BUTTON
// ===============================

if (addMemoryBtn) {

  addMemoryBtn.addEventListener(
    "click",
    () => {

      if (photoInput) {
        photoInput.click();
      }

    }
  );

}


// ===============================
// SECURITY / HTML ESCAPING
// ===============================

function escapeHtml(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
