var board;
var score = 0;
var rows = 4;
var columns = 4;
var currentUser = null;

// --- Authentication ---

function getUsers() {
    return JSON.parse(localStorage.getItem("2048_users") || "{}");
}

function saveUsers(users) {
    localStorage.setItem("2048_users", JSON.stringify(users));
}

function loginUser(username) {
    var users = getUsers();
    if (!users[username]) {
        users[username] = { highScore: 0 };
        saveUsers(users);
    }
    currentUser = username;
    localStorage.setItem("2048_current_user", username);
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem("2048_current_user");
    score = 0;
    document.getElementById("score").innerText = "0";
    document.getElementById("board").innerHTML = "";
    showLoginOverlay();
}

function getUserHighScore() {
    if (!currentUser) return 0;
    var users = getUsers();
    return (users[currentUser] && users[currentUser].highScore) || 0;
}

function updateHighScore() {
    if (!currentUser) return;
    var users = getUsers();
    if (!users[currentUser]) {
        users[currentUser] = { highScore: 0 };
    }
    if (score > users[currentUser].highScore) {
        users[currentUser].highScore = score;
        saveUsers(users);
    }
    document.getElementById("best-score").innerText = users[currentUser].highScore;
}

function showLoginOverlay() {
    document.getElementById("login-overlay").style.display = "flex";
    document.getElementById("username-input").value = "";
    document.getElementById("login-error").innerText = "";
    document.getElementById("user-bar").style.display = "none";
    setTimeout(function() {
        document.getElementById("username-input").focus();
    }, 50);
}

function hideLoginOverlay() {
    document.getElementById("login-overlay").style.display = "none";
    document.getElementById("user-bar").style.display = "flex";
}

function handleLogin() {
    var input = document.getElementById("username-input");
    var username = input.value.trim().replace(/[^a-zA-Z0-9_\- ]/g, "");
    if (!username) {
        document.getElementById("login-error").innerText = "Please enter a valid username (letters, numbers, spaces, - and _ only).";
        return;
    }
    loginUser(username);
    hideLoginOverlay();
    document.getElementById("welcome-msg").innerText = "Hello, " + currentUser + "!";
    document.getElementById("best-score").innerText = getUserHighScore();
    score = 0;
    document.getElementById("score").innerText = "0";
    document.getElementById("board").innerHTML = "";
    setGame();
}

// --- Game Logic ---

window.onload = function() {
    document.getElementById("login-btn").addEventListener("click", handleLogin);
    document.getElementById("username-input").addEventListener("keyup", function(e) {
        if (e.key === "Enter") handleLogin();
    });
    document.getElementById("logout-btn").addEventListener("click", logoutUser);

    var savedUser = localStorage.getItem("2048_current_user");
    var users = getUsers();
    if (savedUser && users[savedUser]) {
        loginUser(savedUser);
        hideLoginOverlay();
        document.getElementById("welcome-msg").innerText = "Hello, " + currentUser + "!";
        document.getElementById("best-score").innerText = getUserHighScore();
        setGame();
    } else {
        localStorage.removeItem("2048_current_user");
        showLoginOverlay();
    }
}

function setGame() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            let num = board[r][c];
            updateTile(tile, num);
            document.getElementById("board").append(tile);
        }
    }
    //create 2 to begin the game
    setTwo();
    setTwo();

}

function updateTile(tile, num) {
    tile.innerText = "";
    tile.classList.value = ""; //clear the classList
    tile.classList.add("tile");
    if (num > 0) {
        tile.innerText = num.toString();
        if (num <= 4096) {
            tile.classList.add("x"+num.toString());
        } else {
            tile.classList.add("x8192");
        }                
    }
}

document.addEventListener('keyup', (e) => {
    if (!currentUser) return;
    if (e.code == "ArrowLeft") {
        slideLeft();
        setTwo();
    }
    else if (e.code == "ArrowRight") {
        slideRight();
        setTwo();
    }
    else if (e.code == "ArrowUp") {
        slideUp();
        setTwo();

    }
    else if (e.code == "ArrowDown") {
        slideDown();
        setTwo();
    }
    document.getElementById("score").innerText = score;
    updateHighScore();
})

function filterZero(row){
    return row.filter(num => num != 0); //create new array of all nums != 0
}

function slide(row) {
    //[0, 2, 2, 2] 
    row = filterZero(row); //[2, 2, 2]
    for (let i = 0; i < row.length-1; i++){
        if (row[i] == row[i+1]) {
            row[i] *= 2;
            row[i+1] = 0;
            score += row[i];
        }
    } //[4, 0, 2]
    row = filterZero(row); //[4, 2]
    //add zeroes
    while (row.length < columns) {
        row.push(0);
    } //[4, 2, 0, 0]
    return row;
}

function slideLeft() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row = slide(row);
        board[r] = row;
        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideRight() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];         //[0, 2, 2, 2]
        row.reverse();              //[2, 2, 2, 0]
        row = slide(row)            //[4, 2, 0, 0]
        board[r] = row.reverse();   //[0, 0, 2, 4];
        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideUp() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row = slide(row);
        for (let r = 0; r < rows; r++){
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideDown() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row.reverse();
        row = slide(row);
        row.reverse();
        for (let r = 0; r < rows; r++){
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function setTwo() {
    if (!hasEmptyTile()) {
        return;
    }
    let found = false;
    while (!found) {
        //find random row and column to place a 2 in
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = 2;
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            tile.innerText = "2";
            tile.classList.add("x2");
            found = true;
        }
    }
}

function hasEmptyTile() {
    let count = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) { //at least one zero in the board
                return true;
            }
        }
    }
    return false;
}