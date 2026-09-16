/* =========================================================
   ONCE UPON MY CHILD
   Multi-Photo Story Builder V2
   ========================================================= */

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

  photos: []
};


/* =========================================================
   ELEMENTS
   ========================================================= */

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const progressBar = document.getElementById("progressBar");
const stepLabel = document.getElementById("stepLabel");

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


/* =========================================================
   STEP NAVIGATION
   ========================================================= */

function showStep(step) {

  state.currentStep = step;

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  if (step === 1) {
    step1.classList.add("active");
  }

  if (step === 2) {
    step2.classList.add("active");
  }

  if (step === 3) {
    step3.classList.add("active");
  }

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  progressBar.style.width = `${progress}%`;
  stepLabel.textContent = `Step ${step} of 3`;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   STORY TYPE
   ========================================================= */

document.querySelectorAll(".choice-card").forEach(card => {

  card.addEventListener("click", () => {

    document.querySelectorAll(".choice-card").forEach(item => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");

    state.story.type = card.dataset.value;
  });

});


/* =========================================================
   SAVE CHILD DETAILS
   ========================================================= */

function collectChildDetails() {

  state.child.name = childName.value.trim();
  state.child.age = childAge.value;
  state.child.personality = personality.value.trim();
  state.child.favorites = favorites.value.trim();

  state.story.setting = setting.value.trim();
  state.story.lesson = lesson.value.trim();

  state.story.length = storyLength.value;
  state.story.tone = storyTone.value;
}


/* =========================================================
   CONTINUE BUTTON
   ========================================================= */

document.getElementById("continueToPhotos")
  .addEventListener("click", () => {

    collectChildDetails();

    if (!state.child.name) {
      childName.focus();
      alert("Please enter your child's name first.");
      return;
    }

    if (!state.child.age) {
      childAge.focus();
      alert("Please choose your child's age.");
      return;
    }

    showStep(2);
  });


/* =========================================================
   BACK BUTTON
   ========================================================= */

document.getElementById("backToDetails")
  .addEventListener("click", () => {

    collectChildDetails();

    showStep(1);
  });


/* =========================================================
   PHOTO UPLOAD
   ========================================================= */

photoInput.addEventListener("change", event => {

  const files = Array.from(event.target.files);

  addPhotos(files);

  photoInput.value = "";
});


function addPhotos(files) {

  const imageFiles = files.filter(file =>
    file.type.startsWith("image/")
  );

  imageFiles.forEach(file => {

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


/* =========================================================
   DRAG & DROP
   ========================================================= */

["dragenter", "dragover"].forEach(eventName => {

  dropZone.addEventListener(eventName, event => {

    event.preventDefault();

    dropZone.classList.add("dragging");
  });

});


["dragleave", "drop"].forEach(eventName => {

  dropZone.addEventListener(eventName, event => {

    event.preventDefault();

    dropZone.classList.remove("dragging");
  });

});


dropZone.addEventListener("drop", event => {

  const files = Array.from(event.dataTransfer.files);

  addPhotos(files);
});


/* =========================================================
   RENDER PHOTO LIST
   ========================================================= */

function renderPhotos() {

  photoList.innerHTML = "";

  if (state.photos.length === 0) {

    photoCount.textContent = "0 photos";

    return;
  }

  photoCount.textContent =
    `${state.photos.length} photo${state.photos.length === 1 ? "" : "s"}`;


  state.photos.forEach((photo, index) => {

    const item = document.createElement("div");

    item.className = "photo-item";

    item.innerHTML = `

      <img
        src="${photo.url}"
        class="photo-thumb"
        alt="Memory ${index + 1}"
      >

      <div class="photo-info">

        <div class="photo-number">
          Memory ${index + 1}
        </div>

        <input
          type="text"
          class="memory-input"
          data-id="${photo.id}"
          value="${escapeHTML(photo.memory)}"
          placeholder="What happened in this photo?"
        >

      </div>

      <div class="photo-actions">

        <button
          class="icon-btn move-up"
          data-id="${photo.id}"
          title="Move photo earlier"
        >
          ↑
        </button>

        <button
          class="icon-btn move-down"
          data-id="${photo.id}"
          title="Move photo later"
        >
          ↓
        </button>

        <button
          class="icon-btn delete-photo"
          data-id="${photo.id}"
          title="Remove photo"
        >
          ×
        </button>

      </div>
    `;

    photoList.appendChild(item);
  });


  /* MEMORY INPUTS */

  document.querySelectorAll(".memory-input")
    .forEach(input => {

      input.addEventListener("input", event => {

        const id = Number(event.target.dataset.id);

        const photo = state.photos.find(
          item => Number(item.id) === id
        );

        if (photo) {
          photo.memory = event.target.value;
        }

      });

    });


  /* DELETE */

  document.querySelectorAll(".delete-photo")
    .forEach(button => {

      button.addEventListener("click", () => {

        const id = Number(button.dataset.id);

        const index = state.photos.findIndex(
          item => Number(item.id) === id
        );

        if (index !== -1) {

          URL.revokeObjectURL(state.photos[index].url);

          state.photos.splice(index, 1);

          renderPhotos();
        }

      });

    });


  /* MOVE UP */

  document.querySelectorAll(".move-up")
    .forEach(button => {

      button.addEventListener("click", () => {

        const id = Number(button.dataset.id);

        const index = state.photos.findIndex(
          item => Number(item.id) === id
        );

        if (index > 0) {

          [
            state.photos[index - 1],
            state.photos[index]
          ] = [
            state.photos[index],
            state.photos[index - 1]
          ];

          renderPhotos();
        }

      });

    });


  /* MOVE DOWN */

  document.querySelectorAll(".move-down")
    .forEach(button => {

      button.addEventListener("click", () => {

        const id = Number(button.dataset.id);

        const index = state.photos.findIndex(
          item => Number(item.id) === id
        );

        if (
          index !== -1 &&
          index < state.photos.length - 1
        ) {

          [
            state.photos[index],
            state.photos[index + 1]
          ] = [
            state.photos[index + 1],
            state.photos[index]
          ];

          renderPhotos();
        }

      });

    });

}


/* =========================================================
   ADD ANOTHER MEMORY
   ========================================================= */

document.getElementById("addMemoryBtn")
  .addEventListener("click", () => {

    photoInput.click();
  });


/* =========================================================
   CREATE STORY
   ========================================================= */

document.getElementById("createStoryBtn")
  .addEventListener("click", () => {

    collectChildDetails();

    if (state.photos.length === 0) {

      const proceed = confirm(
        "You haven't added any photos yet. " +
        "Would you like to create the story without photos?"
      );

      if (!proceed) {
        return;
      }
    }

    buildStory();

    showStep(3);
  });


/* =========================================================
   STORY GENERATION
   ========================================================= */

function buildStory() {

  const name = state.child.name;
  const age = state.child.age;

  document.getElementById("storyTitle").textContent =
    `${name}'s ${state.story.type}`;

  document.getElementById("storySubtitle").textContent =
    `A personalized story created from ${name}'s special memories.`;

  document.getElementById("coverChildName").textContent =
    name;

  document.getElementById("coverStoryType").textContent =
    state.story.type;


  /* COVER PHOTO */

  const coverPhotoWrap =
    document.getElementById("coverPhotoWrap");

  if (state.photos.length > 0) {

    coverPhotoWrap.innerHTML = `
      <img
        src="${state.photos[0].url}"
        alt="${escapeHTML(name)}"
      >
    `;

  } else {

    coverPhotoWrap.innerHTML = `
      <div class="cover-placeholder">
        📖
      </div>
    `;
  }


  /* STORY PAGES */

  const generatedPages =
    document.getElementById("generatedPages");

  generatedPages.innerHTML = "";


  if (state.photos.length === 0) {

    generatedPages.innerHTML = createNoPhotoPage();

  } else {

    state.photos.forEach((photo, index) => {

      generatedPages.insertAdjacentHTML(
        "beforeend",
        createMemoryPage(photo, index)
      );

    });

  }


  /* ENDING */

  const lessonText = state.story.lesson
    ? `Along the way, ${name} discovered something important: ${state.story.lesson}.`
    : `${name} discovered that the most wonderful adventures are often the ones made from ordinary moments with the people we love.`;

  document.getElementById("endingText").textContent =
    lessonText;
}


/* =========================================================
   MEMORY PAGE
   ========================================================= */

function createMemoryPage(photo, index) {

  const name = state.child.name;

  const memory = photo.memory.trim();

  const heading = getMemoryHeading(index);

  const paragraph = createStoryParagraph(
    name,
    memory,
    index
  );

  return `

    <article class="story-page memory-page">

      <img
        class="story-photo"
        src="${photo.url}"
        alt="${escapeHTML(name)} memory ${index + 1}"
      >

      <div class="story-text">

        <div class="story-page-number">
          Chapter ${index + 1}
        </div>

        <h2>
          ${heading}
        </h2>

        <p>
          ${paragraph}
        </p>

      </div>

    </article>

  `;
}


/* =========================================================
   STORY HEADINGS
   ========================================================= */

function getMemoryHeading(index) {

  const headings = [
    "The Adventure Begins",
    "A Moment to Remember",
    "Something Wonderful",
    "The Day Became Magical",
    "A Special Little Moment",
    "And Then Something Happened",
    "The Memory They Would Keep",
    "The Best Part of the Adventure"
  ];

  return headings[index % headings.length];
}


/* =========================================================
   STORY PARAGRAPHS
   ========================================================= */

function createStoryParagraph(name, memory, index) {

  const personality =
    state.child.personality ||
    "curious and wonderful";

  const favorites =
    state.child.favorites ||
    "all the little things that make them smile";

  const setting =
    state.story.setting ||
    "a place filled with possibilities";


  if (memory) {

    const templates = [

      `${name} was ${personality}, and on this particular day, an ordinary moment was about to become something worth remembering forever. ${memory} As ${name} looked around, there was a feeling that this was going to be one of those days that stayed in the heart for a very long time.`,

      `There are some memories that seem to sparkle a little brighter than the rest. ${memory} ${name} couldn't help but feel happy. It was the kind of moment that reminded everyone just how special the little things can be.`,

      `The adventure continued, and ${name} was right in the middle of it. ${memory} With a heart full of excitement and a mind full of wonder, ${name} discovered that even the smallest adventure could become a treasured memory.`,

      `${memory} For ${name}, it wasn't simply another day. It was a moment filled with laughter, discovery and the people who made everything feel special.`
    ];

    return templates[index % templates.length];
  }


  return `
    In ${setting}, ${name} discovered that adventures don't always
    begin with a map or a mysterious treasure.
    Sometimes they begin with curiosity, a happy heart,
    and ${favorites}.
    And with ${name}'s ${personality} spirit,
    there was no telling where the day might lead.
  `;
}


/* =========================================================
   NO PHOTO PAGE
   ========================================================= */

function createNoPhotoPage() {

  const name = state.child.name;

  return `

    <article class="story-page memory-page">

      <div
        style="
          min-height:760px;
          display:grid;
          place-items:center;
          background:#f0eaff;
          font-size:70px;
        "
      >
        ✨
      </div>

      <div class="story-text">

        <div class="story-page-number">
          Chapter 1
        </div>

        <h2>
          ${name}'s Adventure Begins
        </h2>

        <p>
          Once upon a time, there was a wonderful child named
          ${escapeHTML(name)}.
          Their story was only beginning, and somewhere beyond
          the next moment waited a brand-new adventure.
        </p>

      </div>

    </article>

  `;
}


/* =========================================================
   EDIT STORY
   ========================================================= */

document.getElementById("editStoryBtn")
  .addEventListener("click", () => {

    showStep(2);
  });


/* =========================================================
   START OVER
   ========================================================= */

document.getElementById("startOverBtn")
  .addEventListener("click", () => {

    const confirmed = confirm(
      "Start a new story? Your current story will be cleared."
    );

    if (!confirmed) {
      return;
    }

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

    state.photos.forEach(photo => {
      URL.revokeObjectURL(photo.url);
    });

    state.photos = [];

    childName.value = "";
    childAge.value = "";
    personality.value = "";
    favorites.value = "";
    setting.value = "";
    lesson.value = "";

    storyLength.value = "medium";
    storyTone.value = "warm";

    document.querySelectorAll(".choice-card")
      .forEach(card => card.classList.remove("selected"));

    document.querySelector(".choice-card")
      ?.classList.add("selected");

    renderPhotos();

    showStep(1);
  });


/* =========================================================
   PRINT
   ========================================================= */

document.getElementById("printStoryBtn")
  .addEventListener("click", () => {

    window.print();
  });


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   INITIALIZE
   ========================================================= */

renderPhotos();
showStep(1);
