// declaring consts for Welcome Page DOM Objects
const welcomeDiv = document.getElementById("welcome-div");

// declaring consts for Game DOM Objects
const startQuizBtn = document.getElementById("start-quiz-btn");
const gameDiv = document.getElementById("game-div");
const questionText = document.getElementById("question-text");
const choices = Array.from(document.getElementsByClassName("btn-choice"));
const tieChoices = Array.from(document.getElementsByClassName("btn-choice-tie"));
const progressDiv = document.getElementById("progress-div");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progressbar-fg");
const restartQuizBtn = document.getElementById("restart-quiz-btn");
const answerDiv = document.getElementById("answer-hide-div");
const answerTieHideDiv = document.getElementById("answer-tie-hide-div");

// declaring consts for Results Modal
const rmName = document.getElementById("role-model-name");
const rmImage = document.getElementById("modal-image");
const roleModelSummary = document.getElementById("role-model-summary");
const modalReadMoreBtn = document.getElementById("modal-read-more-btn");
const modal = document.getElementById("results-modal");
const span = document.getElementsByClassName("close")[0];


// declaring other variables
let maxQuestions = 10;
let answerTally = [];


// Start Quiz Button - click event
startQuizBtn.addEventListener('click', function () {
    startGame();
});

// helper function to move back to the top of the page
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Start Quiz Button Functionality ------------------------------------------ //

function startGame() {

    // Scroll to top of page
    scrollToTop();

    // starts gameplay
    welcomeDiv.classList.add("hidden");
    gameDiv.classList.remove("hidden");
    restartQuizBtn.classList.remove("hidden");
    addQuestionContent(0);
    handleAnswer();

    // restart button - reload page - with confirm alert
    restartQuizBtn.addEventListener('click', function () {
        if (confirm("This will take you back to the start of the quiz, are you sure?") == true) {
            window.location.reload();
        }
    });
}


// Populate the questions and answers & move on progress bar
function addQuestionContent(index) {

    let currentQuestion = questions[index];

    // populate question
    questionText.innerText = currentQuestion.questionText;

    // populate answers
    let answers = currentQuestion.answers;
    for (let i = 0; i < answers.length; i++) {
        choices[i].innerText = answers[i].answerText;
    }
    // set progress bar
    let questionNumber = questions[0].questionNumber;
    progressText.innerHTML = `Question ${questionNumber} of ${maxQuestions}`;
    progressBar.style.width = `${questionNumber / maxQuestions * 100}%`;
}

// User selects answer
function handleAnswer() {
    choices.forEach(choice => {
        choice.addEventListener('click', () => {
            selectAndSubmit(choice);
            setTimeout(scrollToTop, 500);
        });
    });
}


// Helper functions for handleAnswer

// Handles answer selection
// Adapted from https://www.sitepoint.com/community/t/select-one-button-deselect-other-buttons/348053 */
function selectAndSubmit(target) {
    choices.forEach(choice => {
        // adds a 'selected' class to selected answer & removes from others
        choice.classList.remove("selected");
        if (choice == target) {
            choice.classList.add("selected");
            // logs the rolemodel connected to that answer to answerTally
            logRolemodels(choice);
            // disable button to avoid clicking multiple times
            choice.disabled = true;
            // Sets short timeout before question refresh
            setTimeout(function () {
                // remove current question from array and replace with next question or calculate results if game ended
                if (questions.length <= 1) {
                    findTopRolemodel();
                } else {
                    questions.splice(0, 1);
                    addQuestionContent(0);
                    choice.classList.remove("selected");
                    enableButtons();
                }
            }, 500);
        } else {
            // disable other buttons during timeout (prevent logging duplicate results)
            choice.disabled = true;
        }
    });
}

// Helper Functions for selectAndSubmit

// logs Rolemodel code for each answer to an array
function logRolemodels(choice) {
    // iterates through answers in questions_array
    questions[0].answers.forEach(answer => {
        // matches the selected answer to the same answer in the questions array
        if (choice.innerText === answer.answerText) {
            // adds the rolemodel code to an array
            answerTally.push(answer.code);
        }
    });
}

// re-enable the buttons after question answered
function enableButtons() {
    choices.forEach(choice => {
        choice.disabled = false;
    });
}

