// controllers/rockPaperScissorsController.js

const playGame = (req, res) => {
    const { playerChoice } = req.body;
    const choices = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
  
    let result;
    if (playerChoice === computerChoice) {
      result = "It's a tie!";
    } else if (
      (playerChoice === 'rock' && computerChoice === 'scissors') ||
      (playerChoice === 'paper' && computerChoice === 'rock') ||
      (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
      result = 'You win!';
    } else {
      result = 'Computer wins!';
    }
  
    // In a real application, you'd update the score in a database
    const score = { player: 0, computer: 0 };
    if (result === 'You win!') score.player++;
    if (result === 'Computer wins!') score.computer++;
  
    res.json({ computerChoice, result, score });
  };
  
  export default { playGame };