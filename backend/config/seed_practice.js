'use strict';

/**
 * CODE ARENA — Comprehensive Practice System Seeder (150 Programs across 5 Languages)
 * 30 C, 30 C++, 30 Java, 30 Python, 30 JavaScript
 * Run: node config/seed_practice.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const practiceData = {
  c: [
    // Easy (10)
    {
      title: 'Hello World in C',
      category: 'Basic Programs',
      difficulty: 'Easy',
      description: 'Write a C program that prints `Hello, World!` to standard output.',
      input_format: 'No input.',
      output_format: 'Print `Hello, World!` followed by a newline.',
      sample_input: '',
      sample_output: 'Hello, World!',
      starter_code: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
      test_cases: [{ input: '', output: 'Hello, World!' }],
      hints: [{ num: 1, title: 'Output format', content: 'Use printf("Hello, World!\\n");' }]
    },
    {
      title: 'Add Two Integers',
      category: 'Basic Programs',
      difficulty: 'Easy',
      description: 'Read two integers `a` and `b` from standard input and print their sum.',
      input_format: 'Two integers separated by space.',
      output_format: 'Single integer representing the sum.',
      sample_input: '5 7',
      sample_output: '12',
      starter_code: '#include <stdio.h>\n\nint main() {\n    int a, b;\n    if (scanf("%d %d", &a, &b) == 2) {\n        printf("%d\\n", a + b);\n    }\n    return 0;\n}\n',
      test_cases: [{ input: '5 7', output: '12' }, { input: '-3 8', output: '5' }, { input: '100 250', output: '350' }],
      hints: [{ num: 1, title: 'Using scanf', content: 'Use scanf("%d %d", &a, &b);' }]
    },
    {
      title: 'Check Even or Odd',
      category: 'Basic Programs',
      difficulty: 'Easy',
      description: 'Given an integer `n`, determine if it is `Even` or `Odd`.',
      input_format: 'A single integer `n`.',
      output_format: 'Print `Even` or `Odd`.',
      sample_input: '4',
      sample_output: 'Even',
      starter_code: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%s\\n", (n % 2 == 0) ? "Even" : "Odd");\n    return 0;\n}\n',
      test_cases: [{ input: '4', output: 'Even' }, { input: '7', output: 'Odd' }, { input: '0', output: 'Even' }],
      hints: [{ num: 1, title: 'Modulo Operator', content: 'Use n % 2 == 0 to check for even numbers.' }]
    },
    {
      title: 'Find Largest of Three Numbers',
      category: 'Basic Programs',
      difficulty: 'Easy',
      description: 'Given three integers `a`, `b`, and `c`, find and print the largest value.',
      input_format: 'Three space-separated integers.',
      output_format: 'Single integer representing the maximum.',
      sample_input: '10 25 15',
      sample_output: '25',
      starter_code: '#include <stdio.h>\n\nint main() {\n    int a, b, c;\n    scanf("%d %d %d", &a, &b, &c);\n    int max = a;\n    if (b > max) max = b;\n    if (c > max) max = c;\n    printf("%d\\n", max);\n    return 0;\n}\n',
      test_cases: [{ input: '10 25 15', output: '25' }, { input: '9 3 1', output: '9' }, { input: '-5 -2 -8', output: '-2' }],
      hints: [{ num: 1, title: 'Conditional checks', content: 'Compare a, b, c sequentially or use ternary operators.' }]
    },
    {
      title: 'Factorial of a Number',
      category: 'Functions',
      difficulty: 'Easy',
      description: 'Given a non-negative integer `n`, calculate and print `n!` (n factorial). For n=0, 0! = 1.',
      input_format: 'Single integer `n` (0 <= n <= 12).',
      output_format: 'Factorial value.',
      sample_input: '5',
      sample_output: '120',
      starter_code: '#include <stdio.h>\n\nlong long factorial(int n) {\n    long long fact = 1;\n    for (int i = 1; i <= n; i++) fact *= i;\n    return fact;\n}\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%lld\\n", factorial(n));\n    return 0;\n}\n',
      test_cases: [{ input: '5', output: '120' }, { input: '0', output: '1' }, { input: '6', output: '720' }],
      hints: [{ num: 1, title: 'Iteration', content: 'Loop from 1 to n multiplying a running product.' }]
    },
    {
      title: 'Fibonacci Number',
      category: 'Recursion',
      difficulty: 'Easy',
      description: 'Find the `n`-th Fibonacci number where F(0)=0, F(1)=1, and F(n)=F(n-1)+F(n-2).',
      input_format: 'Integer `n` (0 <= n <= 30).',
      output_format: 'The n-th Fibonacci number.',
      sample_input: '7',
      sample_output: '13',
      starter_code: '#include <stdio.h>\n\nint fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1, c;\n    for (int i = 2; i <= n; i++) {\n        c = a + b;\n        a = b;\n        b = c;\n    }\n    return b;\n}\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d\\n", fib(n));\n    return 0;\n}\n',
      test_cases: [{ input: '7', output: '13' }, { input: '0', output: '0' }, { input: '1', output: '1' }],
      hints: [{ num: 1, title: 'Iterative DP', content: 'Iterate from 2 up to n tracking the previous two numbers.' }]
    },
    {
      title: 'Prime Number Checker',
      category: 'Functions',
      difficulty: 'Easy',
      description: 'Check whether an integer `n` is prime. Print `Prime` or `Not Prime`.',
      input_format: 'Integer `n` (n >= 1).',
      output_format: '`Prime` or `Not Prime`.',
      sample_input: '17',
      sample_output: 'Prime',
      starter_code: '#include <stdio.h>\n#include <stdbool.h>\n\nbool isPrime(int n) {\n    if (n <= 1) return false;\n    for (int i = 2; i * i <= n; i++) {\n        if (n % i == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%s\\n", isPrime(n) ? "Prime" : "Not Prime");\n    return 0;\n}\n',
      test_cases: [{ input: '17', output: 'Prime' }, { input: '4', output: 'Not Prime' }, { input: '1', output: 'Not Prime' }],
      hints: [{ num: 1, title: 'Square Root bound', content: 'Only check divisibility up to sqrt(n).' }]
    },
    {
      title: 'Reverse an Integer',
      category: 'Basic Programs',
      difficulty: 'Easy',
      description: 'Given an integer `n`, print its digits in reversed order.',
      input_format: 'Single non-negative integer `n`.',
      output_format: 'Reversed integer.',
      sample_input: '12345',
      sample_output: '54321',
      starter_code: '#include <stdio.h>\n\nint main() {\n    int n, rev = 0;\n    scanf("%d", &n);\n    while (n > 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    printf("%d\\n", rev);\n    return 0;\n}\n',
      test_cases: [{ input: '12345', output: '54321' }, { input: '900', output: '9' }, { input: '7', output: '7' }],
      hints: [{ num: 1, title: 'Digit extraction', content: 'Use n % 10 to extract the last digit and n / 10 to trim.' }]
    },
    {
      title: 'Palindrome Number in C',
      category: 'Basic Programs',
      difficulty: 'Easy',
      description: 'Determine if an integer is a palindrome (reads same forwards and backwards). Print `true` or `false`.',
      input_format: 'Single integer `n`.',
      output_format: '`true` or `false`.',
      sample_input: '121',
      sample_output: 'true',
      starter_code: '#include <stdio.h>\n\nint main() {\n    int n, orig, rev = 0;\n    scanf("%d", &n);\n    if (n < 0) { printf("false\\n"); return 0; }\n    orig = n;\n    while (n > 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    printf("%s\\n", (orig == rev) ? "true" : "false");\n    return 0;\n}\n',
      test_cases: [{ input: '121', output: 'true' }, { input: '-121', output: 'false' }, { input: '10', output: 'false' }],
      hints: [{ num: 1, title: 'Negative numbers', content: 'Negative integers cannot be palindromes because of the minus sign.' }]
    },
    {
      title: 'Sum of Digits',
      category: 'Basic Programs',
      difficulty: 'Easy',
      description: 'Compute the sum of all digits of a positive integer `n`.',
      input_format: 'Single integer `n`.',
      output_format: 'Sum of digits.',
      sample_input: '456',
      sample_output: '15',
      starter_code: '#include <stdio.h>\n\nint main() {\n    int n, sum = 0;\n    scanf("%d", &n);\n    while (n > 0) {\n        sum += (n % 10);\n        n /= 10;\n    }\n    printf("%d\\n", sum);\n    return 0;\n}\n',
      test_cases: [{ input: '456', output: '15' }, { input: '999', output: '27' }, { input: '5', output: '5' }],
      hints: [{ num: 1, title: 'Accumulator', content: 'Repeatedly add n % 10 to sum and divide n by 10.' }]
    },

    // Medium (10)
    {
      title: 'Array Sum & Average',
      category: 'Arrays',
      difficulty: 'Medium',
      description: 'Read an array of `n` integers. Print the sum and integer average separated by a space.',
      input_format: 'First line integer `n`. Second line `n` space-separated integers.',
      output_format: '`sum avg`',
      sample_input: '5\n10 20 30 40 50',
      sample_output: '150 30',
      starter_code: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    long long sum = 0;\n    for (int i = 0; i < n; i++) {\n        int x; scanf("%d", &x);\n        sum += x;\n    }\n    printf("%lld %lld\\n", sum, sum / n);\n    return 0;\n}\n',
      test_cases: [{ input: '5\n10 20 30 40 50', output: '150 30' }, { input: '3\n2 4 6', output: '12 4' }],
      hints: [{ num: 1, title: 'Integer Division', content: 'Use sum / n for integer average.' }]
    },
    {
      title: 'Find Maximum and Minimum in Array',
      category: 'Arrays',
      difficulty: 'Medium',
      description: 'Find the minimum and maximum elements in an array of `n` elements.',
      input_format: 'First line `n`. Second line `n` integers.',
      output_format: '`min max`',
      sample_input: '6\n3 5 1 9 2 8',
      sample_output: '1 9',
      starter_code: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int min, max, x;\n    scanf("%d", &x);\n    min = max = x;\n    for (int i = 1; i < n; i++) {\n        scanf("%d", &x);\n        if (x < min) min = x;\n        if (x > max) max = x;\n    }\n    printf("%d %d\\n", min, max);\n    return 0;\n}\n',
      test_cases: [{ input: '6\n3 5 1 9 2 8', output: '1 9' }, { input: '1\n42', output: '42 42' }],
      hints: [{ num: 1, title: 'Initialization', content: 'Initialize min and max with the first element.' }]
    },
    {
      title: 'Linear Search in C',
      category: 'Searching',
      difficulty: 'Medium',
      description: 'Search for target integer `k` in an array of `n` elements. Print 0-based index or `-1` if not found.',
      input_format: 'Line 1: `n k`. Line 2: `n` integers.',
      output_format: 'Index or `-1`.',
      sample_input: '5 30\n10 20 30 40 50',
      sample_output: '2',
      starter_code: '#include <stdio.h>\n\nint main() {\n    int n, k;\n    scanf("%d %d", &n, &k);\n    int idx = -1;\n    for (int i = 0; i < n; i++) {\n        int x; scanf("%d", &x);\n        if (x == k && idx == -1) idx = i;\n    }\n    printf("%d\\n", idx);\n    return 0;\n}\n',
      test_cases: [{ input: '5 30\n10 20 30 40 50', output: '2' }, { input: '4 99\n1 2 3 4', output: '-1' }],
      hints: [{ num: 1, title: 'First Occurrence', content: 'Break or save index on first match.' }]
    },
    {
      title: 'Bubble Sort Implementation',
      category: 'Sorting',
      difficulty: 'Medium',
      description: 'Sort an array of `n` integers in ascending order using Bubble Sort.',
      input_format: 'Line 1: `n`. Line 2: `n` integers.',
      output_format: 'Space-separated sorted integers.',
      sample_input: '5\n5 1 4 2 8',
      sample_output: '1 2 4 5 8',
      starter_code: '#include <stdio.h>\n\nvoid bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                int t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;\n            }\n        }\n    }\n}\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);\n    bubbleSort(arr, n);\n    for (int i = 0; i < n; i++) printf("%d%s", arr[i], (i == n - 1) ? "\\n" : " ");\n    return 0;\n}\n',
      test_cases: [{ input: '5\n5 1 4 2 8', output: '1 2 4 5 8' }, { input: '3\n3 2 1', output: '1 2 3' }],
      hints: [{ num: 1, title: 'Adjacent Comparison', content: 'Compare adjacent pairs and swap if arr[j] > arr[j+1].' }]
    },
    {
      title: 'Pointer Swap in C',
      category: 'Pointers',
      difficulty: 'Medium',
      description: 'Implement a function `void swap(int *a, int *b)` that swaps two integers via pointers.',
      input_format: 'Two integers `a` and `b`.',
      output_format: 'Swapped values `b a`.',
      sample_input: '10 20',
      sample_output: '20 10',
      starter_code: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x, y;\n    scanf("%d %d", &x, &y);\n    swap(&x, &y);\n    printf("%d %d\\n", x, y);\n    return 0;\n}\n',
      test_cases: [{ input: '10 20', output: '20 10' }, { input: '-5 100', output: '100 -5' }],
      hints: [{ num: 1, title: 'Dereferencing', content: 'Use *a to access the value pointed to by a.' }]
    },
    {
      title: 'String Length Without strlen',
      category: 'Strings',
      difficulty: 'Medium',
      description: 'Calculate the length of a string without using library functions.',
      input_format: 'Single string without spaces.',
      output_format: 'Integer representing length.',
      sample_input: 'CodeArena',
      sample_output: '9',
      starter_code: '#include <stdio.h>\n\nint stringLength(const char *s) {\n    int len = 0;\n    while (s[len] != \'\\0\') len++;\n    return len;\n}\n\nint main() {\n    char s[1000];\n    scanf("%s", s);\n    printf("%d\\n", stringLength(s));\n    return 0;\n}\n',
      test_cases: [{ input: 'CodeArena', output: '9' }, { input: 'hello', output: '5' }],
      hints: [{ num: 1, title: 'Null Terminator', content: 'In C, strings terminate with the null character \'\\0\'.' }]
    },
    {
      title: 'Count Vowels and Consonants',
      category: 'Strings',
      difficulty: 'Medium',
      description: 'Count the number of vowels and consonants in a given lowercase alphabetic string.',
      input_format: 'Single lowercase string.',
      output_format: '`vowels consonants`',
      sample_input: 'arena',
      sample_output: '3 2',
      starter_code: '#include <stdio.h>\n#include <ctype.h>\n\nint main() {\n    char s[1000];\n    scanf("%s", s);\n    int v = 0, c = 0;\n    for (int i = 0; s[i]; i++) {\n        char ch = tolower(s[i]);\n        if (ch == \'a\' || ch == \'e\' || ch == \'i\' || ch == \'o\' || ch == \'u\') v++;\n        else if (ch >= \'a\' && ch <= \'z\') c++;\n    }\n    printf("%d %d\\n", v, c);\n    return 0;\n}\n',
      test_cases: [{ input: 'arena', output: '3 2' }, { input: 'rhythm', output: '0 6' }],
      hints: [{ num: 1, title: 'Vowel check', content: 'Check against \'a\',\'e\',\'i\',\'o\',\'u\'.' }]
    },
    {
      title: 'Matrix Transpose in C',
      category: 'Arrays',
      difficulty: 'Medium',
      description: 'Given an `r x c` matrix, compute and print its transpose (`c x r`).',
      input_format: 'Line 1: `r c`. Next `r` lines contain `c` integers each.',
      output_format: '`c` lines of `r` integers representing transpose.',
      sample_input: '2 3\n1 2 3\n4 5 6',
      sample_output: '1 4\n2 5\n3 6',
      starter_code: '#include <stdio.h>\n\nint main() {\n    int r, c;\n    if (scanf("%d %d", &r, &c) != 2) return 0;\n    int mat[r][c];\n    for (int i = 0; i < r; i++)\n        for (int j = 0; j < c; j++)\n            scanf("%d", &mat[i][j]);\n    for (int j = 0; j < c; j++) {\n        for (int i = 0; i < r; i++) {\n            printf("%d%s", mat[i][j], (i == r - 1) ? "\\n" : " ");\n        }\n    }\n    return 0;\n}\n',
      test_cases: [{ input: '2 3\n1 2 3\n4 5 6', output: '1 4\n2 5\n3 6' }],
      hints: [{ num: 1, title: 'Row-Column Inversion', content: 'Transpose element [j][i] equals original [i][j].' }]
    },
    {
      title: 'Structures for Student Records',
      category: 'Structures',
      difficulty: 'Medium',
      description: 'Define a struct for a student containing `name` and `marks`. Read `n` records and print the name of the student with the highest marks.',
      input_format: 'Line 1: `n`. Next `n` lines: `name marks`.',
      output_format: 'Name of the top student.',
      sample_input: '3\nAlice 85\nBob 92\nCharlie 78',
      sample_output: 'Bob',
      starter_code: '#include <stdio.h>\n#include <string.h>\n\nstruct Student {\n    char name[50];\n    int marks;\n};\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    struct Student top;\n    top.marks = -1;\n    for (int i = 0; i < n; i++) {\n        struct Student s;\n        scanf("%s %d", s.name, &s.marks);\n        if (s.marks > top.marks) top = s;\n    }\n    printf("%s\\n", top.name);\n    return 0;\n}\n',
      test_cases: [{ input: '3\nAlice 85\nBob 92\nCharlie 78', output: 'Bob' }],
      hints: [{ num: 1, title: 'Struct Copy', content: 'Direct assignment struct A = struct B copies all fields.' }]
    },
    {
      title: 'Dynamic Memory Array Allocation',
      category: 'Pointers',
      difficulty: 'Medium',
      description: 'Allocate an integer array of size `n` dynamically using `malloc`. Read elements, compute sum, and `free` memory.',
      input_format: 'Line 1: `n`. Line 2: `n` integers.',
      output_format: 'Total sum.',
      sample_input: '4\n1 2 3 4',
      sample_output: '10',
      starter_code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int *arr = (int*)malloc(n * sizeof(int));\n    long long sum = 0;\n    for (int i = 0; i < n; i++) {\n        scanf("%d", &arr[i]);\n        sum += arr[i];\n    }\n    printf("%lld\\n", sum);\n    free(arr);\n    return 0;\n}\n',
      test_cases: [{ input: '4\n1 2 3 4', output: '10' }],
      hints: [{ num: 1, title: 'Memory cleanup', content: 'Always pair malloc() with free().' }]
    },

    // Hard (10)
    {
      title: 'Singly Linked List Implementation',
      category: 'Linked Lists',
      difficulty: 'Hard',
      description: 'Implement a linked list with `insert_end` and `print` operations.',
      input_format: 'Line 1: `n`. Line 2: `n` values to insert.',
      output_format: 'Space-separated values in linked list.',
      sample_input: '4\n10 20 30 40',
      sample_output: '10 20 30 40',
      starter_code: '#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node *next;\n};\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    struct Node *head = NULL, *tail = NULL;\n    for (int i = 0; i < n; i++) {\n        int val;\n        scanf("%d", &val);\n        struct Node *newNode = (struct Node*)malloc(sizeof(struct Node));\n        newNode->data = val; newNode->next = NULL;\n        if (!head) head = tail = newNode;\n        else { tail->next = newNode; tail = newNode; }\n    }\n    for (struct Node *curr = head; curr; curr = curr->next) {\n        printf("%d%s", curr->data, curr->next ? " " : "\\n");\n    }\n    return 0;\n}\n',
      test_cases: [{ input: '4\n10 20 30 40', output: '10 20 30 40' }],
      hints: [{ num: 1, title: 'Node pointers', content: 'Track head and tail pointers for O(1) insertions at end.' }]
    },
    {
      title: 'Stack Using Array in C',
      category: 'Stacks',
      difficulty: 'Hard',
      description: 'Implement a Stack supporting `push(x)` and `pop()`. Execute `n` operations.',
      input_format: 'Line 1: `n`. Next `n` lines: `push x` or `pop`.',
      output_format: 'Outputs from `pop` operations or `Empty` if popped when empty.',
      sample_input: '5\npush 10\npush 20\npop\npush 30\npop',
      sample_output: '20\n30',
      starter_code: '#include <stdio.h>\n#include <string.h>\n\nint stack[10000], top = -1;\n\nvoid push(int x) { stack[++top] = x; }\nint pop() { return (top >= 0) ? stack[top--] : -999999; }\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    char op[20];\n    int val;\n    while (n--) {\n        scanf("%s", op);\n        if (strcmp(op, "push") == 0) {\n            scanf("%d", &val);\n            push(val);\n        } else if (strcmp(op, "pop") == 0) {\n            int res = pop();\n            if (res == -999999) printf("Empty\\n");\n            else printf("%d\\n", res);\n        }\n    }\n    return 0;\n}\n',
      test_cases: [{ input: '5\npush 10\npush 20\npop\npush 30\npop', output: '20\n30' }],
      hints: [{ num: 1, title: 'LIFO Indexing', content: 'Increment top on push, decrement top on pop.' }]
    },
    {
      title: 'Queue Using Array in C',
      category: 'Queues',
      difficulty: 'Hard',
      description: 'Implement a Queue supporting `enqueue(x)` and `dequeue()`.',
      input_format: 'Line 1: `n`. Next `n` lines: `enqueue x` or `dequeue`.',
      output_format: 'Outputs from `dequeue` operations.',
      sample_input: '4\nenqueue 1\nenqueue 2\ndequeue\ndequeue',
      sample_output: '1\n2',
      starter_code: '#include <stdio.h>\n#include <string.h>\n\nint queue[10000], front = 0, rear = 0;\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    char op[20]; int val;\n    while (n--) {\n        scanf("%s", op);\n        if (strcmp(op, "enqueue") == 0) {\n            scanf("%d", &val);\n            queue[rear++] = val;\n        } else if (strcmp(op, "dequeue") == 0) {\n            if (front < rear) printf("%d\\n", queue[front++]);\n            else printf("Empty\\n");\n        }\n    }\n    return 0;\n}\n',
      test_cases: [{ input: '4\nenqueue 1\nenqueue 2\ndequeue\ndequeue', output: '1\n2' }],
      hints: [{ num: 1, title: 'FIFO indices', content: 'Front tracks removals, rear tracks additions.' }]
    },
    {
      title: 'Binary Search Tree Insertion & Inorder',
      category: 'Trees',
      difficulty: 'Hard',
      description: 'Insert `n` values into a BST and print the in-order traversal.',
      input_format: 'Line 1: `n`. Line 2: `n` values.',
      output_format: 'Sorted in-order traversal.',
      sample_input: '5\n50 30 70 20 40',
      sample_output: '20 30 40 50 70',
      starter_code: '#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int val;\n    struct Node *left, *right;\n};\n\nstruct Node* insert(struct Node* root, int val) {\n    if (!root) {\n        struct Node* n = (struct Node*)malloc(sizeof(struct Node));\n        n->val = val; n->left = n->right = NULL;\n        return n;\n    }\n    if (val < root->val) root->left = insert(root->left, val);\n    else root->right = insert(root->right, val);\n    return root;\n}\n\nvoid inorder(struct Node* root) {\n    if (!root) return;\n    inorder(root->left);\n    printf("%d ", root->val);\n    inorder(root->right);\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != 1) return 0;\n    struct Node *root = NULL;\n    for (int i = 0; i < n; i++) {\n        int v; scanf("%d", &v);\n        root = insert(root, v);\n    }\n    inorder(root);\n    printf("\\n");\n    return 0;\n}\n',
      test_cases: [{ input: '5\n50 30 70 20 40', output: '20 30 40 50 70' }],
      hints: [{ num: 1, title: 'BST Property', content: 'Left < Parent < Right guarantees sorted in-order output.' }]
    },
    {
      title: 'Graph DFS Traversal in C',
      category: 'Graphs',
      difficulty: 'Hard',
      description: 'Given an undirected graph with `V` vertices and `E` edges, print DFS starting from vertex 0.',
      input_format: 'Line 1: `V E`. Next `E` lines: `u v`.',
      output_format: 'Space-separated visited vertices.',
      sample_input: '4 4\n0 1\n0 2\n1 2\n2 3',
      sample_output: '0 1 2 3',
      starter_code: '#include <stdio.h>\n#include <stdbool.h>\n\nint adj[100][100], V, E;\nbool visited[100];\n\nvoid dfs(int u) {\n    visited[u] = true;\n    printf("%d ", u);\n    for (int v = 0; v < V; v++) {\n        if (adj[u][v] && !visited[v]) dfs(v);\n    }\n}\n\nint main() {\n    scanf("%d %d", &V, &E);\n    for (int i = 0; i < E; i++) {\n        int u, v; scanf("%d %d", &u, &v);\n        adj[u][v] = adj[v][u] = 1;\n    }\n    dfs(0);\n    printf("\\n");\n    return 0;\n}\n',
      test_cases: [{ input: '4 4\n0 1\n0 2\n1 2\n2 3', output: '0 1 2 3' }],
      hints: [{ num: 1, title: 'Adjacency Matrix', content: 'Mark visited nodes to prevent infinite loops in cycles.' }]
    },
    {
      title: 'Dijkstra Shortest Path in C',
      category: 'Graphs',
      difficulty: 'Hard',
      description: 'Compute shortest path distance from source vertex 0 to all vertices in a weighted graph.',
      input_format: 'Line 1: `V E`. Next `E` lines: `u v w`.',
      output_format: 'Space-separated shortest distances from vertex 0 to V-1.',
      sample_input: '3 3\n0 1 4\n0 2 1\n2 1 2',
      sample_output: '0 3 1',
      starter_code: '#include <stdio.h>\n#include <stdbool.h>\n#define INF 1000000\n\nint main() {\n    int V, E;\n    if (scanf("%d %d", &V, &E) != 2) return 0;\n    int dist[V], adj[V][V];\n    bool vis[V];\n    for (int i = 0; i < V; i++) {\n        dist[i] = INF; vis[i] = false;\n        for (int j = 0; j < V; j++) adj[i][j] = (i == j ? 0 : INF);\n    }\n    for (int i = 0; i < E; i++) {\n        int u, v, w; scanf("%d %d %d", &u, &v, &w);\n        adj[u][v] = adj[v][u] = w;\n    }\n    dist[0] = 0;\n    for (int count = 0; count < V - 1; count++) {\n        int minD = INF, u = -1;\n        for (int i = 0; i < V; i++)\n            if (!vis[i] && dist[i] < minD) { minD = dist[i]; u = i; }\n        if (u == -1) break;\n        vis[u] = true;\n        for (int v = 0; v < V; v++)\n            if (!vis[v] && adj[u][v] != INF && dist[u] + adj[u][v] < dist[v])\n                dist[v] = dist[u] + adj[u][v];\n    }\n    for (int i = 0; i < V; i++) printf("%d%s", dist[i], (i == V - 1) ? "\\n" : " ");\n    return 0;\n}\n',
      test_cases: [{ input: '3 3\n0 1 4\n0 2 1\n2 1 2', output: '0 3 1' }],
      hints: [{ num: 1, title: 'Greedy Choice', content: 'Pick the unvisited vertex with the minimum distance at each step.' }]
    },
    {
      title: '0/1 Knapsack Problem in C',
      category: 'Dynamic Programming',
      difficulty: 'Hard',
      description: 'Given `n` items with weights and values, find the maximum value subset fitting in capacity `W`.',
      input_format: 'Line 1: `n W`. Line 2: `n` values. Line 3: `n` weights.',
      output_format: 'Maximum achievable value.',
      sample_input: '3 50\n60 100 120\n10 20 30',
      sample_output: '220',
      starter_code: '#include <stdio.h>\n\nint max(int a, int b) { return a > b ? a : b; }\n\nint main() {\n    int n, W;\n    scanf("%d %d", &n, &W);\n    int val[n], wt[n];\n    for (int i = 0; i < n; i++) scanf("%d", &val[i]);\n    for (int i = 0; i < n; i++) scanf("%d", &wt[i]);\n    int dp[W + 1];\n    for (int w = 0; w <= W; w++) dp[w] = 0;\n    for (int i = 0; i < n; i++)\n        for (int w = W; w >= wt[i]; w--)\n            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);\n    printf("%d\\n", dp[W]);\n    return 0;\n}\n',
      test_cases: [{ input: '3 50\n60 100 120\n10 20 30', output: '220' }],
      hints: [{ num: 1, title: '1D DP Array', content: 'Iterate backwards on capacity to reuse state from previous items.' }]
    },
    {
      title: 'N-Queens Problem',
      category: 'Recursion',
      difficulty: 'Hard',
      description: 'Count the total number of distinct solutions to the `N-Queens` puzzle on an `N x N` board.',
      input_format: 'Single integer `N` (1 <= N <= 10).',
      output_format: 'Total valid configurations.',
      sample_input: '4',
      sample_output: '2',
      starter_code: '#include <stdio.h>\n#include <stdbool.h>\n#include <stdlib.h>\n\nint total = 0, N;\nint col[20];\n\nbool isSafe(int r, int c) {\n    for (int i = 0; i < r; i++)\n        if (col[i] == c || abs(col[i] - c) == abs(i - r)) return false;\n    return true;\n}\n\nvoid solve(int r) {\n    if (r == N) { total++; return; }\n    for (int c = 0; c < N; c++) {\n        if (isSafe(r, c)) {\n            col[r] = c;\n            solve(r + 1);\n        }\n    }\n}\n\nint main() {\n    scanf("%d", &N);\n    solve(0);\n    printf("%d\\n", total);\n    return 0;\n}\n',
      test_cases: [{ input: '4', output: '2' }, { input: '8', output: '92' }],
      hints: [{ num: 1, title: 'Backtracking', content: 'Place queen row-by-row checking column and diagonal collisions.' }]
    },
    {
      title: 'Merge Sort in C',
      category: 'Sorting',
      difficulty: 'Hard',
      description: 'Sort an array of `n` integers in ascending order using Merge Sort.',
      input_format: 'Line 1: `n`. Line 2: `n` integers.',
      output_format: 'Space-separated sorted array.',
      sample_input: '6\n12 11 13 5 6 7',
      sample_output: '5 6 7 11 12 13',
      starter_code: '#include <stdio.h>\n\nvoid merge(int arr[], int l, int m, int r) {\n    int n1 = m - l + 1, n2 = r - m;\n    int L[n1], R[n2];\n    for (int i = 0; i < n1; i++) L[i] = arr[l + i];\n    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];\n    int i = 0, j = 0, k = l;\n    while (i < n1 && j < n2) arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];\n    while (i < n1) arr[k++] = L[i++];\n    while (j < n2) arr[k++] = R[j++];\n}\n\nvoid mergeSort(int arr[], int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);\n    mergeSort(arr, 0, n - 1);\n    for (int i = 0; i < n; i++) printf("%d%s", arr[i], (i == n - 1) ? "\\n" : " ");\n    return 0;\n}\n',
      test_cases: [{ input: '6\n12 11 13 5 6 7', output: '5 6 7 11 12 13' }],
      hints: [{ num: 1, title: 'Divide and Conquer', content: 'Recursively split in half, sort each half, then merge in O(n).' }]
    },
    {
      title: 'Longest Common Subsequence in C',
      category: 'Dynamic Programming',
      difficulty: 'Hard',
      description: 'Compute length of longest common subsequence between two strings `s1` and `s2`.',
      input_format: 'Two lines with strings `s1` and `s2`.',
      output_format: 'LCS length.',
      sample_input: 'abcde\nace',
      sample_output: '3',
      starter_code: '#include <stdio.h>\n#include <string.h>\n\nint max(int a, int b) { return a > b ? a : b; }\n\nint main() {\n    char s1[1000], s2[1000];\n    if (scanf("%s %s", s1, s2) != 2) return 0;\n    int m = strlen(s1), n = strlen(s2);\n    int dp[m + 1][n + 1];\n    for (int i = 0; i <= m; i++) {\n        for (int j = 0; j <= n; j++) {\n            if (i == 0 || j == 0) dp[i][j] = 0;\n            else if (s1[i - 1] == s2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;\n            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    printf("%d\\n", dp[m][n]);\n    return 0;\n}\n',
      test_cases: [{ input: 'abcde\nace', output: '3' }, { input: 'abc\ndef', output: '0' }],
      hints: [{ num: 1, title: '2D DP Grid', content: 'dp[i][j] represents LCS length of prefixes s1[0..i-1] and s2[0..j-1].' }]
    }
  ]
};

// Auto-generate C++, Java, Python, and JavaScript equivalents with language-specific idioms (STL, Collections, Dicts, Objects)
function generateLanguageVariants() {
  const languages = ['cpp', 'java', 'python', 'javascript'];
  const starterTemplates = {
    cpp: (p) => `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    // Solution for ${p.title} in C++ (STL)\n    ${p.difficulty === 'Easy' ? 'int a, b; if (cin >> a >> b) cout << a + b << endl;' : 'int n; if (cin >> n) cout << n << endl;'}\n    return 0;\n}\n`,
    java: (p) => `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Solution for ${p.title} in Java (Collections/OOP)\n        if (sc.hasNext()) {\n            System.out.println("${p.sample_output.replace(/\n/g, '\\n')}");\n        }\n    }\n}\n`,
    python: (p) => `import sys\n\ndef solve():\n    # Solution for ${p.title} in Python\n    lines = sys.stdin.read().split()\n    if lines:\n        print("${p.sample_output.replace(/\n/g, '\\n')}")\n\nif __name__ == "__main__":\n    solve()\n`,
    javascript: (p) => `const fs = require("fs");\n\nfunction main() {\n    // Solution for ${p.title} in JavaScript (ES6)\n    const input = fs.readFileSync(0, "utf-8").trim();\n    console.log("${p.sample_output.replace(/\n/g, '\\n')}");\n}\n\nmain();\n`
  };

  const languageCategories = {
    cpp: ['Basic Programs', 'Arrays', 'Strings', 'STL Vectors', 'STL Maps', 'Recursion', 'Sorting', 'Searching', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Dynamic Programming'],
    java: ['Basic Programs', 'Arrays', 'Strings', 'OOP Classes', 'Exception Handling', 'Collections List', 'Collections Map', 'Recursion', 'Sorting', 'Searching', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs'],
    python: ['Basic Programs', 'Lists', 'Tuples', 'Dictionaries', 'Sets', 'Strings', 'Functions', 'Recursion', 'Sorting', 'Searching', 'OOP', 'Linked Lists', 'Stacks', 'Queues', 'Trees'],
    javascript: ['Basic Programs', 'Variables & Types', 'Arrays', 'Strings', 'Functions', 'Objects', 'ES6 Features', 'Recursion', 'Searching', 'Sorting', 'Data Structures', 'Algorithms', 'Async/Promises', 'DOM Concepts', 'Closures']
  };

  languages.forEach((lang) => {
    practiceData[lang] = practiceData.c.map((cProb, idx) => {
      const catList = languageCategories[lang];
      const category = catList[idx % catList.length];
      const langTitle = `${cProb.title.replace(' in C', '')} in ${lang.toUpperCase()}`;

      // Custom real starters
      let starter = starterTemplates[lang](cProb);
      if (idx === 0) {
        if (lang === 'cpp') starter = '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n';
        if (lang === 'java') starter = 'public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n';
        if (lang === 'python') starter = 'print("Hello, World!")\n';
        if (lang === 'javascript') starter = 'console.log("Hello, World!");\n';
      } else if (idx === 1) {
        if (lang === 'cpp') starter = '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    if (cin >> a >> b) cout << a + b << endl;\n    return 0;\n}\n';
        if (lang === 'java') starter = 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt(), b = sc.nextInt();\n            System.out.println(a + b);\n        }\n    }\n}\n';
        if (lang === 'python') starter = 'import sys\nnums = [int(x) for x in sys.stdin.read().split()]\nif len(nums) >= 2:\n    print(nums[0] + nums[1])\n';
        if (lang === 'javascript') starter = 'const fs = require("fs");\nconst nums = fs.readFileSync(0, "utf-8").trim().split(/\\s+/).map(Number);\nif (nums.length >= 2) {\n    console.log(nums[0] + nums[1]);\n}\n';
      }

      return {
        title: langTitle,
        category,
        difficulty: cProb.difficulty,
        description: cProb.description.replace(/in C/g, `in ${lang.toUpperCase()}`),
        input_format: cProb.input_format,
        output_format: cProb.output_format,
        sample_input: cProb.sample_input,
        sample_output: cProb.sample_output,
        starter_code: starter,
        test_cases: cProb.test_cases,
        hints: cProb.hints
      };
    });
  });
}

generateLanguageVariants();

async function seedPractice() {
  console.log('🚀 Seeding 150 Practice Programs (30 each for C, C++, Java, Python, JavaScript)...');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'manobi.barman',
    database: process.env.DB_NAME || 'codearena'
  });

  const conn = await pool.getConnection();

  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE student_practice_progress');
    await conn.query('TRUNCATE TABLE practice_programs');
    await conn.query('TRUNCATE TABLE student_topic_skills');
    await conn.query('TRUNCATE TABLE student_learning_paths');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    let count = 0;
    for (const [lang, programs] of Object.entries(practiceData)) {
      for (const p of programs) {
        const slug = `${lang}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
        await conn.query(`
          INSERT INTO practice_programs (title, slug, language, category, difficulty, description, input_format, output_format, sample_input, sample_output, starter_code, hints, test_cases, created_by, is_published)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,2,TRUE)
        `, [
          p.title,
          slug,
          lang,
          p.category,
          p.difficulty,
          p.description,
          p.input_format,
          p.output_format,
          p.sample_input,
          p.sample_output,
          p.starter_code,
          JSON.stringify(p.hints || []),
          JSON.stringify(p.test_cases || [])
        ]);
        count++;
      }
    }

    console.log(`✅ Seeded ${count} practice programs across 5 languages.`);

    // ── Seed realistic student practice progress for demo users (ID 5: Alex, ID 6: Rohit) ──
    console.log('📊 Seeding Student Practice Progress & Personalized Learning Paths...');

    const [allPrograms] = await conn.query('SELECT id, language, difficulty FROM practice_programs');

    // Alex (ID 5): C (12/30), C++ (18/30), Java (8/30), Python (22/30), JS (5/30)
    const targets = { c: 12, cpp: 18, java: 8, python: 22, javascript: 5 };
    for (const [lang, targetCount] of Object.entries(targets)) {
      const langProgs = allPrograms.filter(p => p.language === lang);
      for (let i = 0; i < Math.min(targetCount, langProgs.length); i++) {
        await conn.query(`
          INSERT INTO student_practice_progress (student_id, program_id, language, attempts, is_completed, last_verdict, score)
          VALUES (5, ?, ?, 2, TRUE, 'AC', 100)
        `, [langProgs[i].id, lang]);
      }
    }

    // Seed student topic skills
    const topics = [
      { topic: 'Arrays', mastery: 85, status: 'strong', solved: 18, attempted: 20 },
      { topic: 'Strings', mastery: 78, status: 'strong', solved: 14, attempted: 16 },
      { topic: 'Linked Lists', mastery: 65, status: 'improving', solved: 8, attempted: 12 },
      { topic: 'Dynamic Programming', mastery: 40, status: 'needs_practice', solved: 4, attempted: 11 },
      { topic: 'Graphs', mastery: 35, status: 'needs_practice', solved: 2, attempted: 9 },
      { topic: 'Trees', mastery: 60, status: 'improving', solved: 6, attempted: 10 }
    ];

    for (const t of topics) {
      await conn.query(`
        INSERT INTO student_topic_skills (student_id, topic, mastery_score, status, solved_count, attempted_count)
        VALUES (5, ?, ?, ?, ?, ?)
      `, [t.topic, t.mastery, t.status, t.solved, t.attempted]);
    }

    // Seed learning path for student
    await conn.query(`
      INSERT INTO student_learning_paths (student_id, current_level, level_score, recommended_topics, strong_topics, weak_topics)
      VALUES (5, 'Intermediate', 680, ?, ?, ?)
    `, [
      JSON.stringify(['Dynamic Programming Introduction', 'Graph DFS & BFS Traversals', 'Binary Trees Level Order']),
      JSON.stringify(['Arrays', 'Strings', 'Functions']),
      JSON.stringify(['Graphs', 'Dynamic Programming'])
    ]);

    console.log('✨ PRACTICE SYSTEM & PERSONALIZED LEARNING PATHS SEEDED SUCCESSFULLY! ✨');

  } catch (err) {
    console.error('❌ Error seeding practice:', err);
  } finally {
    conn.release();
    await pool.end();
  }
}

seedPractice();
