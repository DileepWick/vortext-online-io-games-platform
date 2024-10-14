import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from "../header";
import Footer from "../footer";
import { Terminal, Zap, Shield, Award, Code, Database, Server } from 'lucide-react';
import useAuthCheck from "../../utils/authCheck";
import { BackgroundBeams } from '../ui/BackgroundBeams';



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
  
    // Easy Questions (10)
    {
      id: 1,
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
      id: 2,
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
      points: 50,
      difficulty: DIFFICULTY_LEVELS.EASY,
      language: "Theory"
    },
    {
      id: 3,
      title: "Variables and Scope",
      description: "Understand variable scope in programming.",
      task: "What is the scope of a variable declared inside a function?",
      options: [
        "Global scope",
        "Function scope",
        "Block scope",
        "Module scope"
      ],
      correctAnswer: "Function scope",
      explanation: "Variables declared inside a function have function scope, meaning they are only accessible within that function.",
      points: 50,
      difficulty: DIFFICULTY_LEVELS.EASY,
      language: "Theory"
    },
    {
      id: 4,
      title: "Loops",
      description: "Understand different types of loops in programming.",
      task: "Which loop is best suited for iterating a known number of times?",
      options: ["for loop", "while loop", "do-while loop", "foreach loop"],
      correctAnswer: "for loop",
      explanation: "A for loop is ideal when you know the number of iterations in advance, as it allows you to specify the initialization, condition, and increment/decrement in a single line.",
      points: 50,
      difficulty: DIFFICULTY_LEVELS.EASY,
      language: "Theory"
    },
    {
      id: 5,
      title: "Basic Operators",
      description: "Test your knowledge of basic operators in programming.",
      task: "What does the '%' operator typically represent in most programming languages?",
      options: ["Division", "Multiplication", "Modulus", "Percentage"],
      correctAnswer: "Modulus",
      explanation: "The '%' operator typically represents the modulus operation, which returns the remainder after division of one number by another.",
      points: 50,
      difficulty: DIFFICULTY_LEVELS.EASY,
      language: "Theory"
    },
    {
      id: 6,
      title: "Basic File Operations",
      description: "Understand basic file operations in programming.",
      task: "What mode should you use to open a file for reading in most programming languages?",
      options: ["w", "r", "a", "x"],
      correctAnswer: "r",
      explanation: "The 'r' mode is typically used to open a file for reading. 'w' is for writing (and creates a new file if it doesn't exist), 'a' is for appending, and 'x' is for exclusive creation.",
      points: 50,
      difficulty: DIFFICULTY_LEVELS.EASY,
      language: "Theory"
    },
    {
      id: 7,
      title: "Basic String Operations",
      description: "Test your knowledge of basic string operations.",
      task: "What is the result of concatenating 'Hello' and 'World'?",
      options: ["HelloWorld", "Hello World", "HELLOWORLD", "hello world"],
      correctAnswer: "HelloWorld",
      explanation: "String concatenation joins strings end-to-end. When 'Hello' and 'World' are concatenated without any space in between, the result is 'HelloWorld'.",
      points: 50,
      difficulty: DIFFICULTY_LEVELS.EASY,
      language: "Theory"
    },
    {
      id: 8,
      title: "Basic Array Operations",
      description: "Understand basic array operations in programming.",
      task: "What operation would you use to add an element to the end of an array in most programming languages?",
      options: ["push()", "add()", "insert()", "append()"],
      correctAnswer: "push()",
      explanation: "The push() method is commonly used to add one or more elements to the end of an array in many programming languages, including JavaScript.",
      points: 50,
      difficulty: DIFFICULTY_LEVELS.EASY,
      language: "Theory"
    },
    {
      id: 9,
      title: "Basic Boolean Logic",
      description: "Test your understanding of basic boolean logic.",
      task: "What is the result of the expression: true AND false OR true?",
      options: ["true", "false", "error", "undefined"],
      correctAnswer: "true",
      explanation: "In boolean logic, AND has higher precedence than OR. So this expression is evaluated as (true AND false) OR true, which simplifies to false OR true, which is true.",
      points: 50,
      difficulty: DIFFICULTY_LEVELS.EASY,
      language: "Theory"
    },
    {
      id: 10,
      title: "Basic Exception Handling",
      description: "Understand basic exception handling in programming.",
      task: "What keyword is commonly used to handle exceptions in many programming languages?",
      options: ["catch", "handle", "except", "try"],
      correctAnswer: "catch",
      explanation: "The 'catch' keyword is commonly used to handle exceptions in many programming languages. It's usually used in conjunction with 'try' to catch and handle potential errors.",
      points: 50,
      difficulty: DIFFICULTY_LEVELS.EASY,
      language: "Theory"
    },
  
    // Medium Questions (10)
    {
      id: 11,
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
      id: 12,
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
      points: 100,
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      language: "Theory"
    },
    {
      id: 13,
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
      points: 100,
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      language: "Theory"
    },
    {
      id: 14,
      title: "Inheritance in OOP",
      description: "Understand the concept of inheritance in Object-Oriented Programming.",
      task: "What is the main purpose of inheritance in OOP?",
      options: [
        "To create multiple instances of a class",
        "To hide the implementation details of a class",
        "To reuse code and establish a hierarchical relationship between classes",
        "To overload methods in a class"
      ],
      correctAnswer: "To reuse code and establish a hierarchical relationship between classes",
      explanation: "Inheritance allows a new class to be based on an existing class, inheriting its properties and methods. This promotes code reuse and allows for the creation of a hierarchical structure of classes.",
      points: 100,
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      language: "Theory"
    },
    {
      id: 15,
      title: "SQL Basics",
      description: "Test your knowledge of basic SQL commands.",
      task: "Which SQL command is used to retrieve data from a database?",
      options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
      correctAnswer: "SELECT",
      explanation: "The SELECT statement is used to retrieve data from one or more tables in a database. It's one of the most fundamental and commonly used SQL commands.",
      points: 100,
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      language: "Theory"
    },
    {
      id: 16,
      title: "HTTP Methods",
      description: "Understand the basic HTTP methods used in web development.",
      task: "Which HTTP method is typically used to update an existing resource on a server?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correctAnswer: "PUT",
      explanation: "The PUT method is typically used to update an existing resource. It replaces the entire resource with the data sent in the request.",
      points: 100,
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      language: "Theory"
    },
    {
      id: 17,
      title: "Data Structures",
      description: "Test your knowledge of basic data structures.",
      task: "Which data structure operates on a Last-In-First-Out (LIFO) principle?",
      options: ["Queue", "Stack", "Linked List", "Tree"],
      correctAnswer: "Stack",
      explanation: "A stack is a data structure that follows the Last-In-First-Out (LIFO) principle. The last element added to the stack is the first one to be removed.",
      points: 100,
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      language: "Theory"
    },
    {
      id: 18,
      title: "Regular Expressions",
      description: "Understand the basics of regular expressions.",
      task: "What does the regular expression '^[a-zA-Z0-9]+$' match?",
      options: [
        "Any string",
        "Strings with only letters and numbers",
        "Strings that start with letters or numbers",
        "Strings that end with letters or numbers"
      ],
      correctAnswer: "Strings with only letters and numbers",
      explanation: "This regular expression matches strings that contain only letters (both uppercase and lowercase) and numbers. The '^' ensures the match starts at the beginning, '[a-zA-Z0-9]' matches any letter or number, '+' means one or more occurrences, and '$' ensures the match goes to the end of the string.",
      points: 100,
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      language: "Theory"
    },
    {
      id: 19,
      title: "Version Control",
      description: "Test your understanding of version control concepts.",
      task: "What is the purpose of 'branching' in version control systems?",
      options: [
        "To delete old versions of the code",
        "To merge two different projects",
        "To create a separate line of development",
        "To revert changes in the code"
      ],
      correctAnswer: "To create a separate line of development",
      explanation: "Branching in version control systems allows developers to diverge from the main line of development and work independently on features or experiments without affecting the main codebase.",
      points: 100,
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      language: "Theory"
    },
    {
      id: 20,
      title: "API Basics",
      description: "Understand the basics of APIs (Application Programming Interfaces).",
      task: "What does REST stand for in the context of APIs?",
      options: [
        "Rapid Execution of Stored Transactions",
        "Representational State Transfer",
        "Remote Execution of Secure Tasks",
        "Reliable Extraction of Structured Text"
      ],
      correctAnswer: "Representational State Transfer",
      explanation: "REST (Representational State Transfer) is an architectural style for designing networked applications. It relies on a stateless, client-server protocol, almost always HTTP, and treats server objects as resources that can be created, updated, or destroyed.",
      points: 100,
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      language: "Theory"
    },
  
    // Hard Questions (10)
    {
      id: 21,
      title: "Algorithms and Data Structures",
      description: "Analyze the time complexity of common algorithms.",
      task: "What is the average-case time complexity of quicksort?",
      options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
      correctAnswer: "O(n log n)",
      explanation: "The average-case time complexity of quicksort is O(n log n). This is because, on average, the algorithm divides the array into two roughly equal parts in each recursive step, leading to a depth of log n recursions, each taking n time to process.",
      points: 150,
      difficulty: DIFFICULTY_LEVELS.HARD,
      language: "Theory"
    },
    {
      id: 22,
      title: "Software Design Patterns",
      description: "Understand advanced software design concepts.",
      task: "Which design pattern is best suited for creating objects in a superclass, but allowing subclasses to alter the type of objects that will be created?",
      options: ["Singleton", "Factory Method", "Observer", "Decorator"],
      correctAnswer: "Factory Method",
      explanation: "The Factory Method pattern is a creational pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created. This pattern is useful when a class can't anticipate the type of objects it needs to create beforehand.",
      points: 150,
      difficulty: DIFFICULTY_LEVELS.HARD,
      language: "Theory"
    },
    {
      id: 23,
      title: "Concurrency and Parallelism",
      description: "Understand the concepts of concurrency and parallelism in programming.",
      task: "What is the main difference between concurrency and parallelism?",
      options: [
        "Concurrency is about structure, parallelism is about execution",
        "Concurrency is faster, parallelism is slower",
        "Concurrency uses multiple cores, parallelism uses a single core",
        "There is no difference, they are the same concept"
      ],
      correctAnswer: "Concurrency is about structure, parallelism is about execution",
    explanation: "Concurrency is about dealing with lots of things at once (structure of a program), while parallelism is about doing lots of things at once (actual simultaneous execution). A system can be concurrent without being parallel, but not vice versa.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Theory"
  },
  {
    id: 24,
    title: "Distributed Systems",
    description: "Understand concepts related to distributed systems.",
    task: "What is the CAP theorem in distributed systems?",
    options: [
      "Consistency, Availability, Partition tolerance - you can only guarantee two out of these three properties",
      "Concurrency, Atomicity, Persistence - all three must be guaranteed for a reliable system",
      "Caching, Authentication, Performance - key aspects of any distributed system",
      "Clustering, Allocation, Parallelism - fundamental principles of distributed computing"
    ],
    correctAnswer: "Consistency, Availability, Partition tolerance - you can only guarantee two out of these three properties",
    explanation: "The CAP theorem states that in a distributed system, it is impossible to simultaneously provide more than two out of three guarantees: Consistency, Availability, and Partition tolerance. This fundamental theorem helps in understanding the trade-offs in designing distributed systems.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Theory"
  },
  {
    id: 25,
    title: "Compiler Design",
    description: "Test your knowledge of compiler design concepts.",
    task: "What is the purpose of the lexical analysis phase in a compiler?",
    options: [
      "To optimize the code for better performance",
      "To generate machine code from the intermediate representation",
      "To break the source code into tokens",
      "To check the syntax of the program"
    ],
    correctAnswer: "To break the source code into tokens",
    explanation: "Lexical analysis, also known as tokenization, is the first phase of a compiler. It breaks the source code into a sequence of tokens, which are meaningful character strings like keywords, identifiers, literals, and operators. This prepares the code for the subsequent parsing phase.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Theory"
  },
  {
    id: 26,
    title: "Machine Learning Basics",
    description: "Understand fundamental concepts in machine learning.",
    task: "What is overfitting in the context of machine learning models?",
    options: [
      "When a model performs equally well on training and test data",
      "When a model performs poorly on both training and test data",
      "When a model performs well on training data but poorly on unseen test data",
      "When a model requires too much computational power to train"
    ],
    correctAnswer: "When a model performs well on training data but poorly on unseen test data",
    explanation: "Overfitting occurs when a machine learning model learns the training data too well, including its noise and fluctuations. As a result, it performs excellently on the training data but fails to generalize well to unseen data, leading to poor performance on test data.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Theory"
  },
  {
    id: 27,
    title: "Cryptography",
    description: "Test your understanding of basic cryptographic concepts.",
    task: "What is the main difference between symmetric and asymmetric encryption?",
    options: [
      "Symmetric encryption is faster, asymmetric is more secure",
      "Symmetric encryption uses one key for both encryption and decryption, asymmetric uses different keys",
      "Symmetric encryption is used for digital signatures, asymmetric for data encryption",
      "There is no difference, they are two terms for the same concept"
    ],
    correctAnswer: "Symmetric encryption uses one key for both encryption and decryption, asymmetric uses different keys",
    explanation: "In symmetric encryption, the same key is used for both encrypting and decrypting the data. In asymmetric encryption, also known as public-key cryptography, there are two different keys: a public key for encryption and a private key for decryption.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Theory"
  },
  {
    id: 28,
    title: "Operating Systems",
    description: "Understand advanced concepts in operating systems.",
    task: "What is a deadlock in the context of operating systems?",
    options: [
      "A situation where a process is terminated unexpectedly",
      "A state where two or more processes are unable to proceed because each is waiting for the other to release a resource",
      "A condition where the CPU is overwhelmed with too many processes",
      "An error that occurs when a process tries to access memory outside its allocated space"
    ],
    correctAnswer: "A state where two or more processes are unable to proceed because each is waiting for the other to release a resource",
    explanation: "A deadlock is a situation in which two or more competing actions are each waiting for the other to finish, and thus neither ever does. In an operating system, it occurs when processes are unable to proceed because each is holding a resource and waiting for another resource acquired by some other process.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Theory"
  },
  {
    id: 29,
    title: "Database Optimization",
    description: "Test your knowledge of database optimization techniques.",
    task: "What is the purpose of database indexing?",
    options: [
      "To encrypt sensitive data in the database",
      "To compress the data to save storage space",
      "To speed up data retrieval operations on a database table",
      "To ensure data integrity through constraints"
    ],
    correctAnswer: "To speed up data retrieval operations on a database table",
    explanation: "Database indexing is a data structure technique used to quickly locate and access the data in a database. Indexes are created using a few database columns, and they provide the basis for both rapid random lookups and efficient access of ordered records, significantly improving the speed of data retrieval operations.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Theory"
  },
  {
    id: 30,
    title: "Quantum Computing",
    description: "Understand basic concepts of quantum computing.",
    task: "What is superposition in quantum computing?",
    options: [
      "The process of combining multiple quantum computers",
      "A state where a qubit can exist in multiple states simultaneously",
      "The speed at which quantum computations are performed",
      "The maximum number of qubits a quantum computer can handle"
    ],
    correctAnswer: "A state where a qubit can exist in multiple states simultaneously",
    explanation: "Superposition is a fundamental principle of quantum mechanics and quantum computing. It refers to the ability of a quantum system (like a qubit) to exist in multiple states at the same time until it is measured. This property allows quantum computers to perform certain computations much faster than classical computers.",
    points: 150,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Theory"
  },
  {
    id: 34,
    title: "What is the value of y in JavaScript?",
    description: "Examine the following code snippet:",
    task: `
      let x = 5; 
      let y = x++;
      console.log(y);
    `,
    options: ["4", "5", "6", "undefined"],
    correctAnswer: "5",
    explanation: "The post-increment operator (++) returns the value of x before incrementing it.",
    points: 50,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "JavaScript"
  },
  
  {
    id: 35,
    title: "What is the second element of the array in JavaScript?",
    description: "Examine the following code snippet:",
    task: `
      let arr = [1, 2, 3];
      console.log(arr[1]);
    `,
    options: ["1", "2", "3", "undefined"],
    correctAnswer: "2",
    explanation: "Array indices start at 0, so arr[1] refers to the second element in the array.",
    points: 50,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "JavaScript"
  },
  
  {
    id: 36,
    title: "What is the length of the given string in JavaScript?",
    description: "Examine the following code snippet:",
    task: `
      let str = "hello";
      console.log(str.length);
    `,
    options: ["4", "5", "6", "undefined"],
    correctAnswer: "5",
    explanation: "The length property returns the number of characters in the string.",
    points: 50,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "JavaScript"
  },
  
  {
    id: 37,
    title: "What is the output of the ternary operator in JavaScript?",
    description: "Examine the following code snippet:",
    task: `
      let x = 5;
      let y = x === 5 ? "true" : "false";
      console.log(y);
    `,
    options: ["true", "false", "5", "undefined"],
    correctAnswer: "true",
    explanation: "The ternary operator (?:) returns the first value if the condition is true, and the second value if it's false.",
    points: 50,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "JavaScript"
  },
  
  {
    id: 42,
    title: "What is the value of y in Python?",
    description: "Examine the following code snippet:",
    task: `
      x = 5;
      y = x + 1;
      print(x);
    `,
    options: ["4", "5", "6", "undefined"],
    correctAnswer: "5",
    explanation: "The value of x is not changed by the addition operation.",
    points: 50,
    difficulty: DIFFICULTY_LEVELS.EASY,
    language: "Python"
  },
  {
    id: 39,
    title: "What are the values of a and b in JavaScript?",
    description: "Examine the following code snippet:",
    task: `
      let obj = { a: 1, b: 2 };
      let { a, b } = obj;
      console.log(a + b);
    `,
    options: ["2", "3", "4", "undefined"],
    correctAnswer: "3",
    explanation: "Destructuring assignment allows you to extract values from an object and assign them to variables.",
    points: 100,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "JavaScript"
  },
  
  {
    id: 40,
    title: "What is the reversed string in JavaScript?",
    description: "Examine the following code snippet:",
    task: `
      let str = "hello";
      let reversed = str.split("").reverse().join("");
      console.log(reversed);
    `,
    options: ["hello", "olleh", "undefined", "null"],
    correctAnswer: "olleh",
    explanation: "The split() method splits a string into an array, reverse() reverses the array, and join() joins the array back into a string.",
    points: 100,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "JavaScript"
  },
  
  {
    id: 41,
    title: "What is the filtered array in JavaScript?",
    description: "Examine the following code snippet:",
    task: `
      let arr = [1, 2, 3, 4, 5];
      let filtered = arr.filter(x => x > 3);
      console.log(filtered);
    `,
    options: ["[1, 2, 3]", "[4, 5]", "[1, 2, 3, 4, 5]", "undefined"],
    correctAnswer: "[4, 5]",
    explanation: "The filter() method creates a new array with all elements that pass the test implemented by the provided function.",
    points: 100,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "JavaScript"
  },
  
  {
    id: 43,
    title: "What is the sum of the list elements in Python?",
    description: "Examine the following code snippet:",
    task: `
      numbers = [1, 2, 3, 4, 5]
      total = sum(numbers)
      print(total)
    `,
    options: ["10", "15", "20", "undefined"],
    correctAnswer: "15",
    explanation: "The sum() function adds up all the elements in the list.",
    points: 100,
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    language: "Python"
  },
  {
    id: 44,
    title: "What is the result of the recursive function in JavaScript?",
    description: "Examine the following code snippet:",
    task: `
      function factorial(n) {
        if (n == 0) {
          return 1;
        } else {
          return n * factorial(n-1);
        }
      }
      console.log(factorial(5));
    `,
    options: ["24", "120", "undefined", "null"],
    correctAnswer: "120",
    explanation: "The recursive function calls itself until it reaches the base case, then returns the result.",
    points: 200,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "JavaScript"
  },
  
  {
    id: 45,
    title: "What is the result of the asynchronous function in JavaScript?",
    description: "Examine the following code snippet:",
    task: `
      function asyncFunction() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve("Hello, World!");
          }, 2000);
        });
      }
      asyncFunction().then((result) => console.log(result));
    `,
    options: ["Hello, World!", "undefined", "null", "error"],
    correctAnswer: "Hello, World!",
    explanation: "The asynchronous function returns a promise that resolves after 2 seconds, then logs the result.",
    points: 200,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "JavaScript"
  },
  
  {
    id: 47,
    title: "What is the result of the list comprehension in Python?",
    description: "Examine the following code snippet:",
    task: `
      numbers = [1, 2, 3, 4, 5]
      squared_numbers = [x**2 for x in numbers]
      print(squared_numbers)
    `,
    options: ["[1, 4, 9, 16, 25]", "[1, 2, 3, 4, 5]", "undefined", "null"],
    correctAnswer: "[1, 4, 9, 16, 25]",
    explanation: "The list comprehension creates a new list with the squared values of the original list.",
    points: 200,
    difficulty: DIFFICULTY_LEVELS.HARD,
    language: "Python"
  },
      

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

  const formatCodeSnippet = (code) => {
    return code.split(';').map((line, index) => (
      <React.Fragment key={index}>
        {line.trim()}{index < code.split(';').length - 1 ? ';' : ''}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {gameStage === GAME_STAGES.INTRO && <Header />}
      
      <main className="flex-grow flex flex-col items-center justify-center p-4 min-h-[90vh]">
      <BackgroundBeams />

        
        {gameStage === GAME_STAGES.INTRO ? (
          <h1 className="text-7xl font-bold text-black bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-900 via-purple-600 to-purple-300 [text-shadow:0_0_rgba(0,0,0,0.1)]">Code Breaker: The Cyber Adventure</h1>

        ) : (
          <h1 className="text-6xl font-bold mb-4 text-blue-400">Code Breaker</h1>
        )}
        
        {gameStage === GAME_STAGES.INTRO && (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center"
  >
    <p className="mb-4 text-2xl">Welcome, Code Master! The Programming Guild needs your expertise. Choose your challenge level:</p>
    <div className="items-center space-y-4">
      {Object.values(DIFFICULTY_LEVELS).map((level) => (
        <button
          key={level}
          className="p-[3px] relative m-2"
          onClick={() => startGame(level)}
        >
          {/* Gradient border with dark purple colors */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-900 rounded-lg" />
          
          {/* Inner button content with hover effect */}
          <div className="px-6 py-3 bg-gray-800 rounded-[6px] relative group transition duration-200 text-white text-xl hover:bg-transparent">
            {level.charAt(0).toUpperCase() + level.slice(1)}
            
          </div>
        </button>
      ))}
      
    </div>
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

            {currentChallenge.language === "JavaScript" && (
              <pre className="bg-gray-700 p-4 rounded-lg mb-4 text-lg">
                <code>{formatCodeSnippet(currentChallenge.task)}</code>
              </pre>
            )}

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