// Calculates user rolemodel & reveals results
function findTopRolemodel() {

    // updates Rolemodel scores in rolemodels array
    for (let i = 0; i < rolemodels.length; i++) {
        rolemodels[i].score = elementCount(answerTally, rolemodels[i].code);
    }

    // Checks for a tie
    let topRolemodelArray = [];
    checkForTie(topRolemodelArray);

    // if not tied reveal results, if tied run tie breaker & reveal results
    let topRolemodel;
    if (topRolemodelArray.length > 1) {

        showTieBreaker(topRolemodelArray);

        // sets the topRolemodel based on clicked image
        for (let i = 0; i < tieChoices.length; i++) {
            tieChoices[i].addEventListener("click", function () {

                // adds the winning tie breaker rolemodel to the answerTally (for results calculations)                       
                let tieWinner = tieChoices[i].getAttribute("data-type");
                answerTally.push(tieWinner);

                // updates scores again post tie-break selection
                for (let i = 0; i < rolemodels.length; i++) {
                    rolemodels[i].score = elementCount(answerTally, rolemodels[i].code);
                }

                // sets winning rolemodel based on last item in answerTally
                topRolemodel = answerTally[answerTally.length - 1];

                // Reveals results
                showResults(topRolemodel);
            });
        }

    } else {

        // if not tied - sets the winning rolemodel
        topRolemodel = topRolemodelArray[0];

        // Reveals results
        showResults(topRolemodel);
    }
}

// Helper functions for findTopRolemodel

// Checks for tied Rolemodel results
function checkForTie(topRolemodelArray) {

    // creates an array of the number of times each rolemodel occurs
    let scoreArray = [];
    for (let i = 0; i < rolemodels.length; i++) {
        scoreArray.push(rolemodels[i].score);
    }

    // calculate the maximum number of times any rolemodel code appears
    let maxRolemodelScore = Math.max(...scoreArray);

    // create an array of the winning rolemodels
    for (let i = 0; i < rolemodels.length; i++) {
        if (rolemodels[i].score === maxRolemodelScore) {
            topRolemodelArray.push(rolemodels[i].code);
        }
    }
}

// Reveals Tie Breaker
function showTieBreaker(topRolemodelArray) {

    // reveals photos for tied rolemodels
    for (let i = 0; i < tieChoices.length; i++) {
        if (topRolemodelArray.includes(tieChoices[i].getAttribute("data-type"))) {
            tieChoices[i].classList.remove("hidden");
        }
    }

    // hides the main questions div and reveals the tie-breaker div
    answerDiv.classList.add("hidden");
    progressDiv.classList.add("hidden");
    answerTieHideDiv.classList.remove("hidden");
}

// Function to check for number of times an element occurs in an array
// function adapted from https://linuxhint.com/count-array-element-occurrences-in-javascript/#:~:text=To%20count%20element%20occurrences%20in,%E2%80%9Cfor%2Dof%E2%80%9D%20loop.
function elementCount(arr, element) {
    return arr.filter((currentElement) => currentElement == element).length;
}


// Results Page Functionality ------------------------------------------------------------------------------ //

function showResults(topRolemodel) {

    gameDiv.classList.add("hidden");
    welcomeDiv.classList.remove("hidden");
    restartQuizBtn.classList.add("hidden");

    // open the modal
    modal.style.display = "block";

    // populate rolemodel heading and text
    populateRolemodelText(topRolemodel);

    // When the user clicks on <span> (x), close the modal - with confirm alert
    span.onclick = function () {
        if (confirm("This will take you back to the start of the quiz, are you sure?") == true) {
            window.location.reload();
        }
    };

    // When the user clicks anywhere outside of the modal, close it - with confirm alert
    window.onclick = function (event) {
        if (event.target == modal) {
            if (confirm("This will take you back to the start of the quiz, are you sure?") == true) {
                window.location.reload();
            }
        }
    };
}

// Populates rolemodel heading and text
function populateRolemodelText(topRolemodel) {
    for (let i = 0; i < rolemodels.length; i++) {
        if (rolemodels[i].code === topRolemodel) {
            rmName.innerText = rolemodels[i].name;
            rmImage.src = rolemodels[i].img;
            rmImage.alt = rolemodels[i].alt;
            roleModelSummary.innerText = rolemodels[i].summary;
            modalReadMoreBtn.href = rolemodels[i].bioPage;
        }
    }
}