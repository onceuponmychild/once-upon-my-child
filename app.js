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

  memories: "",

  photos: [],

  generatedStory: null
};


/* =========================================
   BASIC HELPERS
========================================= */

function getElement(id) {
  return document.getElementById(id);
}


function getValue(id) {
  var element = document.getElementById(id);

  if (!element) {
    return "";
  }

  return element.value || "";
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


/* =========================================
   STEP NAVIGATION
========================================= */

function showStep(step) {

  state.currentStep = step;

  var screens = document.querySelectorAll(
    ".screen"
  );

  screens.forEach(function(screen) {
    screen.classList.remove("active");
  });


  var target = document.getElementById(
    "step" + step
  );

  if (target) {
    target.classList.add("active");
  }


  var stepLabel = document.getElementById(
    "stepLabel"
  );

  if (stepLabel) {
    stepLabel.textContent =
      "Step " + step + " of 3";
  }


  var progressBar = document.getElementById(
    "progressBar"
  );

  if (progressBar) {

    if (step === 1) {
      progressBar.style.width = "0%";
    }

    if (step === 2) {
      progressBar.style.width = "50%";
    }

    if (step === 3) {
      progressBar.style.width = "100%";
    }
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================
   COLLECT CHILD INFORMATION
========================================= */

function collectChildInformation() {

  state.child.name =
    getValue("childName");

  state.child.age =
    getValue("childAge");

  state.child.personality =
    getValue("personality");

  state.child.favorites =
    getValue("favorites");

  state.story.setting =
    getValue("setting");

  state.story.lesson =
    getValue("lesson");

  state.story.length =
    getValue("storyLength") ||
    "medium";

  state.story.tone =
    getValue("storyTone") ||
    "warm";
}


/* =========================================
   ADVENTURE CARDS
========================================= */

function setupAdventureCards() {

  var container =
    document.getElementById(
      "storyTypeChoices"
    );

  if (!container) {
    console.log(
      "Adventure container not found"
    );

    return;
  }


  var cards =
    container.querySelectorAll(
      ".choice-card"
    );


  cards.forEach(function(card) {

    card.addEventListener(
      "click",
      function() {

        cards.forEach(function(item) {

          item.classList.remove(
            "selected"
          );

          item.setAttribute(
            "aria-selected",
            "false"
          );

        });


        card.classList.add(
          "selected"
        );


        card.setAttribute(
          "aria-selected",
          "true"
        );


        var selectedType =
          card.getAttribute(
            "data-value"
          );


        if (selectedType) {

          state.story.type =
            selectedType;

        }


        console.log(
          "Adventure selected:",
          state.story.type
        );

      }
    );

  });


  console.log(
    "Adventure cards ready"
  );
}


/* =========================================
   PHOTO UPLOAD
========================================= */

function setupPhotoUpload() {

  var input =
    document.getElementById(
      "photoInput"
    );


  var dropZone =
    document.getElementById(
      "dropZone"
    );


  if (!input) {

    console.log(
      "Photo input not found"
    );

    return;
  }


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


  if (dropZone) {

    dropZone.addEventListener(
      "dragover",
      function(event) {

        event.preventDefault();

        dropZone.classList.add(
          "dragging"
        );

      }
    );


    dropZone.addEventListener(
      "dragleave",
      function() {

        dropZone.classList.remove(
          "dragging"
        );

      }
    );


    dropZone.addEventListener(
      "drop",
      function(event) {

        event.preventDefault();

        dropZone.classList.remove(
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


  console.log(
    "Photo upload ready"
  );
}


/* =========================================
   ADD PHOTOS
========================================= */

function addPhotos(files) {

  files.forEach(function(file) {

    if (
      !file.type ||
      !file.type.startsWith(
        "image/"
      )
    ) {
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

      memory: ""

    };


    state.photos.push(
      photo
    );

  });


  renderPhotos();

}


/* =========================================
   RENDER PHOTOS
========================================= */

function renderPhotos() {

  var list =
    document.getElementById(
      "photoList"
    );


  if (!list) {
    return;
  }


  list.innerHTML = "";


  state.photos.forEach(
    function(photo, index) {

      var item =
        document.createElement(
          "div"
        );


      item.className =
        "photo-item";


      item.setAttribute(
        "data-photo-id",
        photo.id
      );


      item.innerHTML =

        '<div class="photo-preview">' +

          '<img src="' +
          escapeHtml(photo.url) +
          '" alt="Memory photo ' +
          (index + 1) +
          '">' +

        "</div>" +

        '<div class="photo-info">' +

          '<div class="photo-number">' +
          "Memory " +
          (index + 1) +
          "</div>" +

          '<textarea ' +
          'class="photo-memory" ' +
          'data-photo-memory="' +
          escapeHtml(photo.id) +
          '" ' +
          'placeholder="Tell us what happened in this photo...">' +
          escapeHtml(
            photo.memory
          ) +
          "</textarea>" +

        "</div>" +

        '<button ' +
        'type="button" ' +
        'class="remove-photo" ' +
        'data-remove-photo="' +
        escapeHtml(photo.id) +
        '">' +

        "×" +

        "</button>";


      list.appendChild(
        item
      );

    }
  );


  setupPhotoControls();


  updatePhotoCount();
}


/* =========================================
   PHOTO CONTROLS
========================================= */

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

          var id =
            button.getAttribute(
              "data-remove-photo"
            );


          removePhoto(id);

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


/* =========================================
   REMOVE PHOTO
========================================= */

function removePhoto(id) {

  var photo =
    state.photos.find(
      function(item) {

        return item.id === id;

      }
    );


  if (
    photo &&
    photo.url
  ) {

    URL.revokeObjectURL(
      photo.url
    );

  }


  state.photos =
    state.photos.filter(
      function(item) {

        return item.id !== id;

      }
    );


  renderPhotos();

}


/* =========================================
   PHOTO COUNT
========================================= */

function updatePhotoCount() {

  var count =
    document.getElementById(
      "photoCount"
    );


  if (!count) {
    return;
  }


  var number =
    state.photos.length;


  if (number === 1) {

    count.textContent =
      "1 photo";

  } else {

    count.textContent =
      number + " photos";

  }

}


/* =========================================
   CONTINUE TO PHOTOS
========================================= */

function setupNavigation() {

  var continueButton =
    document.getElementById(
      "continueToPhotos"
    );


  if (continueButton) {

    continueButton.addEventListener(
      "click",
      function(event) {

        event.preventDefault();


        collectChildInformation();


        if (!state.child.name) {

          alert(
            "Please enter your child's name."
          );

          document
            .getElementById(
              "childName"
            )
            .focus();

          return;
        }


        if (!state.child.age) {

          alert(
            "Please choose your child's age."
          );

          document
            .getElementById(
              "childAge"
            )
            .focus();

          return;
        }


        if (!state.story.type) {

          state.story.type =
            "Magical Adventure";

        }


        showStep(2);

      }
    );

  }


  var backButton =
    document.getElementById(
      "backToDetails"
    );


  if (backButton) {

    backButton.addEventListener(
      "click",
      function(event) {

        event.preventDefault();

        showStep(1);

      }
    );

  }

}


/* =========================================
   CREATE STORY BUTTON
========================================= */

function setupCreateStoryButton() {

  var button =
    document.getElementById(
      "createStoryBtn"
    );


  if (!button) {

    console.log(
      "Create story button not found"
    );

    return;
  }


  button.addEventListener(
    "click",
    function(event) {

      event.preventDefault();

      generateStory();

    }
  );

}


/* =========================================
   COLLECT PHOTO MEMORIES
========================================= */

function collectPhotoMemories() {

  var inputs =
    document.querySelectorAll(
      "[data-photo-memory]"
    );


  inputs.forEach(
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


/* =========================================
   GENERATE STORY
========================================= */

async function generateStory() {

  collectChildInformation();

  collectPhotoMemories();


  if (!state.child.name) {

    alert(
      "Please enter your child's name."
    );

    showStep(1);

    return;
  }


  if (
    state.photos.length === 0
  ) {

    alert(
      "Please add at least one photo."
    );

    return;
  }


  var button =
    document.getElementById(
      "createStoryBtn"
    );


  if (button) {

    button.disabled = true;

    button.innerHTML =
      "Creating their story ✨";

  }


  var photoMemories =
    state.photos.map(
      function(photo, index) {

        return {

          order:
            index + 1,

          memory:
            photo.memory || ""

        };

      }
    );


  var payload = {

    child:
      state.child,

    story:
      state.story,

    memories: {

      general:
        state.memories,

      photos:
        photoMemories

    }

  };


  try {

    console.log(
      "Sending story request...",
      payload
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

          body:
            JSON.stringify(
              payload
            )

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


    console.log(
      "Story generated:",
      result
    );


    state.generatedStory =
      result;


    renderGeneratedStory(
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

      button.innerHTML =
        'Create their story <span>✨</span>';

    }

  }

}


/* =========================================
   RENDER GENERATED STORY
========================================= */

function renderGeneratedStory(
  result
) {

  var story =
    result.story ||
    result;


  var title =
    story.title ||
    "Once Upon a Time...";


  var subtitle =
    story.subtitle ||
    "";


  var pages =
    story.pages ||
    [];


  var ending =
    story.ending ||
    "";


  var storyTitle =
    document.getElementById(
      "storyTitle"
    );


  if (storyTitle) {

    storyTitle.textContent =
      title;

  }


  var storySubtitle =
    document.getElementById(
      "storySubtitle"
    );


  if (storySubtitle) {

    storySubtitle.textContent =
      subtitle;

  }


  var coverName =
    document.getElementById(
      "coverChildName"
    );


  if (coverName) {

    coverName.textContent =
      state.child.name;

  }


  var coverType =
    document.getElementById(
      "coverStoryType"
    );


  if (coverType) {

    coverType.textContent =
      state.story.type;

  }


  var coverPhotoWrap =
    document.getElementById(
      "coverPhotoWrap"
    );


  if (
    coverPhotoWrap &&
    state.photos.length > 0
  ) {

    coverPhotoWrap.innerHTML =

      '<img src="' +
      escapeHtml(
        state.photos[0].url
      ) +
      '" alt="' +
      escapeHtml(
        state.child.name
      ) +
      '">';

  }


  var pagesContainer =
    document.getElementById(
      "generatedPages"
    );


  if (!pagesContainer) {
    return;
  }


  pagesContainer.innerHTML =
    "";


  pages.forEach(
    function(page, index) {

      var article =
        document.createElement(
          "article"
        );


      article.className =
        "story-page";


      var photo =
        state.photos[index];


      var imageHtml =
        "";


      if (photo) {

        imageHtml =

          '<div class="story-image">' +

            '<img src="' +
            escapeHtml(
              photo.url
            ) +
            '" alt="Story memory ' +
            (index + 1) +
            '">' +

          "</div>";

      }


      article.innerHTML =

        imageHtml +

        '<div class="story-content">' +

          "<span>" +
          "Chapter " +
          (index + 1) +
          "</span>" +

          "<h2>" +
          escapeHtml(
            page.title ||
            ""
          ) +
          "</h2>" +

          "<p>" +
          escapeHtml(
            page.text ||
            page.content ||
            ""
          ) +
          "</p>" +

        "</div>";


      pagesContainer.appendChild(
        article
      );

    }
  );


  var endingText =
    document.getElementById(
      "endingText"
    );


  if (endingText) {

    endingText.textContent =
      ending;

  }

}


/* =========================================
   EDIT STORY
========================================= */

function setupEditButton() {

  var button =
    document.getElementById(
      "editStoryBtn"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    function() {

      showStep(1);

    }
  );

}


/* =========================================
   START OVER
========================================= */

function setupStartOverButton() {

  var button =
    document.getElementById(
      "startOverBtn"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    function() {

      resetApp();

    }
  );

}


/* =========================================
   PRINT STORY
========================================= */

function setupPrintButton() {

  var button =
    document.getElementById(
      "printStoryBtn"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    function() {

      window.print();

    }
  );

}


/* =========================================
   ADD ANOTHER MEMORY
========================================= */

function setupAddMemoryButton() {

  var button =
    document.getElementById(
      "addMemoryBtn"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    function() {

      var input =
        document.getElementById(
          "photoInput"
        );


      if (input) {

        input.click();

      }

    }
  );

}


/* =========================================
   RESET APP
========================================= */

function resetApp() {

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


  var fields =
    document.querySelectorAll(
      "input, textarea, select"
    );


  fields.forEach(
    function(field) {

      if (
        field.type === "file"
      ) {

        field.value = "";

      } else {

        field.value = "";

      }

    }
  );


  var length =
    document.getElementById(
      "storyLength"
    );


  if (length) {

    length.value =
      "medium";

  }


  var tone =
    document.getElementById(
      "storyTone"
    );


  if (tone) {

    tone.value =
      "warm";

  }


  var cards =
    document.querySelectorAll(
      ".choice-card"
    );


  cards.forEach(
    function(card) {

      card.classList.remove(
        "selected"
      );

      card.setAttribute(
        "aria-selected",
        "false"
      );

    }
  );


  var firstCard =
    document.querySelector(
      ".choice-card"
    );


  if (firstCard) {

    firstCard.classList.add(
      "selected"
    );

    firstCard.setAttribute(
      "aria-selected",
      "true"
    );

  }


  var list =
    document.getElementById(
      "photoList"
    );


  if (list) {

    list.innerHTML = "";

  }


  updatePhotoCount();


  showStep(1);

}


/* =========================================
   INITIALIZE APPLICATION
========================================= */

function initApp() {

  console.log(
    "Once Upon My Child initializing..."
  );


  setupAdventureCards();

  setupNavigation();

  setupPhotoUpload();

  setupCreateStoryButton();

  setupEditButton();

  setupStartOverButton();

  setupPrintButton();

  setupAddMemoryButton();


  showStep(1);


  console.log(
    "Once Upon My Child ready"
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
