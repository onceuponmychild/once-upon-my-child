var state = {
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
    length: "",
    tone: ""
  },

  memories: "",

  photos: [],

  generatedStory: null
};


/* =========================
   GENERAL HELPERS
========================= */

function getElement(id) {
  return document.getElementById(id);
}

function getValue(ids) {
  for (var i = 0; i < ids.length; i++) {
    var element = document.getElementById(ids[i]);

    if (element) {
      return element.value || "";
    }
  }

  return "";
}

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================
   STEP NAVIGATION
========================= */

function showStep(step) {
  state.currentStep = step;

  var steps = document.querySelectorAll(".step");

  steps.forEach(function(item) {
    item.classList.remove("active");
  });

  var activeStep = document.querySelector(
    '.step[data-step="' + step + '"]'
  );

  if (activeStep) {
    activeStep.classList.add("active");
  }

  var progress = document.getElementById("progress");

  if (progress) {
    progress.style.width =
      ((step - 1) / 2) * 100 + "%";
  }

  window.scrollTo(0, 0);
}


function nextStep() {
  if (state.currentStep === 1) {
    collectChildInformation();

    if (!state.child.name) {
      alert("Please enter your child's name.");
      return;
    }

    if (!state.story.type) {
      alert("Please choose an adventure type.");
      return;
    }
  }

  if (state.currentStep === 2) {
    collectPhotoInformation();

    if (state.photos.length === 0) {
      alert("Please add at least one photo.");
      return;
    }
  }

  if (state.currentStep < 3) {
    showStep(state.currentStep + 1);
  }
}


function previousStep() {
  if (state.currentStep > 1) {
    showStep(state.currentStep - 1);
  }
}


/* =========================
   ADVENTURE CARDS
========================= */

