import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from "../header";
import Footer from "../footer";
import { Terminal, Zap, Shield, Award, Code, Database, Server } from 'lucide-react';
import useAuthCheck from "../../utils/authCheck";

const GAME_STAGES = {
  INTRO: 'intro',
  CHALLENGE: 'challenge',
  RESULT: 'result',
  GAME_OVER: 'gameOver'
};

const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

const challenges = [
  {
    id: 1,
    title: "Hello, World!",
    description: "Let's start with the basics. Print 'Hello, World!' to the console.",
    task: "Write a line of JavaScript code that prints 'Hello, World!' to the console.",
    correctAnswer: "console.log('Hello, World!');",
    hint: "Use console.log() to print to the console in JavaScript.",
    points: 50,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "JavaScript"
  },
  {
    id: 2,
    title: "Variable Declaration",
    description: "Declare a variable named 'age' and assign it the value 25.",
    task: "Write a line of JavaScript code that declares a variable 'age' and assigns it the value 25.",
    correctAnswer: "let age = 25;",
    hint: "Use 'let' to declare a variable in JavaScript.",
    points: 50,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "JavaScript"
  },
  {
    id: 3,
    title: "Simple Addition",
    description: "Create a function that adds two numbers.",
    task: "Write a JavaScript function named 'add' that takes two parameters and returns their sum.",
    correctAnswer: `
function add(a, b) {
  return a + b;
}`,
    hint: "Use the '+' operator to add numbers in JavaScript.",
    points: 75,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "JavaScript"
  },
  {
    id: 4,
    title: "Array Basics",
    description: "Create an array of fruits.",
    task: "Create a JavaScript array named 'fruits' containing 'apple', 'banana', and 'orange'.",
    correctAnswer: "let fruits = ['apple', 'banana', 'orange'];",
    hint: "Use square brackets [] to create an array in JavaScript.",
    points: 75,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "JavaScript"
  },
  {
    id: 5,
    title: "Conditional Statement",
    description: "Write an if statement to check if a number is positive.",
    task: "Write a JavaScript if statement that checks if the variable 'num' is greater than 0.",
    correctAnswer: `
if (num > 0) {
  console.log('Positive');
}`,
    hint: "Use the '>' operator to check if a number is greater than zero.",
    points: 100,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "JavaScript"
  },
  {
    id: 6,
    title: "Decrypt the Message",
    description: "A secret message has been intercepted. Decrypt it using the Caesar cipher with a shift of 3.",
    encryptedMessage: "Khoor, Zruog!",
    task: "Write a Python function to decrypt the message: 'Khoor, Zruog!'",
    correctAnswer: `
def decrypt(message):
    decrypted = ""
    for char in message:
        if char.isalpha():
            ascii_offset = 65 if char.isupper() else 97
            decrypted += chr((ord(char) - ascii_offset - 3) % 26 + ascii_offset)
        else:
            decrypted += char
    return decrypted

print(decrypt("Khoor, Zruog!"))`,
    hint: "Each letter in the message has been shifted 3 positions forward in the alphabet.",
    points: 100,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "Python"
  },
  {
    id: 7,
    title: "Fix the Firewall",
    description: "The system's firewall has a bug. Find and fix the error in the code.",
    code: `
function checkFirewall(ip) {
  const blockedIPs = ['192.168.1.1', '10.0.0.1'];
  return blockedIPs.includes(ip);
}`,
    task: "Modify the JavaScript function so that it blocks IPs starting with '192.168' or '10.0'.",
    correctAnswer: `
function checkFirewall(ip) {
  return ip.startsWith('192.168') || ip.startsWith('10.0');
}`,
    hint: "Use the startsWith() method to check the beginning of the IP address.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "JavaScript"
  },
  {
    id: 8,
    title: "Optimize the Algorithm",
    description: "Our data processing algorithm is too slow. Optimize it to run faster.",
    code: `
function processData(data) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      if (i !== j && data[i] + data[j] === 10) {
        result.push([data[i], data[j]]);
      }
    }
  }
  return result;
}`,
    task: "Optimize the JavaScript function to find pairs of numbers that sum to 10 more efficiently.",
    correctAnswer: `
function processData(data) {
  let result = [];
  let seen = new Set();
  for (let num of data) {
    if (seen.has(10 - num)) {
      result.push([num, 10 - num]);
    }
    seen.add(num);
  }
  return result;
}`,
    hint: "Consider using a Set to keep track of numbers you've seen before.",
    points: 200,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "JavaScript"
  },
  // ... (previous challenges remain the same)
  {
    id: 9,
    title: "String Reversal",
    description: "Create a function to reverse a string.",
    task: "Write a JavaScript function that takes a string as input and returns the reversed string.",
    correctAnswer: `
function reverseString(str) {
  return str.split('').reverse().join('');
}`,
    hint: "You can split the string into an array, reverse it, and join it back.",
    points: 75,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "JavaScript"
  },
  {
    id: 10,
    title: "List Comprehension",
    description: "Create a list of even numbers using list comprehension.",
    task: "Write a Python list comprehension that generates even numbers from 0 to 20 (inclusive).",
    correctAnswer: "even_numbers = [x for x in range(21) if x % 2 == 0]",
    hint: "Use the range() function and check if each number is divisible by 2.",
    points: 100,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "Python"
  },
  {
    id: 11,
    title: "Factorial Calculation",
    description: "Calculate the factorial of a number using recursion.",
    task: "Write a recursive Python function to calculate the factorial of a given number.",
    correctAnswer: `
def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n - 1)`,
    hint: "Remember the base case for 0 and 1, then use recursion for other numbers.",
    points: 125,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "Python"
  },
  {
    id: 12,
    title: "Palindrome Check",
    description: "Check if a given string is a palindrome.",
    task: "Write a JavaScript function that returns true if the input string is a palindrome, false otherwise.",
    correctAnswer: `
function isPalindrome(str) {
  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanStr === cleanStr.split('').reverse().join('');
}`,
    hint: "Remove non-alphanumeric characters and compare the string with its reverse.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "JavaScript"
  },
  {
    id: 13,
    title: "Binary Search",
    description: "Implement a binary search algorithm.",
    task: "Write a Python function that performs binary search on a sorted list.",
    correctAnswer: `
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    hint: "Divide the search interval in half repeatedly.",
    points: 200,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Python"
  },
  {
    id: 14,
    title: "Implement Queue using Stacks",
    description: "Implement a queue data structure using two stacks.",
    task: "Create a JavaScript class 'Queue' that uses two stacks to implement queue operations (enqueue and dequeue).",
    correctAnswer: `
class Queue {
  constructor() {
    this.stack1 = [];
    this.stack2 = [];
  }

  enqueue(x) {
    this.stack1.push(x);
  }

  dequeue() {
    if (this.stack2.length === 0) {
      if (this.stack1.length === 0) return undefined;
      while (this.stack1.length > 0) {
        this.stack2.push(this.stack1.pop());
      }
    }
    return this.stack2.pop();
  }
}`,
    hint: "Use one stack for enqueue operations and another for dequeue operations.",
    points: 250,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "JavaScript"
  },
  {
    id: 15,
    title: "Time Complexity Analysis",
    description: "Analyze the time complexity of a given algorithm.",
    task: "What is the time complexity of the following Python function? Explain your reasoning.",
    code: `
def mystery_function(n):
    result = 0
    for i in range(n):
        for j in range(n):
            result += i * j
    return result`,
    correctAnswer: "The time complexity is O(n^2). There are two nested loops, each iterating n times, resulting in n * n = n^2 iterations.",
    hint: "Look at the number of nested loops and how many times each one iterates.",
    points: 200,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "Theory"
  },
  {
    id: 16,
    title: "Explain Big O Notation",
    description: "Demonstrate your understanding of Big O notation.",
    task: "Explain what Big O notation represents and give examples of common time complexities (e.g., O(1), O(n), O(log n), O(n^2)).",
    correctAnswer: "Big O notation describes the upper bound of an algorithm's time complexity as the input size grows. Examples: O(1) - constant time (e.g., array access), O(n) - linear time (e.g., linear search), O(log n) - logarithmic time (e.g., binary search), O(n^2) - quadratic time (e.g., nested loops).",
    hint: "Think about how the number of operations grows in relation to the input size.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "Theory"
  },
  {
    id: 17,
    title: "Implement Bubble Sort",
    description: "Write a function to perform bubble sort on an array.",
    task: "Implement the bubble sort algorithm in Java to sort an array of integers in ascending order.",
    correctAnswer: `
public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap arr[j] and arr[j+1]
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
    hint: "Use nested loops to compare adjacent elements and swap them if they're in the wrong order.",
    points: 175,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "Java"
  },
  {
    id: 18,
    title: "Implement Merge Sort",
    description: "Write a function to perform merge sort on an array.",
    task: "Implement the merge sort algorithm in C++ to sort a vector of integers in ascending order.",
    correctAnswer: `
#include <vector>

void merge(std::vector<int>& arr, int left, int mid, int right) {
    std::vector<int> temp(right - left + 1);
    int i = left, j = mid + 1, k = 0;

    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }

    while (i <= mid) {
        temp[k++] = arr[i++];
    }

    while (j <= right) {
        temp[k++] = arr[j++];
    }

    for (int p = 0; p < k; p++) {
        arr[left + p] = temp[p];
    }
}

void mergeSort(std::vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}`,
    hint: "Use a divide-and-conquer approach. Split the array, sort the halves, then merge them.",
    points: 250,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "C++"
  },
  {
    id: 19,
    title: "Basic Data Types",
    description: "Test your knowledge of basic data types in programming.",
    task: "Which of the following is NOT a primitive data type in most programming languages?",
    options: ["Integer", "Boolean", "Float", "Array"],
    correctAnswer: "Array",
    explanation: "Arrays are composite data types that can hold multiple values, while Integer, Boolean, and Float are primitive data types that hold single values.",
    points: 50,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "Theory"
  },
  {
    id: 20,
    title: "Control Structures",
    description: "Understand the basic control structures in programming.",
    task: "What is the purpose of a 'switch' statement in programming?",
    options: [
      "To create a loop",
      "To handle exceptions",
      "To execute different code blocks based on different conditions",
      "To define a function"
    ],
    correctAnswer: "To execute different code blocks based on different conditions",
    explanation: "A switch statement allows a program to execute different code blocks based on the value of a variable or expression, providing an efficient way to handle multiple conditions.",
    points: 75,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "Theory"
  },
  {
    id: 21,
    title: "Object-Oriented Programming",
    description: "Test your understanding of OOP concepts.",
    task: "What is encapsulation in object-oriented programming?",
    options: [
      "The ability of a class to inherit properties and methods from another class",
      "The process of creating an instance of a class",
      "The principle of bundling data and methods that operate on that data within a single unit",
      "The ability of objects to respond differently to the same method call"
    ],
    correctAnswer: "The principle of bundling data and methods that operate on that data within a single unit",
    explanation: "Encapsulation is a fundamental principle of OOP that involves bundling the data (attributes) and the methods that operate on the data within a single unit or object. This helps in data hiding and reducing complexity.",
    points: 100,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "Theory"
  },
  {
    id: 22,
    title: "Database Concepts",
    description: "Understand basic database concepts.",
    task: "What is a primary key in a relational database?",
    options: [
      "A key used to encrypt the database",
      "The first column in any database table",
      "A unique identifier for each record in a table",
      "A foreign key that references another table"
    ],
    correctAnswer: "A unique identifier for each record in a table",
    explanation: "A primary key is a column or set of columns in a table that uniquely identifies each row in that table. It ensures that each record can be uniquely identified and helps in maintaining data integrity.",
    points: 125,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "Theory"
  },
  {
    id: 23,
    title: "Networking Fundamentals",
    description: "Test your knowledge of basic networking concepts.",
    task: "What is the purpose of the DNS (Domain Name System) in computer networking?",
    options: [
      "To encrypt network traffic",
      "To assign IP addresses to devices",
      "To translate domain names to IP addresses",
      "To route packets between networks"
    ],
    correctAnswer: "To translate domain names to IP addresses",
    explanation: "The Domain Name System (DNS) is responsible for translating human-readable domain names (like www.example.com) into IP addresses that computers use to identify each other on the network. This makes it easier for users to access websites and other network resources.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "Theory"
  },
  {
    id: 24,
    title: "Algorithms and Data Structures",
    description: "Analyze the time complexity of common algorithms.",
    task: "What is the average-case time complexity of quicksort?",
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
    correctAnswer: "O(n log n)",
    explanation: "The average-case time complexity of quicksort is O(n log n). This is because, on average, the algorithm divides the array into two roughly equal parts in each recursive step, leading to a depth of log n recursions, each taking n time to process.",
    points: 200,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Theory"
  },
  {
    id: 25,
    title: "Software Design Patterns",
    description: "Understand advanced software design concepts.",
    task: "Which design pattern is best suited for creating objects in a superclass, but allowing subclasses to alter the type of objects that will be created?",
    options: ["Singleton", "Factory Method", "Observer", "Decorator"],
    correctAnswer: "Factory Method",
    explanation: "The Factory Method pattern is a creational pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created. This pattern is useful when a class can't anticipate the type of objects it needs to create beforehand.",
    points: 250,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Theory"
  }
];

