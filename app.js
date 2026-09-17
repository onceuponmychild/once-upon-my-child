```javascript
"use strict";

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
    length: "Medium",
    tone: "Warm & loving"
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
  setupPhotoButtons();
  setupStoryActions();
  updateStep();

  console.log("Once Upon My Child initialized successfully.");
}


/* ADVENTURE CARDS */

function setupAdventureCards() {
  var cards = document.querySelectorAll("#storyTypeChoices .choice-card");

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      cards.forEach(function (item) {
        item.classList.remove("selected");
        item.setAttribute("aria-selected", "false");
      });

      card.classList.add("selected");
      card.setAttribute("aria-selected", "true");

      state.story.type =
        card.getAttribute("data-value") || "Magical Adventure";

      console.log("Adventure selected:", state.story.type);
    });
  });
}


/* NAVIGATION */

function setupNavigation() {
  var continueButton = document.getElementById("continueToPhotos");
  var backButton = document.getElementById("backToDetails");

  if (continueButton) {
    continueButton.addEventListener("click", function () {
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
    backButton.addEventListener("click", function () {
      goToStep(1);
    });
  }
}

function goToStep(step) {
  state.currentStep = step;
  updateStep();
}

function updateStep() {
  var screens = document.querySelectorAll(".screen");

  screens.forEach(function (screen) {
    screen.classList.remove("active");
  });

  var currentScreen =
    document.getElementById("step" + state.currentStep);

  if (currentScreen) {
    currentScreen.classList.add("active");
  }

  var stepLabel = document.getElementById("stepLabel");
  var progressBar = document.getElementById("progressBar");

  if (stepLabel) {
    stepLabel.textContent =
      "Step " + state.currentStep + " of 3";
  }

  if (progressBar) {
    var percentage =
      ((state.currentStep - 1) / 2) * 100;

    progressBar.style.width =
      percentage + "%";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* CHILD DETAILS */

function collectChildDetails() {
  var nameInput = document.getElementById("childName");
  var ageInput = document.getElementById("childAge");
  var personalityInput = document.getElementById("personality");
  var favoritesInput = document.getElementById("favorites");

  state.child.name =
    nameInput ? nameInput.value.trim() : "";

  state.child.age =
    ageInput ? ageInput.value : "";

  state.child.personality =
    personalityInput ? personalityInput.value.trim() : "";

  state.child.favorites =
    favoritesInput ? favoritesInput.value.trim() : "";

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


/* STORY PREFERENCES */

function collectStoryPreferences() {
  var settingInput = document.getElementById("setting");
  var lessonInput = document.getElementById("lesson");

  state.story.setting =
    settingInput ? settingInput.value.trim() : "";

  state.story.lesson =
    lessonInput ? lessonInput.value.trim() : "";

  if (!state.story.setting) {
    showMessage("Please enter a story setting.");
    return false;
  }

  if (!state.story.lesson) {
    showMessage("Please enter a special message.");
    return false;
  }

  return true;
}


/* STORY SETTINGS */

function setupStorySettings() {
  var lengthSelect = document.getElementById("storyLength");
  var toneSelect = document.getElementById("storyTone");

  if (lengthSelect) {
    lengthSelect.addEventListener("change", function () {
      var values = {
        short: "Short",
        medium: "Medium",
        long: "Long"
      };

      state.story.length =
        values[lengthSelect.value] || "Medium";
    });
  }

  if (toneSelect) {
    toneSelect.addEventListener("change", function () {
      var values = {
        warm: "Warm & loving",
        magical: "Magical & whimsical",
        funny: "Funny & playful",
        adventurous: "Exciting & adventurous",
        calm: "Gentle & peaceful"
      };

      state.story.tone =
        values[toneSelect.value] || "Warm & loving";
    });
  }
}


/* PHOTO UPLOAD */

function setupPhotoUpload() {
  var photoInput = document.getElementById("photoInput");
  var dropZone = document.getElementById("dropZone");

  if (!photoInput) {
    return;
  }

  photoInput.addEventListener("change", function (event) {
    var files = Array.from(event.target.files || []);

    addPhotos(files);

    photoInput.value = "";
  });

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

      var files =
        Array.from(event.dataTransfer.files || [])
          .filter(function (file) {
            return file.type.indexOf("image/") === 0;
          });

      addPhotos(files);
    });
  }
}

async function addPhotos(files) {
  if (!files.length) {
    return;
  }

  for (var i = 0; i < files.length; i++) {
    try {
      var compressed = await compressImage(files[i]);

      state.photos.push({
        image: compressed,
        name: files[i].name,
        memory: ""
      });
    } catch (error) {
      console.error("Could not process image:", error);
    }
  }

  renderPhotos();
}


/* IMAGE COMPRESSION */

function compressImage(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();

    reader.onload = function (event) {
      var image = new Image();

      image.onload = function () {
        var maxSize = 1600;

        var width = image.width;
        var height = image.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round(height * maxSize / width);
            width = maxSize;
          } else {
            width = Math.round(width * maxSize / height);
            height = maxSize;
          }
        }

        var canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        var context = canvas.getContext("2d");

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

      image.onerror = function () {
        reject(new Error("Unable to read image."));
      };

      image.src = event.target.result;
    };

    reader.onerror = function () {
      reject(new Error("Unable to read file."));
    };

    reader.readAsDataURL(file);
  });
}


/* PHOTO DISPLAY */

function renderPhotos() {
  var list = document.getElementById("photoList");
  var count = document.getElementById("photoCount");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (count) {
    count.textContent =
      state.photos.length +
      (state.photos.length === 1 ? " photo" : " photos");
  }

  state.photos.forEach(function (photo, index) {
    var card = document.createElement("div");

    card.className = "photo-item";

    var preview = document.createElement("div");
    preview.className = "photo-preview";

    var image = document.createElement("img");
    image.src = photo.image;
    image.alt = "Memory photo " + (index + 1);

    preview.appendChild(image);

    var details = document.createElement("div");
    details.className = "photo-details";

    var number = document.createElement("div");
    number.className = "photo-number";
    number.textContent = "Memory " + (index + 1);

    var textarea = document.createElement("textarea");
    textarea.className = "memory-input";
    textarea.setAttribute("data-index", index);
    textarea.rows = 4;
    textarea.placeholder =
      "Tell us what happened in this photo...";
    textarea.value = photo.memory || "";

    textarea.addEventListener("input", function () {
      state.photos[index].memory =
        textarea.value;
    });

    var controls = document.createElement("div");
    controls.className = "photo-controls";

    var up = document.createElement("button");
    up.type = "button";
    up.className = "photo-control";
    up.setAttribute("data-action", "up");
    up.setAttribute("data-index", index);
    up.textContent = "↑";
    up.disabled = index === 0;

    var down = document.createElement("button");
    down.type = "button";
    down.className = "photo-control";
    down.setAttribute("data-action", "down");
    down.setAttribute("data-index", index);
    down.textContent = "↓";
    down.disabled = index === state.photos.length - 1;

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "photo-control delete";
    remove.setAttribute("data-action", "delete");
    remove.setAttribute("data-index", index);
    remove.textContent = "Remove";

    controls.appendChild(up);
    controls.appendChild(down);
    controls.appendChild(remove);

    details.appendChild(number);
    details.appendChild(textarea);
    details.appendChild(controls);

    card.appendChild(preview);
    card.appendChild(details);

    list.appendChild(card);
  });
}


/* PHOTO CONTROLS */

function setupPhotoButtons() {
  var list = document.getElementById("photoList");

  if (!list) {
    return;
  }

  list.addEventListener("click", function (event) {
    var button =
      event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    var action =
      button.getAttribute("data-action");

    var index =
      Number(button.getAttribute("data-index"));

    if (Number.isNaN(index)) {
      return;
    }

    if (action === "delete") {
      state.photos.splice(index, 1);
      renderPhotos();
      return;
    }

    if (action === "up" && index > 0) {
      var previous = state.photos[index - 1];

      state.photos[index - 1] =
        state.photos[index];

      state.photos[index] =
        previous;

      renderPhotos();
      return;
    }

    if (
      action === "down" &&
      index < state.photos.length - 1
    ) {
      var next = state.photos[index + 1];

      state.photos[index + 1] =
        state.photos[index];

      state.photos[index] =
        next;

      renderPhotos();
    }
  });
}


/* STORY ACTIONS */

function setupStoryActions() {
  var addMemoryButton =
    document.getElementById("addMemoryBtn");

  var createStoryButton =
    document.getElementById("createStoryBtn");

  var editStoryButton =
    document.getElementById("editStoryBtn");

  var startOverButton =
    document.getElementById("startOverBtn");

  var printButton =
    document.getElementById("printStoryBtn");

  if (addMemoryButton) {
    addMemoryButton.addEventListener("click", function () {
      var input =
        document.getElementById("photoInput");

      if (input) {
        input.click();
      }
    });
  }

  if (createStoryButton) {
    createStoryButton.addEventListener(
      "click",
      generateAIStory
    );
  }

  if (editStoryButton) {
    editStoryButton.addEventListener("click", function () {
      goToStep(1);
    });
  }

  if (startOverButton) {
    startOverButton.addEventListener(
      "click",
      startOver
    );
  }

  if (printButton) {
    printButton.addEventListener("click", function () {
      window.print();
    });
  }
}


/* AI STORY */

async function generateAIStory() {
  if (!state.photos.length) {
    showMessage(
      "Please add at least one photo before creating the story."
    );
    return;
  }

  var button =
    document.getElementById("createStoryBtn");

  var originalText =
    button ? button.innerHTML : "";

  if (button) {
    button.disabled = true;
    button.innerHTML =
      "Creating their story... ✨";
  }

  try {
    var response =
      await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          child: state.child,
          story: state.story,
          memories: state.photos
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
      button.innerHTML = originalText;
    }
  }
}


/* RENDER STORY */

function renderGeneratedStory() {
  var story = state.generatedStory;

  if (!story) {
    return;
  }

  var title =
    document.getElementById("storyTitle");

  var subtitle =
    document.getElementById("storySubtitle");

  var coverChildName =
    document.getElementById("coverChildName");

  var coverStoryType =
    document.getElementById("coverStoryType");

  var endingText =
    document.getElementById("endingText");

  var generatedPages =
    document.getElementById("generatedPages");

  var coverPhotoWrap =
    document.getElementById("coverPhotoWrap");

  if (title) {
    title.textContent =
      story.title || "Once Upon a Time...";
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
    coverPhotoWrap.innerHTML = "";

    if (state.photos.length) {
      var coverImage =
        document.createElement("img");

      coverImage.src =
        state.photos[0].image;

      coverImage.alt =
        "Cover memory";

      coverPhotoWrap.appendChild(
        coverImage
      );

    } else {
      var placeholder =
        document.createElement("div");

      placeholder.className =
        "cover-placeholder";

      placeholder.textContent =
        "📖";

      coverPhotoWrap.appendChild(
        placeholder
      );
    }
  }

  if (!generatedPages) {
    return;
  }

  generatedPages.innerHTML = "";

  var pages =
    Array.isArray(story.pages)
      ? story.pages
      : [];

  pages.forEach(function (page, index) {
    var article =
      document.createElement("article");

    article.className =
      "story-page";

    var photoIndex =
      Number.isInteger(page.photoIndex)
        ? page.photoIndex
        : index;

    if (
      state.photos[photoIndex] &&
      state.photos[photoIndex].image
    ) {
      var photoWrap =
        document.createElement("div");

      photoWrap.className =
        "story-photo-wrap";

      var pageImage =
        document.createElement("img");

      pageImage.src =
        state.photos[photoIndex].image;

      pageImage.alt =
        "Story memory " + (index + 1);

      photoWrap.appendChild(pageImage);
      article.appendChild(photoWrap);
    }

    var content =
      document.createElement("div");

    content.className =
      "story-page-content";

    var number =
      document.createElement("div");

    number.className =
      "story-page-number";

    number.textContent =
      index + 1;

    var heading =
      document.createElement("h2");

    heading.textContent =
      page.heading || "";

    var text =
      document.createElement("p");

    text.textContent =
      page.text || "";

    content.appendChild(number);
    content.appendChild(heading);
    content.appendChild(text);

    article.appendChild(content);

    generatedPages.appendChild(article);
  });
}


/* START OVER */

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

  var fields = [
    "childName",
    "personality",
    "favorites",
    "setting",
    "lesson"
  ];

  fields.forEach(function (id) {
    var element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }
  });

  var age =
    document.getElementById("childAge");

  if (age) {
    age.value = "";
  }

  var length =
    document.getElementById("storyLength");

  if (length) {
    length.value = "medium";
  }

  var tone =
    document.getElementById("storyTone");

  if (tone) {
    tone.value = "warm";
  }

  var cards =
    document.querySelectorAll(
      "#storyTypeChoices .choice-card"
    );

  cards.forEach(function (card) {
    var selected =
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


/* MESSAGE */

function showMessage(message) {
  var box =
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

  clearTimeout(showMessage.timeout);

  showMessage.timeout =
    setTimeout(function () {
      if (box) {
        box.remove();
      }
    }, 4000);
}
```
