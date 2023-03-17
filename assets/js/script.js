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
const answerDiv = document.getElementById("answer-div");
const answerTieDiv = document.getElementById("answer-tie-div");

// declaring consts for Results DOM Objects
const resultsDiv = document.getElementById("results-div");
const rmName = document.getElementById("rolemodel-winner");
const rmImage = document.getElementById("role-model-image");
const rolemodelTextP1 = document.getElementById("rolemodel-text-p1");
const rolemodelTextP2 = document.getElementById("rolemodel-text-p2");
const eventsYear = Array.from(document.getElementsByClassName("life-event-year"));
const eventsText = Array.from(document.getElementsByClassName("life-event"));
const startAgainBtn = document.getElementById("start-again-btn");

// declaring other variables
let maxQuestions = 10;
let username;
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

    // restart button - reload page
    restartQuizBtn.addEventListener('click', function () {
        window.location.reload();
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
    console.log(answerTally);
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
    console.log(rolemodels[0].name + ": Score: " + rolemodels[0].score)
    console.log(rolemodels[1].name + ": Score: " + rolemodels[1].score)
    console.log(rolemodels[2].name + ": Score: " + rolemodels[2].score)
    console.log(rolemodels[3].name + ": Score: " + rolemodels[3].score)
    console.log(rolemodels[4].name + ": Score: " + rolemodels[4].score)
    console.log(rolemodels[5].name + ": Score: " + rolemodels[5].score)

    // Checks for a tie
    let topRolemodelArray = [];
    console.log(topRolemodelArray)
    checkForTie(topRolemodelArray);
    console.log("Top Role Model Array after checkForTie: " + topRolemodelArray)

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
    console.log("scoreArray: " + scoreArray);

    // calculate the maximum number of times any rolemodel code appears
    let maxRolemodelScore = Math.max(...scoreArray);
    console.log("maxRolemodelScore: " + maxRolemodelScore)

    // create an array of the winning rolemodels
    for (let i = 0; i < rolemodels.length; i++) {
        if (rolemodels[i].score === maxRolemodelScore) {
            topRolemodelArray.push(rolemodels[i].code);
        }
    }
    console.log("Top Role Model Array inside checkForTie: " + topRolemodelArray)
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
    answerTieDiv.classList.remove("hidden");
}

// Function to check for number of times an element occurs in an array
// function adapted from https://linuxhint.com/count-array-element-occurrences-in-javascript/#:~:text=To%20count%20element%20occurrences%20in,%E2%80%9Cfor%2Dof%E2%80%9D%20loop.
function elementCount(arr, element) {
    return arr.filter((currentElement) => currentElement == element).length;
}


// Results Page Functionality ------------------------------------------------------------------------------ //

// Reveal Results
function showResults(topRolemodel) {
    
}

    /**  OLD FUNCTIONALITY TO REVEAL ON QUIZ PAGE - REMOVE ONCE LINKS ARE IN PLACE
    // hide game div & reveal results divs, scroll to top of page
    gameDiv.classList.add("hidden");
    resultsDiv.classList.remove("hidden");
    scrollToTop();

    // populate rolemodel heading and text
    populateRolemodelContent(topRolemodel);

}

// Helper Functions for showResults()

// Populates rolemodel heading and text
function populateRolemodelContent(topRolemodel) {
    for (let i = 0; i < rolemodels.length; i++) {
        if (rolemodels[i].code === topRolemodel) {
            rmName.innerText = rolemodels[i].name;
            rmImage.src = rolemodels[i].img;
            rmImage.alt = rolemodels[i].alt;
            rolemodelTextP1.innerText = rolemodels[i].description[0];
            rolemodelTextP2.innerText = rolemodels[i].description[1];

            // populate life events
            let lifeEvents = rolemodels[i].events;
            for (let i = 0; i < lifeEvents.length; i++) {
                eventsYear[i].innerText = `${lifeEvents[i].year}:`;
                eventsText[i].innerText = lifeEvents[i].event;
            };
        }
    }
}
*/