const CodeBreaker = () => {
  useAuthCheck();
  const [gameStage, setGameStage] = useState(GAME_STAGES.INTRO);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userSolution, setUserSolution] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [message, setMessage] = useState('');
  const [difficulty, setDifficulty] = useState(null);

  useEffect(() => {
    if (gameStage === GAME_STAGES.CHALLENGE) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setGameStage(GAME_STAGES.GAME_OVER);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStage]);

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameStage(GAME_STAGES.CHALLENGE);
    const filteredChallenges = challenges.filter(challenge => challenge.difficulty === selectedDifficulty);
    setCurrentChallenge(filteredChallenges[0]);
    setTimeLeft(300);
    setScore(0);
  };

  const handleSubmit = () => {
    if (currentChallenge.options) {
      // For theory questions
      if (userSolution === currentChallenge.correctAnswer) {
        setScore(prevScore => prevScore + currentChallenge.points);
        setMessage(`Correct! ${currentChallenge.explanation}`);
      } else {
        setMessage(`Incorrect. ${currentChallenge.explanation}`);
      }
    } else {
      // For coding challenges
      if (userSolution.trim() === currentChallenge.correctAnswer.trim()) {
        setScore(prevScore => prevScore + currentChallenge.points);
        setMessage('Great job! You solved the challenge.');
      } else {
        setMessage('Oops! That\'s not quite right. Try again!');
      }
    }
    
    const filteredChallenges = challenges.filter(challenge => challenge.difficulty === difficulty);
    const currentIndex = filteredChallenges.findIndex(challenge => challenge.id === currentChallenge.id);
    if (currentIndex === filteredChallenges.length - 1) {
      setGameStage(GAME_STAGES.GAME_OVER);
    } else {
      setCurrentChallenge(filteredChallenges[currentIndex + 1]);
    }
    setUserSolution('');
  };

  const handleSkip = () => {
    const filteredChallenges = challenges.filter(challenge => challenge.difficulty === difficulty);
    const currentIndex = filteredChallenges.findIndex(challenge => challenge.id === currentChallenge.id);
    if (currentIndex === filteredChallenges.length - 1) {
      setGameStage(GAME_STAGES.GAME_OVER);
    } else {
      setCurrentChallenge(filteredChallenges[currentIndex + 1]);
      setUserSolution('');
      setMessage('Question skipped. Here\'s a new challenge!');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getIcon = (difficulty) => {
    switch(difficulty) {
      case DIFFICULTY_LEVELS.EASY:
        return <Code className="mr-2" />;
      case DIFFICULTY_LEVELS.MEDIUM:
        return <Database className="mr-2" />;
      case DIFFICULTY_LEVELS.HARD:
        return <Server className="mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {gameStage === GAME_STAGES.INTRO && <Header />}
      
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {gameStage === GAME_STAGES.INTRO ? (
          <h1 className="text-5xl font-bold mb-8 text-blue-400">Code Breaker: The Cyber Adventure</h1>
        ) : (
          <h1 className="text-3xl font-bold mb-4 text-blue-400">Code Breaker</h1>
        )}
        
        {gameStage === GAME_STAGES.INTRO && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="mb-4 text-xl">Welcome, agent! The Cyber Security Agency needs your help. Choose your difficulty level:</p>
            {Object.values(DIFFICULTY_LEVELS).map((level) => (
              <button 
                key={level}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 m-2 text-lg"
                onClick={() => startGame(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </motion.div>
        )}

        {gameStage === GAME_STAGES.CHALLENGE && currentChallenge && (
          <div className="w-full max-w-5xl bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-semibold">Score: {score}</div>
              <div className="text-2xl font-semibold">Time: {formatTime(timeLeft)}</div>
            </div>

            <motion.div
              key={currentChallenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4 flex items-center">
                {getIcon(currentChallenge.difficulty)}
                {currentChallenge.title}
              </h2>
              <p className="mb-2 text-yellow-300 text-xl">Type: {currentChallenge.language}</p>
              <p className="mb-4 text-lg">{currentChallenge.description}</p>
              <p className="mb-4 text-xl font-semibold">{currentChallenge.task}</p>

              {currentChallenge.options ? (
                // Render multiple choice options for theory questions
                <div className="mt-4">
                  {currentChallenge.options.map((option, index) => (
                    <button
                      key={index}
                      className={`w-full text-left p-3 mb-2 rounded transition duration-300 ${
                        userSolution === option
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                      onClick={() => setUserSolution(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                // Render code input for coding challenges
                <textarea
                  className="w-full p-4 mb-4 bg-gray-700 text-white rounded h-64 text-lg"
                  value={userSolution}
                  onChange={(e) => setUserSolution(e.target.value)}
                  placeholder="Enter your solution here..."
                />
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button
                    className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300 text-lg"
                    onClick={handleSubmit}
                  >
                    Submit Solution
                  </button>
                  {!currentChallenge.options && (
                    <button
                      className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 text-lg"
                      onClick={() => setMessage(currentChallenge.hint)}
                    >
                      Get Hint
                    </button>
                  )}
                </div>
                <button
                  className="px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300 text-lg"
                  onClick={handleSkip}
                >
                  Skip Question
                </button>
              </div>
              {message && (
                <p className="mt-4 text-yellow-300 text-lg">{message}</p>
              )}
            </motion.div>
          </div>
        )}

        {gameStage === GAME_STAGES.GAME_OVER && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Mission Complete!</h2>
            <p className="text-2xl mb-4">Your final score: {score}</p>
            <Award className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
            <p className="mb-4 text-xl">Congratulations, agent! You've successfully completed all challenges and protected our systems.</p>
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 text-lg"
              onClick={() => setGameStage(GAME_STAGES.INTRO)}
            >
              Play Again
            </button>
          </motion.div>
        )}
      </main>

      {gameStage === GAME_STAGES.INTRO && <Footer />}
    </div>
  );
};

export default CodeBreaker;