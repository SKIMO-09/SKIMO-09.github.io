document.addEventListener("DOMContentLoaded", function() {
    
    /* ==========================================
       LAB 5: FORM VALIDATION LOGIC (Keep this!)
       ========================================== */
    const contactForm = document.getElementById("contactForm");
    
    if (contactForm) {
        const submitBtn = document.getElementById("submitBtn");
        const formResults = document.getElementById("formResults");
        const resultOutput = document.getElementById("resultOutput");
        const averageOutput = document.getElementById("averageOutput");
        const inputs = contactForm.querySelectorAll("input");
        const phoneInput = document.getElementById("phone");

        submitBtn.disabled = true;

        function validateInput(input) {
            const value = input.value.trim();
            let isValid = true;
            let errorMessage = "";

            const parent = input.parentNode;
            const existingError = parent.querySelector(".error-text");
            if (existingError) {
                existingError.remove();
            }

            if (value === "") {
                isValid = false;
                errorMessage = "This field cannot be empty.";
            } else {
                switch(input.id) {
                    case "name":
                    case "surname":
                        if (!/^[a-zA-Z]+$/.test(value)) {
                            isValid = false;
                            errorMessage = "Only letters are allowed.";
                        }
                        break;
                    case "email":
                        if (!/\S+@\S+\.\S+/.test(value)) {
                            isValid = false;
                            errorMessage = "Please enter a valid email address.";
                        }
                        break;
                    case "address":
                        if (value.length < 5) {
                            isValid = false;
                            errorMessage = "Address is too short.";
                        }
                        break;
                    case "rating1":
                    case "rating2":
                    case "rating3":
                        if (value < 1 || value > 10) {
                            isValid = false;
                            errorMessage = "Value must be between 1 and 10.";
                        }
                        break;
                }
            }

            if (!isValid) {
                input.style.borderColor = "red";
                const errorDiv = document.createElement("div");
                errorDiv.className = "error-text";
                errorDiv.style.color = "red";
                errorDiv.style.fontSize = "12px";
                errorDiv.textContent = errorMessage;
                input.parentNode.appendChild(errorDiv);
            } else {
                input.style.borderColor = "green";
            }
            return isValid;
        }

        function checkFormValidity() {
            let allValid = true;
            inputs.forEach(input => {
                if (input.style.borderColor !== "green" && input.type !== "submit") {
                    if(input.id === "phone") {
                        if (input.value.length < 14) allValid = false;
                    }
                    else if (input.id !== "phone" && !input.value) allValid = false;
                    else if (input.parentNode.querySelector(".error-text")) allValid = false;
                }
            });
            submitBtn.disabled = !allValid;
        }

        inputs.forEach(input => {
            if(input.id !== "phone") {
                input.addEventListener("input", function() {
                    validateInput(this);
                    checkFormValidity();
                });
            }
        });

        phoneInput.addEventListener("input", function(e) {
            let rawNumbers = e.target.value.replace(/\D/g, '');
            if (rawNumbers.startsWith('86')) {
                rawNumbers = '370' + rawNumbers.substring(1);
            } else if (rawNumbers.startsWith('6')) {
                rawNumbers = '370' + rawNumbers;
            } else if (rawNumbers.length > 0 && !rawNumbers.startsWith('370')) {
                rawNumbers = '370' + rawNumbers;
            }

            rawNumbers = rawNumbers.substring(0, 11);

            let formatted = "";
            if (rawNumbers.length > 0) formatted += "+" + rawNumbers.substring(0, 3);
            if (rawNumbers.length > 3) formatted += " " + rawNumbers.substring(3, 6);
            if (rawNumbers.length > 6) formatted += " " + rawNumbers.substring(6, 11);
            
            e.target.value = formatted;

            if(rawNumbers.length === 11) { 
                phoneInput.style.borderColor = "green";
            } else {
                phoneInput.style.borderColor = "red";
            }
            checkFormValidity();
        });

        contactForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = {
                name: document.getElementById("name").value,
                surname: document.getElementById("surname").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                address: document.getElementById("address").value,
                rating1: parseInt(document.getElementById("rating1").value),
                rating2: parseInt(document.getElementById("rating2").value),
                rating3: parseInt(document.getElementById("rating3").value)
            };

            const displayString = `Name: ${formData.name}
Surname: ${formData.surname}
Email: ${formData.email}
Phone number: ${formData.phone}
Address: ${formData.address}`;
                
            resultOutput.textContent = displayString;

            const average = (formData.rating1 + formData.rating2 + formData.rating3) / 3;
            const averageFormatted = average.toFixed(1);

            averageOutput.textContent = `${formData.name} ${formData.surname}: ${averageFormatted}`;

            if (average < 4) {
                averageOutput.style.color = "red";
            } else if (average < 7) {
                averageOutput.style.color = "orange";
            } else {
                averageOutput.style.color = "green";
            }

            formResults.style.display = "block";
            alert("Form submitted successfully!");
        });
    }

    /* ==========================================
       LAB 12: MEMORY GAME LOGIC
       ========================================== */

    // 1. Game Variables & Elements
    const gameBoard = document.getElementById('game-board');
    
    // Only run game logic if the game board exists on the page
    if (gameBoard) {
        const moveCountElem = document.getElementById('move-count');
        const matchCountElem = document.getElementById('match-count');
        const timerElem = document.getElementById('timer');
        const bestScoreElem = document.getElementById('best-score');
        const winMessage = document.getElementById('win-message');
        const difficultySelect = document.getElementById('difficulty');
        const startBtn = document.getElementById('start-game-btn');
        const restartBtn = document.getElementById('restart-game-btn');

        // Data Set (Using Bootstrap Icons for simplicity, or you can use images)
        const cardIcons = [
            'bi-android', 'bi-apple', 'bi-windows', 'bi-ubuntu',
            'bi-github', 'bi-linkedin', 'bi-discord', 'bi-telegram',
            'bi-youtube', 'bi-twitter-x', 'bi-instagram', 'bi-facebook'
        ];

        let cards = []; // Array to hold current game cards
        let hasFlippedCard = false;
        let lockBoard = false;
        let firstCard, secondCard;
        let moves = 0;
        let matches = 0;
        let gameActive = false;
        let timerInterval;
        let seconds = 0;
        let difficulty = 'easy';

        // 2. Initialize Game
        function initGame() {
            difficulty = difficultySelect.value;
            resetStats();
            
            // Determine number of pairs based on difficulty
            // Easy: 4x3 = 12 cards (6 pairs)
            // Hard: 6x4 = 24 cards (12 pairs)
            const numPairs = difficulty === 'easy' ? 6 : 12;
            
            // Create card data array (pairs)
            const selectedIcons = cardIcons.slice(0, numPairs);
            cards = [...selectedIcons, ...selectedIcons]; // Duplicate for pairs
            
            // Shuffle
            shuffle(cards);
            
            // Generate HTML
            generateBoard(cards);
            
            // Load Best Score
            loadBestScore();
            
            // UI Updates
            // Remove existing grid classes first
            gameBoard.classList.remove('grid-easy', 'grid-hard');
            gameBoard.classList.add(`grid-${difficulty}`);
            
            winMessage.style.display = 'none';
            startBtn.disabled = true;
            restartBtn.disabled = false;
            difficultySelect.disabled = true; // Lock difficulty during game
            
            // Start Timer
            startTimer();
            gameActive = true;
        }

        // 3. Generate HTML Board
        function generateBoard(cardData) {
            gameBoard.innerHTML = ''; // Clear board
            cardData.forEach(icon => {
                // Create card element
                const card = document.createElement('div');
                card.classList.add('memory-card');
                card.dataset.icon = icon;

                // Front Face (Icon) - The side with the image
                const frontFace = document.createElement('div');
                frontFace.classList.add('front-face');
                const i = document.createElement('i');
                i.classList.add('bi', icon); // Using Bootstrap Icons
                frontFace.appendChild(i);

                // Back Face (Cover) - The side visible initially
                const backFace = document.createElement('div');
                backFace.classList.add('back-face');

                // Append faces
                card.appendChild(frontFace);
                card.appendChild(backFace);

                // Add Click Event
                card.addEventListener('click', flipCard);

                gameBoard.appendChild(card);
            });
        }

        // 4. Flip Logic
        function flipCard() {
            if (!gameActive) return;
            if (lockBoard) return;
            if (this === firstCard) return; // Double click on same card

            this.classList.add('flip');

            if (!hasFlippedCard) {
                // First click
                hasFlippedCard = true;
                firstCard = this;
                return;
            }

            // Second click
            secondCard = this;
            checkForMatch();
        }

        // 5. Check Match
        function checkForMatch() {
            let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

            if (isMatch) {
                disableCards();
                matches++;
                matchCountElem.textContent = matches;
                checkWin();
            } else {
                unflipCards();
            }
            
            // Update Moves
            moves++;
            moveCountElem.textContent = moves;
        }

        function disableCards() {
            firstCard.removeEventListener('click', flipCard);
            firstCard.classList.add('matched');
            secondCard.removeEventListener('click', flipCard);
            secondCard.classList.add('matched');
            resetBoard();
        }

        function unflipCards() {
            lockBoard = true; // Prevent clicking others
            setTimeout(() => {
                firstCard.classList.remove('flip');
                secondCard.classList.remove('flip');
                resetBoard();
            }, 1000); // 1s delay
        }

        function resetBoard() {
            [hasFlippedCard, lockBoard] = [false, false];
            [firstCard, secondCard] = [null, null];
        }

        // 6. Win Condition
        function checkWin() {
            const totalPairs = cards.length / 2;
            if (matches === totalPairs) {
                gameActive = false;
                clearInterval(timerInterval);
                winMessage.style.display = 'block';
                saveBestScore();
                
                // Re-enable buttons on win
                startBtn.disabled = false;
                restartBtn.disabled = true;
                difficultySelect.disabled = false;
            }
        }

        // Helper: Shuffle Array (Fisher-Yates)
        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // Stats & Timer Functions
        function resetStats() {
            moves = 0;
            matches = 0;
            seconds = 0;
            moveCountElem.textContent = '0';
            matchCountElem.textContent = '0';
            timerElem.textContent = '00:00';
            clearInterval(timerInterval);
            gameBoard.innerHTML = ''; // Clear cards
            winMessage.style.display = 'none';
            [hasFlippedCard, lockBoard] = [false, false];
            [firstCard, secondCard] = [null, null];
        }

        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                seconds++;
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                timerElem.textContent = 
                    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }, 1000);
        }

        // Optional Task: LocalStorage
        function saveBestScore() {
            const key = `memory-best-${difficulty}`;
            const currentBest = localStorage.getItem(key);
            // Save if no best exists OR current moves are lower than best
            if (!currentBest || moves < parseInt(currentBest)) {
                localStorage.setItem(key, moves);
                loadBestScore(); // Update display immediately
            }
        }

        function loadBestScore() {
            const key = `memory-best-${difficulty}`;
            const best = localStorage.getItem(key);
            bestScoreElem.textContent = best ? best : '-';
        }

        // Event Listeners
        startBtn.addEventListener('click', initGame);
        
        restartBtn.addEventListener('click', function() {
            // For restart, we re-initialize the game
            initGame();
        });
        
        difficultySelect.addEventListener('change', function() {
             // When difficulty changes, reset stats and load best score for new difficulty
             difficulty = difficultySelect.value;
             resetStats(); // Clear the board
             loadBestScore(); // Update best score for new level
             
             // Reset buttons
             startBtn.disabled = false;
             restartBtn.disabled = true;
        });
        
        // Initial Load
        loadBestScore();
    }
});