function setupAdventureCards() {
  var container =
    document.getElementById("storyTypeChoices");

  if (!container) {
    console.log("Adventure container not found");
    return;
  }

  var cards = container.querySelectorAll(
    "[data-value]"
  );

  cards.forEach(function(card) {

    card.addEventListener("click", function() {

      cards.forEach(function(item) {
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

  });

  console.log("Adventure cards ready");
}


/* =========================
   STORY OPTIONS
========================= */

function setupOptionGroups() {

  var optionGroups =
    document.querySelectorAll(
      "[data-story-option]"
    );

  optionGroups.forEach(function(group) {

    var options =
      group.querySelectorAll(
        "[data-value]"
      );

    options.forEach(function(option) {

      option.addEventListener(
        "click",
        function() {

          options.forEach(function(item) {
            item.classList.remove(
              "selected"
            );

            item.setAttribute(
              "aria-selected",
              "false"
            );
          });

          option.classList.add(
            "selected"
          );

          option.setAttribute(
            "aria-selected",
            "true"
          );

          var value =
            option.getAttribute(
              "data-value"
            );

          var optionName =
            group.getAttribute(
              "data-story-option"
            );

          if (optionName && value) {

            if (
              Object.prototype.hasOwnProperty.call(
                state.story,
                optionName
              )
            ) {
              state.story[optionName] =
                value;
            }

          }

        }
      );

    });

  });
}


/* =========================
   CHILD INFORMATION
========================= */

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

  state.story.setting = getValue([
    "storySetting",
    "setting"
  ]);

  state.story.lesson = getValue([
    "storyLesson",
    "lesson"
  ]);

  state.story.length = getValue([
    "storyLength",
    "length"
  ]);

  state.story.tone = getValue([
    "storyTone",
    "tone"
  ]);
}


/* =========================
   PHOTO UPLOADS
========================= */

function setupPhotoUpload() {

  var input =
    document.getElementById("photoInput");

  var uploadArea =
    document.getElementById("uploadArea");

  var addPhotoButton =
    document.getElementById("addPhotoButton");

  if (addPhotoButton && input) {

    addPhotoButton.addEventListener(
      "click",
      function() {
        input.click();
      }
    );

  }

  if (uploadArea && input) {

    uploadArea.addEventListener(
      "click",
      function(event) {

        if (
          event.target === uploadArea ||
          event.target.closest(".upload-content")
        ) {
          input.click();
        }

      }
    );

  }

  if (input) {

    input.addEventListener(
      "change",
      function(event) {

        var files =
          Array.from(
            event.target.files || []
          );

        addPhotos(files);

        input.value = "";

      }
    );

  }

  if (uploadArea) {

    uploadArea.addEventListener(
      "dragover",
      function(event) {

        event.preventDefault();

        uploadArea.classList.add(
          "dragging"
        );

      }
    );

    uploadArea.addEventListener(
      "dragleave",
      function() {

        uploadArea.classList.remove(
          "dragging"
        );

      }
    );

    uploadArea.addEventListener(
      "drop",
      function(event) {

        event.preventDefault();

        uploadArea.classList.remove(
          "dragging"
        );

        var files =
          Array.from(
            event.dataTransfer.files || []
          );

        addPhotos(files);

      }
    );

  }
}


function addPhotos(files) {

  files.forEach(function(file) {

    if (!file.type.startsWith("image/")) {
      return;
    }

    var photo = {
      id:
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2),

      file: file,

      url:
        URL.createObjectURL(file),

      memory: "",

      description: ""
    };

    state.photos.push(photo);

  });

  renderPhotos();
}


function removePhoto(id) {

  var photo =
    state.photos.find(function(item) {
      return item.id === id;
    });

  if (photo && photo.url) {
    URL.revokeObjectURL(
      photo.url
    );
  }

  state.photos =
    state.photos.filter(function(item) {
      return item.id !== id;
    });

  renderPhotos();
}


function movePhoto(id, direction) {

  var index =
    state.photos.findIndex(
      function(item) {
        return item.id === id;
      }
    );

  if (index === -1) {
    return;
  }

  var newIndex =
    index + direction;

  if (
    newIndex < 0 ||
    newIndex >= state.photos.length
  ) {
    return;
  }

  var temp =
    state.photos[index];

  state.photos[index] =
    state.photos[newIndex];

  state.photos[newIndex] =
    temp;

  renderPhotos();
}


/* =========================
   PHOTO RENDERING
========================= */

function renderPhotos() {

  var container =
    document.getElementById(
      "photoPreview"
    );

  if (!container) {
    container =
      document.getElementById(
        "photoGrid"
      );
  }

  if (!container) {
    return;
  }

  container.innerHTML = "";

  state.photos.forEach(
    function(photo, index) {

      var wrapper =
        document.createElement(
          "div"
        );

      wrapper.className =
        "photo-card";

      wrapper.setAttribute(
        "data-photo-id",
        photo.id
      );

      wrapper.innerHTML =
        '<div class="photo-image-wrap">' +

          '<img src="' +
          escapeHtml(photo.url) +
          '" alt="Story photo ' +
          (index + 1) +
          '">' +

          '<button type="button" ' +
          'class="remove-photo" ' +
          'data-remove-photo="' +
          escapeHtml(photo.id) +
          '">' +
          "×" +
          "</button>" +

        "</div>" +

        '<div class="photo-card-body">' +

          '<div class="photo-number">' +
          "Photo " +
          (index + 1) +
          "</div>" +

          '<textarea ' +
          'class="photo-memory" ' +
          'data-photo-memory="' +
          escapeHtml(photo.id) +
          '" ' +
          'placeholder="What is happening in this photo? Add a memory, place, people, or special moment...">' +
          escapeHtml(
            photo.memory || ""
          ) +
          "</textarea>" +

          '<div class="photo-actions">' +

            '<button type="button" ' +
            'data-move-photo="' +
            escapeHtml(photo.id) +
            '" data-direction="-1">' +
            "←" +
            "</button>" +

            '<button type="button" ' +
            'data-move-photo="' +
            escapeHtml(photo.id) +
            '" data-direction="1">' +
            "→" +
            "</button>" +

          "</div>" +

        "</div>";

      container.appendChild(
        wrapper
      );

    }
  );

  setupPhotoControls();
}


function setupPhotoControls() {

  var removeButtons =
    document.querySelectorAll(
      "[data-remove-photo]"
    );

  removeButtons.forEach(
    function(button) {

      button.addEventListener(
        "click",
        function() {

          removePhoto(
            button.getAttribute(
              "data-remove-photo"
            )
          );

        }
      );

    }
  );


  var moveButtons =
    document.querySelectorAll(
      "[data-move-photo]"
    );

  moveButtons.forEach(
    function(button) {

      button.addEventListener(
        "click",
        function() {

          var id =
            button.getAttribute(
              "data-move-photo"
            );

          var direction =
            parseInt(
              button.getAttribute(
                "data-direction"
              ),
              10
            );

          movePhoto(
            id,
            direction
          );

        }
      );

    }
  );


  var memoryInputs =
    document.querySelectorAll(
      "[data-photo-memory]"
    );

  memoryInputs.forEach(
    function(input) {

      input.addEventListener(
        "input",
        function() {

          var id =
            input.getAttribute(
              "data-photo-memory"
            );

          var photo =
            state.photos.find(
              function(item) {
                return item.id === id;
              }
            );

          if (photo) {
            photo.memory =
              input.value;
          }

        }
      );

    }
  );

}


/* =========================
   COLLECT PHOTO DATA
========================= */

function collectPhotoInformation() {

  var memoryInputs =
    document.querySelectorAll(
      "[data-photo-memory]"
    );

  memoryInputs.forEach(
    function(input) {

      var id =
        input.getAttribute(
          "data-photo-memory"
        );

      var photo =
        state.photos.find(
          function(item) {
            return item.id === id;
          }
        );

      if (photo) {
        photo.memory =
          input.value;
      }

    }
  );
}


/* =========================
   GENERATE STORY
========================= */

async function generateStory() {

  collectChildInformation();
  collectPhotoInformation();

  if (!state.child.name) {
    alert(
      "Please enter your child's name."
    );

    showStep(1);

    return;
  }

  if (!state.story.type) {
    alert(
      "Please choose an adventure."
    );

    showStep(1);

    return;
  }

  if (state.photos.length === 0) {
    alert(
      "Please add at least one photo."
    );

    showStep(2);

    return;
  }


  var button =
    document.getElementById(
      "generateStoryButton"
    );

  if (button) {
    button.disabled = true;
    button.textContent =
      "Creating your story...";
  }


  var memories =
    state.photos.map(
      function(photo, index) {

        return {
          order: index + 1,
          memory:
            photo.memory || "",
          description:
            photo.description || ""
        };

      }
    );


  var payload = {
    child: state.child,

    story: state.story,

    memories: {
      general:
        state.memories,

      photos:
        memories
    }
  };


  try {

    var response =
      await fetch(
        "/api/generate-story",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(payload)
        }
      );


    if (!response.ok) {

      var errorText =
        await response.text();

      throw new Error(
        errorText ||
        "Story generation failed."
      );

    }


    var result =
      await response.json();

    state.generatedStory =
      result;


    renderStory(
      result
    );

    showStep(3);

  } catch (error) {

    console.error(
      "Story generation error:",
      error
    );

    alert(
      "We couldn't create the story yet. Please try again."
    );

  } finally {

    if (button) {
      button.disabled = false;
      button.textContent =
        "Create My Story";
    }

  }

}


/* =========================
   STORY PREVIEW
========================= */

function renderStory(result) {

  var container =
    document.getElementById(
      "storyResult"
    );

  if (!container) {
    container =
      document.getElementById(
        "storyPreview"
      );
  }

  if (!container) {
    return;
  }


  var story =
    result.story ||
    result;


  var title =
    story.title ||
    "Our Adventure";


  var pages =
    story.pages ||
    [];


  var ending =
    story.ending ||
    "";


  var html =
    '<div class="storybook">' +

      '<div class="storybook-cover">' +

        "<h1>" +
        escapeHtml(title) +
        "</h1>" +

        "<p>" +
        escapeHtml(
          state.child.name
        ) +
        "'s Adventure" +
        "</p>" +

      "</div>";


  pages.forEach(
    function(page, index) {

      var pagePhoto =
        state.photos[index];


      html +=
        '<div class="story-page">' +

          '<div class="story-page-image">';


      if (pagePhoto) {

        html +=
          '<img src="' +
          escapeHtml(
            pagePhoto.url
          ) +
          '" alt="Story page ' +
          (index + 1) +
          '">';

      }


      html +=
          "</div>" +

          '<div class="story-page-text">' +

            "<h2>" +
            escapeHtml(
              page.title ||
              "Adventure " +
              (index + 1)
            ) +
            "</h2>" +

            "<p>" +
            escapeHtml(
              page.text ||
              page.content ||
              ""
            ) +
            "</p>" +

          "</div>" +

        "</div>";

    }
  );


  if (ending) {

    html +=
      '<div class="storybook-ending">' +

        "<h2>The End</h2>" +

        "<p>" +
        escapeHtml(ending) +
        "</p>" +

      "</div>";

  }


  html +=
    "</div>";


  container.innerHTML =
    html;
}


/* =========================
   BUTTON SETUP
========================= */

function setupButtons() {

  var nextButtons =
    document.querySelectorAll(
      "[data-next]"
    );

  nextButtons.forEach(
    function(button) {

      button.addEventListener(
        "click",
        function(event) {

          event.preventDefault();

          nextStep();

        }
      );

    }
  );


  var backButtons =
    document.querySelectorAll(
      "[data-back]"
    );

  backButtons.forEach(
    function(button) {

      button.addEventListener(
        "click",
        function(event) {

          event.preventDefault();

          previousStep();

        }
      );

    }
  );


  var generateButton =
    document.getElementById(
      "generateStoryButton"
    );

  if (generateButton) {

    generateButton.addEventListener(
      "click",
      function(event) {

        event.preventDefault();

        generateStory();

      }
    );

  }


  var startOverButton =
    document.getElementById(
      "startOverButton"
    );

  if (startOverButton) {

    startOverButton.addEventListener(
      "click",
      function() {

        resetStory();

      }
    );

  }


  var editButton =
    document.getElementById(
      "editStoryButton"
    );

  if (editButton) {

    editButton.addEventListener(
      "click",
      function() {

        showStep(1);

      }
    );

  }


  var printButton =
    document.getElementById(
      "printStoryButton"
    );

  if (printButton) {

    printButton.addEventListener(
      "click",
      function() {

        window.print();

      }
    );

  }

}


/* =========================
   RESET
========================= */

function resetStory() {

  state.currentStep = 1;

  state.child = {
    name: "",
    age: "",
    personality: "",
    favorites: ""
  };

  state.story = {
    type: "",
    setting: "",
    lesson: "",
    length: "",
    tone: ""
  };

  state.memories = "";

  state.photos.forEach(
    function(photo) {

      if (photo.url) {
        URL.revokeObjectURL(
          photo.url
        );
      }

    }
  );

  state.photos = [];

  state.generatedStory =
    null;


  var forms =
    document.querySelectorAll(
      "input, textarea"
    );

  forms.forEach(
    function(input) {

      if (
        input.type === "file"
      ) {
        input.value = "";
      } else {
        input.value = "";
      }

    }
  );


  var selected =
    document.querySelectorAll(
      ".selected"
    );

  selected.forEach(
    function(item) {

      item.classList.remove(
        "selected"
      );

      item.setAttribute(
        "aria-selected",
        "false"
      );

    }
  );


  var photoPreview =
    document.getElementById(
      "photoPreview"
    );

  if (photoPreview) {
    photoPreview.innerHTML = "";
  }


  var photoGrid =
    document.getElementById(
      "photoGrid"
    );

  if (photoGrid) {
    photoGrid.innerHTML = "";
  }


  var storyResult =
    document.getElementById(
      "storyResult"
    );

  if (storyResult) {
    storyResult.innerHTML = "";
  }


  var storyPreview =
    document.getElementById(
      "storyPreview"
    );

  if (storyPreview) {
    storyPreview.innerHTML = "";
  }


  showStep(1);
}


/* =========================
   INITIALIZATION
========================= */

function initApp() {

  console.log(
    "Onceuponmychild app initializing..."
  );

  setupAdventureCards();

  setupOptionGroups();

  setupPhotoUpload();

  setupButtons();

  showStep(1);

  console.log(
    "Onceuponmychild app ready"
  );
}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initApp
  );

} else {

  initApp();

}
