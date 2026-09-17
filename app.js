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
lesson: ""
}
};

function goToStep(step) {
var screens =
document.querySelectorAll(".screen");

screens.forEach(function (screen) {
screen.classList.remove("active");
});

var target =
document.getElementById("step" + step);

if (target) {
target.classList.add("active");
}

state.currentStep = step;

var stepLabel =
document.getElementById("stepLabel");

if (stepLabel) {
stepLabel.textContent =
"Step " + step + " of 3";
}

var progressBar =
document.getElementById("progressBar");

if (progressBar) {
progressBar.style.width =
((step - 1) / 2) * 100 + "%";
}

window.scrollTo(0, 0);
}

function setupAdventureCards() {
var container =
document.getElementById(
"storyTypeChoices"
);

if (!container) {
return;
}

var cards =
container.querySelectorAll(
".choice-card"
);

cards.forEach(function (card) {

```
card.addEventListener(
  "click",
  function () {

    cards.forEach(function (item) {

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

    state.story.type =
      card.getAttribute(
        "data-value"
      ) ||
      "Magical Adventure";

    console.log(
      "Adventure selected:",
      state.story.type
    );
  }
);
```

});

console.log(
"Adventure cards ready"
);
}

function collectChildDetails() {
var nameInput =
document.getElementById(
"childName"
);

var ageInput =
document.getElementById(
"childAge"
);

var personalityInput =
document.getElementById(
"personality"
);

var favoritesInput =
document.getElementById(
"favorites"
);

var name =
nameInput
? nameInput.value.trim()
: "";

var age =
ageInput
? ageInput.value
: "";

if (!name) {
alert(
"Please enter your child's name."
);
return false;
}

if (!age) {
alert(
"Please choose your child's age."
);
return false;
}

state.child.name =
name;

state.child.age =
age;

state.child.personality =
personalityInput
? personalityInput.value.trim()
: "";

state.child.favorites =
favoritesInput
? favoritesInput.value.trim()
: "";

console.log(
"Child details saved:",
state.child
);

return true;
}

function collectStoryPreferences() {
var settingInput =
document.getElementById(
"setting"
);

var lessonInput =
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

console.log(
"Story preferences saved:",
state.story
);

return true;
}

function setupNavigation() {
var continueButton =
document.getElementById(
"continueToPhotos"
);

var backButton =
document.getElementById(
"backToDetails"
);

if (continueButton) {

```
continueButton.addEventListener(
  "click",
  function () {

    console.log(
      "Continue button clicked"
    );

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
  function () {

    goToStep(1);
  }
);
```

}

console.log(
"Navigation ready"
);
}

function initializeApp() {
setupAdventureCards();
setupNavigation();

goToStep(1);

console.log(
"STEP 3 WORKING"
);
}

if (
document.readyState ===
"loading"
) {

document.addEventListener(
"DOMContentLoaded",
initializeApp
);

} else {

initializeApp();
}
