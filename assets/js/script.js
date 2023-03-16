// declaring consts for Welcome Page DOM Objects
const welcomeDiv = document.getElementById("welcome-div");

// declaring consts for Game DOM Objects
const startGameBtn = document.getElementById("start-game-btn");
const gameDiv = document.getElementById("game-div");
const questionText = document.getElementById("question-text");
const choices = Array.from(document.getElementsByClassName("btn-choice"));
const tieChoices = Array.from(document.getElementsByClassName("btn-choice-tie"));
const progressDiv = document.getElementById("progress-div");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progressbar-fg");
const restartGameBtn = document.getElementById("restart-game-btn");
const answerDiv = document.getElementById("answer-div-hide");
const answerTieDiv = document.getElementById("answer-tie-div-hide");

// declaring consts for Results DOM Objects
const resultsDiv = document.getElementById("results-div");
const personalityHeading = document.getElementById("personality-heading");
const personalityTextP1 = document.getElementById("personality-text-p1");
const personalityTextP2 = document.getElementById("personality-text-p2");
const startAgainBtn = document.getElementById("start-again-btn");

// declaring other variables
let maxQuestions = 10;
let username;
let personalityTally = [];


// Start Quiz Button - click event
startGameBtn.addEventListener('click', function () {
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
    welcomeDiv.classList.toggle("hidden");
    gameDiv.classList.toggle("hidden");
    addQuestionContent(0);
    handleAnswer();

    // restart button - reload page
    restartGameBtn.addEventListener('click', function () {
        window.location.reload();
    });
}

// Quiz Functionality --------------------------------------------------------------------- //

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
            // logs the personality connected to that answer to personalityTally
            logPersonalities(choice);
            // Sets short timeout before question refresh
            setTimeout(function () {
                // remove current question from array and replace with next question or calculate results if game ended
                if (questions.length <= 1) {
                    findTopPersonality();
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

// logs personality type for each answer to an array
function logPersonalities(choice) {
    // iterates through answers in questions_array
    questions[0].answers.forEach(answer => {
        // matches the selected answer to the same answer in the questions array
        if (choice.innerText === answer.answerText) {
            // adds the personality type to an array
            personalityTally.push(answer.answerType);
        }
    });
}

// re-enable the buttons after question answered
function enableButtons() {
    choices.forEach(choice => {
        choice.disabled = false;
    });
}

// Calculates user personality & reveals results
function findTopPersonality() {

    // updates personality scores in personalities array
    for (let i = 0; i < personalities.length; i++) {
        personalities[i].score = elementCount(personalityTally, personalities[i].type);
    }

    // Checks for a tie
    let topPersonalityArray = [];
    checkForTie(topPersonalityArray);

    // if not tied reveal results, if tied run tie breaker & reveal results
    let topPersonality;
    if (topPersonalityArray.length > 1) {

        showTieBreaker(topPersonalityArray);

        // sets the topPersonality personality based on clicked image
        for (let i = 0; i < tieChoices.length; i++) {
            tieChoices[i].addEventListener("click", function () {

                // adds the winning tie breaker personality to the personalityTally (for results calculations)                       
                let tieWinner = tieChoices[i].getAttribute("data-type");
                personalityTally.push(tieWinner);

                // updates scores again post tie-break selection
                for (let i = 0; i < personalities.length; i++) {
                    personalities[i].score = elementCount(personalityTally, personalities[i].type);
                }

                // sets winning personality based on last item in personalityTally
                topPersonality = personalityTally[personalityTally.length - 1];

                // Reveals results
                showResults(topPersonality);
            });
        }

    } else {

        // if not tied - sets the winning personality
        topPersonality = topPersonalityArray[0];

        // Reveals results
        showResults(topPersonality);
    }
}

// Helper functions for findTopPersonality

// Checks for tied personality results
function checkForTie(topPersonalityArray) {

    // creates an array of the number of times each personality occurs
    let scoreArray = [];
    for (let i = 0; i < personalities.length; i++) {
        scoreArray.push(personalities[i].score);
    }

    // calculate the maximum number of times any personality type appears
    let maxPersonalityScore = Math.max(...scoreArray);

    // create an array of the winning personalities
    for (let i = 0; i < personalities.length; i++) {
        if (personalities[i].score === maxPersonalityScore) {
            topPersonalityArray.push(personalities[i].type);
        }
    }
}

// Reveals Tie Breaker
function showTieBreaker(topPersonalityArray) {

    // reveals photos for tied personalities
    for (let i = 0; i < tieChoices.length; i++) {
        if (topPersonalityArray.includes(tieChoices[i].getAttribute("data-type"))) {
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
function showResults(topPersonality) {

    // hide game div & reveal results divs, scroll to top of page
    gameDiv.classList.toggle("hidden");
    resultsDiv.classList.toggle("hidden");
    scrollToTop();

    // populate personality heading and text
    populatePersonalityText(topPersonality);

    // start again game button - reload page
    startAgainBtn.addEventListener('click', function () {
        window.location.reload();
    });

}

// Helper Functions for showResults()

// Populates personality heading and text
function populatePersonalityText(topPersonality) {
    for (let i = 0; i < personalities.length; i++) {
        if (personalities[i].type === topPersonality) {
            personalityHeading.innerText = `${username.value}, YOU ARE ${personalities[i].prefix}... ${personalities[i].name}`;
            personalityTextP1.innerText = personalities[i].text[0];
            personalityTextP2.innerText = personalities[i].text[1];
        }
    }
}