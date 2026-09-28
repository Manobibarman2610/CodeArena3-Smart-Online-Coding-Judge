'use strict';

/**
 * CODE ARENA — Comprehensive Production-Grade Seed Data Generator
 * Run: node config/seed.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { completeStarterCode } = require('../utils/normalizers');

async function seed() {
  console.log('🚀 Starting CodeArena Database Seeding...');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'manobi.barman',
    database: process.env.DB_NAME || 'codearena',
    multipleStatements: true
  });

  const conn = await pool.getConnection();

  try {
    console.log('1️⃣ Truncating tables for fresh seed...');
    await conn.query(`
      SET FOREIGN_KEY_CHECKS = 0;
      TRUNCATE TABLE ai_analyses;
      TRUNCATE TABLE user_achievements;
      TRUNCATE TABLE achievements;
      TRUNCATE TABLE notifications;
      TRUNCATE TABLE leaderboard_global;
      TRUNCATE TABLE user_activity;
      TRUNCATE TABLE assignments;
      TRUNCATE TABLE contest_participants;
      TRUNCATE TABLE contest_problems;
      TRUNCATE TABLE submissions;
      TRUNCATE TABLE contests;
      TRUNCATE TABLE user_hints;
      TRUNCATE TABLE hints;
      TRUNCATE TABLE test_cases;
      TRUNCATE TABLE problems;
      TRUNCATE TABLE users;
      SET FOREIGN_KEY_CHECKS = 1;
    `);

    // ── USERS ──────────────────────────────────────────────────────────
    console.log('3️⃣ Seeding Users (1 Admin, 3 Faculty, 12 Students)...');
    const adminPassHash   = await bcrypt.hash('Admin@123', 12);
    const facultyPassHash = await bcrypt.hash('Faculty@123', 12);
    const studentPassHash = await bcrypt.hash('Password@123', 12);

    const usersData = [
      // Admin
      ['Arena Admin', 'admin@codearena.io', adminPassHash, 'admin', 'CodeArena HQ', 2800, 120, '2026-08-15'],
      // Faculty
      ['Prof. Priya Sharma', 'sharma@faculty.com', facultyPassHash, 'faculty', 'NIT Trichy', 2350, 45, '2026-08-14'],
      ['Dr. Arjun Mehta', 'mehta@faculty.com', facultyPassHash, 'faculty', 'IIT Delhi', 2420, 60, '2026-08-15'],
      ['Prof. S. K. Verma', 'verma@faculty.com', facultyPassHash, 'faculty', 'BITS Pilani', 2150, 30, '2026-08-12'],
      // Students
      ['Alex Coder', 'alex@student.com', studentPassHash, 'student', 'IIT Bombay', 1840, 32, '2026-08-15'],
      ['Rohit Kumar', 'rohit@student.com', studentPassHash, 'student', 'IIT Delhi', 2755, 50, '2026-08-15'],
      ['Sara Johnson', 'sara@student.com', studentPassHash, 'student', 'Stanford University', 2210, 24, '2026-08-14'],
      ['Dev Patel', 'dev@student.com', studentPassHash, 'student', 'NIT Trichy', 1620, 18, '2026-08-15'],
      ['Ananya Iyer', 'ananya@student.com', studentPassHash, 'student', 'IIIT Hyderabad', 1980, 29, '2026-08-13'],
      ['Vikram Singh', 'vikram@student.com', studentPassHash, 'student', 'BITS Pilani', 1740, 15, '2026-08-14'],
      ['Kavya Nair', 'kavya@student.com', studentPassHash, 'student', 'IIT Madras', 2100, 40, '2026-08-15'],
      ['Aarav Gupta', 'aarav@student.com', studentPassHash, 'student', 'Delhi Tech University', 1530, 9, '2026-08-11'],
      ['Meera Sen', 'meera@student.com', studentPassHash, 'student', 'Jadavpur University', 1890, 22, '2026-08-15'],
      ['Rohan Verma', 'rohan@student.com', studentPassHash, 'student', 'IIT Roorkee', 1670, 14, '2026-08-12'],
      ['Neha Reddy', 'neha@student.com', studentPassHash, 'student', 'IIT Kharagpur', 2050, 35, '2026-08-15'],
      ['Aditya Joshi', 'aditya@student.com', studentPassHash, 'student', 'PES University', 1420, 7, '2026-08-10']
    ];

    for (const u of usersData) {
      await conn.query(`
        INSERT INTO users (name, email, password_hash, role, institution, rating, streak, last_active)
        VALUES (?,?,?,?,?,?,?,?)
      `, u);
    }

    // ── PROBLEMS (23 High Quality DSA Problems) ────────────────────────
    console.log('4️⃣ Seeding 23 Coding Problems across all Topics and Difficulties...');
    const problems = [
      {
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        description: '## Two Sum\n\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n### Input Format\nFirst line contains integer `n`.\nSecond line contains `n` space-separated integers `nums`.\nThird line contains integer `target`.\n\n### Output Format\nPrint the two 0-based indices separated by a space in ascending order.',
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
        sample_input: '4\n2 7 11 15\n9',
        sample_output: '0 1',
        topics: ['Array', 'Hash Map'],
        starter_code: {
          python: 'import sys\n\ndef two_sum(nums, target):\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    lines = sys.stdin.read().split()\n    if lines:\n        n = int(lines[0])\n        nums = [int(x) for x in lines[1:n+1]]\n        target = int(lines[n+1])\n        ans = two_sum(nums, target)\n        if ans:\n            print(f"{ans[0]} {ans[1]}")\n',
          javascript: 'const fs = require("fs");\nconst input = fs.readFileSync("/dev/stdin", "utf-8").trim().split(/\\s+/);\nif (input.length >= 3) {\n  const n = parseInt(input[0]);\n  const nums = input.slice(1, n + 1).map(Number);\n  const target = parseInt(input[n + 1]);\n  // Write solution here\n}\n',
          cpp: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; ++i) cin >> nums[i];\n    int target;\n    cin >> target;\n    // Write solution here\n    return 0;\n}\n',
          java: 'import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        // Write solution here\n    }\n}\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 2,
        test_cases: [
          { input: '4\n2 7 11 15\n9', output: '0 1', is_sample: true, explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
          { input: '3\n3 2 4\n6', output: '1 2', is_sample: true, explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
          { input: '2\n3 3\n6', output: '0 1', is_sample: false },
          { input: '5\n1 5 3 7 9\n12', output: '1 3', is_sample: false },
          { input: '6\n-3 4 3 90 -10 20\n10', output: '4 5', is_sample: false }
        ],
        hints: [
          { num: 1, title: 'Brute Force vs Optimized', content: 'A brute force approach scans all pairs in O(n^2). Can you do better using extra space?' },
          { num: 2, title: 'Using a Hash Map', content: 'When iterating over number x at index i, you need target - x. Have we seen it before?' },
          { num: 3, title: 'One-Pass Algorithm', content: 'Store seen values in a map mapping value -> index. For each number x, check if (target - x) is already in the map.' }
        ]
      },
      {
        title: 'Valid Parentheses',
        slug: 'valid-parentheses',
        difficulty: 'Easy',
        description: '## Valid Parentheses\n\nGiven a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
        constraints: '1 <= s.length <= 10^4\n`s` consists of parentheses only `()[]{}`.',
        sample_input: '()[]{}',
        sample_output: 'true',
        topics: ['Stack', 'String'],
        starter_code: {
          python: 'import sys\n\ndef is_valid(s: str) -> bool:\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    print("true" if is_valid(s) else "false")\n'
        },
        time_limit_ms: 1000,
        memory_limit_mb: 128,
        created_by: 2,
        test_cases: [
          { input: '()[]{}', output: 'true', is_sample: true },
          { input: '(]', output: 'false', is_sample: true },
          { input: '([{}])', output: 'true', is_sample: false },
          { input: '(((((', output: 'false', is_sample: false },
          { input: '{[()]}', output: 'true', is_sample: false }
        ],
        hints: [
          { num: 1, title: 'LIFO Property', content: 'The most recently opened bracket must be the first one closed.' },
          { num: 2, title: 'Stack Data Structure', content: 'Push open brackets onto a stack. When a closing bracket is found, pop and compare.' },
          { num: 3, title: 'Empty Check', content: 'At the end of iteration, the stack must be completely empty.' }
        ]
      },
      {
        title: 'Maximum Subarray',
        slug: 'maximum-subarray',
        difficulty: 'Medium',
        description: '## Maximum Subarray (Kadane\'s Algorithm)\n\nGiven an integer array `nums`, find the subarray with the largest sum, and return its sum.',
        constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
        sample_input: '9\n-2 1 -3 4 -1 2 1 -5 4',
        sample_output: '6',
        topics: ['Array', 'Dynamic Programming'],
        starter_code: {
          python: 'import sys\n\ndef max_sub_array(nums):\n    # Write Kadane\'s algorithm\n    pass\n\nif __name__ == "__main__":\n    raw = sys.stdin.read().split()\n    if raw:\n        n = int(raw[0])\n        nums = [int(x) for x in raw[1:n+1]]\n        print(max_sub_array(nums))\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 3,
        test_cases: [
          { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', is_sample: true, explanation: '[4,-1,2,1] has the largest sum = 6.' },
          { input: '1\n1', output: '1', is_sample: true },
          { input: '5\n5 4 -1 7 8', output: '23', is_sample: false },
          { input: '4\n-5 -2 -8 -1', output: '-1', is_sample: false }
        ],
        hints: [
          { num: 1, title: 'Greedy Choice', content: 'If the running sum becomes negative, it cannot contribute positively to any future subarray.' },
          { num: 2, title: 'Kadane\'s Recurrence', content: 'current_sum = max(nums[i], current_sum + nums[i])' },
          { num: 3, title: 'Global Maximum', content: 'Track max_sum = max(max_sum, current_sum) across all elements.' }
        ]
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        slug: 'longest-substring-without-repeating-characters',
        difficulty: 'Medium',
        description: '## Longest Substring Without Repeating Characters\n\nGiven a string `s`, find the length of the longest substring without repeating characters.',
        constraints: '0 <= s.length <= 5 * 10^4\n`s` consists of English letters, digits, symbols and spaces.',
        sample_input: 'abcabcbb',
        sample_output: '3',
        topics: ['Hash Table', 'String', 'Sliding Window'],
        starter_code: {
          python: 'import sys\n\ndef length_of_longest_substring(s: str) -> int:\n    pass\n\nif __name__ == "__main__":\n    s = sys.stdin.read().rstrip("\\n")\n    print(length_of_longest_substring(s))\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 2,
        test_cases: [
          { input: 'abcabcbb', output: '3', is_sample: true },
          { input: 'bbbbb', output: '1', is_sample: true },
          { input: 'pwwkew', output: '3', is_sample: true },
          { input: 'au', output: '2', is_sample: false },
          { input: 'dvdf', output: '3', is_sample: false }
        ],
        hints: [
          { num: 1, title: 'Sliding Window', content: 'Use two pointers [left, right] representing the current valid substring.' },
          { num: 2, title: 'Last Seen Map', content: 'Keep track of the last index where each character appeared in a Hash Map.' },
          { num: 3, title: 'Pointer Jump', content: 'When a duplicate is encountered, move the left pointer to max(left, last_index[char] + 1).' }
        ]
      },
      {
        title: 'Reverse Linked List',
        slug: 'reverse-linked-list',
        difficulty: 'Easy',
        description: '## Reverse Linked List\n\nGiven the head of a singly linked list, reverse the list, and return the reversed list.\n\n### Input Format\nFirst line contains integer `n`.\nSecond line contains `n` space-separated elements.\n\n### Output Format\nSpace-separated elements of the reversed list.',
        constraints: 'The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000',
        sample_input: '5\n1 2 3 4 5',
        sample_output: '5 4 3 2 1',
        topics: ['Linked List', 'Recursion'],
        starter_code: {
          python: 'import sys\n\ndef reverse_list(arr):\n    # Return reversed list\n    return arr[::-1]\n\nif __name__ == "__main__":\n    raw = sys.stdin.read().split()\n    if raw:\n        n = int(raw[0])\n        arr = raw[1:n+1]\n        print(" ".join(reverse_list(arr)))\n'
        },
        time_limit_ms: 1000,
        memory_limit_mb: 128,
        created_by: 3,
        test_cases: [
          { input: '5\n1 2 3 4 5', output: '5 4 3 2 1', is_sample: true },
          { input: '2\n1 2', output: '2 1', is_sample: true },
          { input: '1\n99', output: '99', is_sample: false }
        ],
        hints: [
          { num: 1, title: 'Pointer Manipulation', content: 'Maintain three pointers: prev (null), curr (head), and next (curr.next).' },
          { num: 2, title: 'Reversal Step', content: 'At each step: curr.next = prev; prev = curr; curr = next;' },
          { num: 3, title: 'Return New Head', content: 'When curr is null, prev is the new head of the reversed list.' }
        ]
      },
      {
        title: 'Merge Two Sorted Lists',
        slug: 'merge-two-sorted-lists',
        difficulty: 'Easy',
        description: '## Merge Two Sorted Lists\n\nYou are given the heads of two sorted linked lists `list1` and `list2`.\nMerge the two lists into one sorted list.\n\n### Input Format\nLine 1: `n` (length of list1)\nLine 2: `n` elements of list1\nLine 3: `m` (length of list2)\nLine 4: `m` elements of list2',
        constraints: 'The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth lists are sorted in non-decreasing order.',
        sample_input: '3\n1 2 4\n3\n1 3 4',
        sample_output: '1 1 2 3 4 4',
        topics: ['Linked List', 'Recursion', 'Two Pointers'],
        starter_code: {
          python: 'import sys\n\ndef merge_sorted(l1, l2):\n    # Return merged sorted array\n    pass\n\nif __name__ == "__main__":\n    raw = sys.stdin.read().split()\n    if raw:\n        n = int(raw[0])\n        l1 = [int(x) for x in raw[1:n+1]]\n        m = int(raw[n+1])\n        l2 = [int(x) for x in raw[n+2:n+2+m]]\n        res = sorted(l1 + l2)\n        print(" ".join(map(str, res)))\n'
        },
        time_limit_ms: 1000,
        memory_limit_mb: 128,
        created_by: 2,
        test_cases: [
          { input: '3\n1 2 4\n3\n1 3 4', output: '1 1 2 3 4 4', is_sample: true },
          { input: '0\n\n1\n0', output: '0', is_sample: true },
          { input: '2\n5 10\n3\n1 7 12', output: '1 5 7 10 12', is_sample: false }
        ],
        hints: [
          { num: 1, title: 'Dummy Head', content: 'Use a dummy node to easily build the merged linked list.' },
          { num: 2, title: 'Two Pointers', content: 'Compare curr1.val and curr2.val, attach the smaller one and advance that pointer.' }
        ]
      },
      {
        title: 'Container With Most Water',
        slug: 'container-with-most-water',
        difficulty: 'Medium',
        description: '## Container With Most Water\n\nYou are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\nReturn the maximum amount of water a container can store.',
        constraints: 'n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4',
        sample_input: '9\n1 8 6 2 5 4 8 3 7',
        sample_output: '49',
        topics: ['Array', 'Two Pointers', 'Greedy'],
        starter_code: {
          python: 'import sys\n\ndef max_area(height):\n    pass\n\nif __name__ == "__main__":\n    raw = sys.stdin.read().split()\n    if raw:\n        n = int(raw[0])\n        h = [int(x) for x in raw[1:n+1]]\n        print(max_area(h))\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 3,
        test_cases: [
          { input: '9\n1 8 6 2 5 4 8 3 7', output: '49', is_sample: true },
          { input: '2\n1 1', output: '1', is_sample: true },
          { input: '5\n4 3 2 1 4', output: '16', is_sample: false }
        ],
        hints: [
          { num: 1, title: 'Two Pointers from Outermost', content: 'Start with left=0 and right=n-1 to maximize width.' },
          { num: 2, title: 'Greedy Move', content: 'Area is constrained by min(height[left], height[right]). Moving the taller pointer cannot increase area, so always move the shorter one.' }
        ]
      },
      {
        title: '3Sum',
        slug: '3sum',
        difficulty: 'Medium',
        description: '## 3Sum\n\nGiven an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.',
        constraints: '3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5',
        sample_input: '6\n-1 0 1 2 -1 -4',
        sample_output: '-1 -1 2\n-1 0 1',
        topics: ['Array', 'Two Pointers', 'Sorting'],
        starter_code: {
          python: 'import sys\n\ndef three_sum(nums):\n    pass\n'
        },
        time_limit_ms: 3000,
        memory_limit_mb: 256,
        created_by: 2,
        test_cases: [
          { input: '6\n-1 0 1 2 -1 -4', output: '-1 -1 2\n-1 0 1', is_sample: true },
          { input: '3\n0 1 1', output: '', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Sort First', content: 'Sorting the array makes duplicate handling and two-pointer traversal much easier.' },
          { num: 2, title: 'Fix First Element', content: 'Iterate through i, then use two pointers left=i+1 and right=n-1 to find pairs adding to -nums[i].' }
        ]
      },
      {
        title: 'Binary Search',
        slug: 'binary-search',
        difficulty: 'Easy',
        description: '## Binary Search\n\nGiven an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
        constraints: '1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll integers in nums are unique and sorted in ascending order.',
        sample_input: '6\n-1 0 3 5 9 12\n9',
        sample_output: '4',
        topics: ['Array', 'Binary Search'],
        starter_code: {
          python: 'import sys\n\ndef search(nums, target):\n    pass\n'
        },
        time_limit_ms: 1000,
        memory_limit_mb: 128,
        created_by: 2,
        test_cases: [
          { input: '6\n-1 0 3 5 9 12\n9', output: '4', is_sample: true },
          { input: '6\n-1 0 3 5 9 12\n2', output: '-1', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Divide and Conquer', content: 'Compare target with nums[mid]. If equal, return mid.' },
          { num: 2, title: 'Adjust Bounds', content: 'If target < nums[mid], search left half (high = mid - 1); else search right half.' }
        ]
      },
      {
        title: 'Search in Rotated Sorted Array',
        slug: 'search-in-rotated-sorted-array',
        difficulty: 'Medium',
        description: '## Search in Rotated Sorted Array\n\nThere is an integer array `nums` sorted in ascending order with distinct values. Given the array `nums` after possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
        constraints: '1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4\nAll values of nums are unique.',
        sample_input: '7\n4 5 6 7 0 1 2\n0',
        sample_output: '4',
        topics: ['Array', 'Binary Search'],
        starter_code: {
          python: 'import sys\n\ndef search_rotated(nums, target):\n    pass\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 3,
        test_cases: [
          { input: '7\n4 5 6 7 0 1 2\n0', output: '4', is_sample: true },
          { input: '7\n4 5 6 7 0 1 2\n3', output: '-1', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Identify Sorted Half', content: 'In any rotated array, at least one half [low, mid] or [mid, high] is always strictly sorted.' },
          { num: 2, title: 'Check Range', content: 'Check if target lies inside the sorted half. If so, binary search there, otherwise search the other half.' }
        ]
      },
      {
        title: 'Coin Change',
        slug: 'coin-change',
        difficulty: 'Medium',
        description: '## Coin Change\n\nYou are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.',
        constraints: '1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4',
        sample_input: '3\n1 2 5\n11',
        sample_output: '3',
        topics: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
        starter_code: {
          python: 'import sys\n\ndef coin_change(coins, amount):\n    pass\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 2,
        test_cases: [
          { input: '3\n1 2 5\n11', output: '3', is_sample: true, explanation: '11 = 5 + 5 + 1' },
          { input: '1\n2\n3', output: '-1', is_sample: true },
          { input: '1\n1\n0', output: '0', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Bottom-Up DP', content: 'Define dp[i] as the minimum coins needed for amount i.' },
          { num: 2, title: 'State Transition', content: 'dp[i] = min(dp[i - c] + 1) for all c in coins where i >= c.' }
        ]
      },
      {
        title: 'Longest Increasing Subsequence',
        slug: 'longest-increasing-subsequence',
        difficulty: 'Medium',
        description: '## Longest Increasing Subsequence\n\nGiven an integer array `nums`, return the length of the longest strictly increasing subsequence.',
        constraints: '1 <= nums.length <= 2500\n-10^4 <= nums[i] <= 10^4',
        sample_input: '8\n10 9 2 5 3 7 101 18',
        sample_output: '4',
        topics: ['Array', 'Binary Search', 'Dynamic Programming'],
        starter_code: {
          python: 'import sys\n\ndef length_of_lis(nums):\n    pass\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 3,
        test_cases: [
          { input: '8\n10 9 2 5 3 7 101 18', output: '4', is_sample: true, explanation: 'The longest increasing subsequence is [2, 3, 7, 101], length = 4.' },
          { input: '6\n0 1 0 3 2 3', output: '4', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'O(N^2) DP Baseline', content: 'dp[i] is the length of LIS ending at index i. Compare with all j < i.' },
          { num: 2, title: 'O(N log N) Patience Sorting', content: 'Maintain an array tails where tails[i] is the smallest tail of all increasing subsequences of length i+1.' }
        ]
      },
      {
        title: 'Number of Islands',
        slug: 'number-of-islands',
        difficulty: 'Medium',
        description: '## Number of Islands\n\nGiven an `m x n` 2D binary grid `grid` which represents a map of `1`s (land) and `0`s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
        constraints: 'm == grid.length\nn == grid[i].length\n1 <= m, n <= 300\ngrid[i][j] is \'0\' or \'1\'.',
        sample_input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0',
        sample_output: '1',
        topics: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
        starter_code: {
          python: 'import sys\n\ndef num_islands(grid):\n    pass\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 2,
        test_cases: [
          { input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', output: '1', is_sample: true },
          { input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', output: '3', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Connected Components', content: 'Each island is a connected component of 1s in an undirected grid graph.' },
          { num: 2, title: 'DFS Sink Technique', content: 'When you find a 1, increment island count and run DFS/BFS to mark all connected 1s as 0.' }
        ]
      },
      {
        title: 'Course Schedule',
        slug: 'course-schedule',
        difficulty: 'Medium',
        description: '## Course Schedule\n\nThere are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that you must take course `b_i` first if you want to take course `a_i`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false`.',
        constraints: '1 <= numCourses <= 2000\n0 <= prerequisites.length <= 5000\nAll prerequisite pairs are unique.',
        sample_input: '2 1\n1 0',
        sample_output: 'true',
        topics: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
        starter_code: {
          python: 'import sys\n\ndef can_finish(numCourses, prerequisites):\n    pass\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 3,
        test_cases: [
          { input: '2 1\n1 0', output: 'true', is_sample: true },
          { input: '2 2\n1 0\n0 1', output: 'false', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Cycle Detection in Directed Graph', content: 'The problem is equivalent to detecting if a directed graph contains a cycle.' },
          { num: 2, title: 'Kahn\'s Algorithm', content: 'Track in-degrees of each course. Repeatedly process courses with 0 in-degree.' }
        ]
      },
      {
        title: 'LRU Cache',
        slug: 'lru-cache',
        difficulty: 'Medium',
        description: '## LRU Cache\n\nDesign a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n- `int get(int key)` Return the value of the key if it exists, otherwise return -1.\n- `void put(int key, int value)` Update or insert the value.\n\nBoth functions must run in `O(1)` average time complexity.',
        constraints: '1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5',
        sample_input: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2',
        sample_output: '1\n-1',
        topics: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'],
        starter_code: {
          python: 'import sys\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        pass\n    def put(self, key: int, value: int) -> None:\n        pass\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 2,
        test_cases: [
          { input: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2', output: '1\n-1', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Doubly Linked List + Map', content: 'A Hash Map gives O(1) lookups. A Doubly Linked List gives O(1) node removals and insertions at head/tail.' }
        ]
      },
      {
        title: 'Trapping Rain Water',
        slug: 'trapping-rain-water',
        difficulty: 'Hard',
        description: '## Trapping Rain Water\n\nGiven `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
        constraints: 'n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5',
        sample_input: '12\n0 1 0 2 1 0 1 3 2 1 2 1',
        sample_output: '6',
        topics: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Monotonic Stack'],
        starter_code: {
          python: 'import sys\n\ndef trap(height):\n    pass\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 3,
        test_cases: [
          { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', output: '6', is_sample: true },
          { input: '6\n4 2 0 3 2 5', output: '9', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Water at Index i', content: 'Water trapped above bar i = min(max_left, max_right) - height[i].' },
          { num: 2, title: 'Two Pointers Optimization', content: 'Use left and right pointers moving inward, keeping track of max_left and max_right in O(1) space.' }
        ]
      },
      {
        title: 'Median of Two Sorted Arrays',
        slug: 'median-of-two-sorted-arrays',
        difficulty: 'Hard',
        description: '## Median of Two Sorted Arrays\n\nGiven two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.\nFormat floating results to 5 decimal places.',
        constraints: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000',
        sample_input: '2\n1 3\n1\n2',
        sample_output: '2.00000',
        topics: ['Array', 'Binary Search', 'Divide and Conquer'],
        starter_code: {
          python: 'import sys\n\ndef find_median_sorted_arrays(nums1, nums2):\n    pass\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 2,
        test_cases: [
          { input: '2\n1 3\n1\n2', output: '2.00000', is_sample: true },
          { input: '2\n1 2\n2\n3 4', output: '2.50000', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Binary Search Partition', content: 'Binary search on the smaller array to partition both arrays such that left half has equal elements to right half.' }
        ]
      },
      {
        title: 'Burst Balloons',
        slug: 'burst-balloons',
        difficulty: 'Hard',
        description: '## Burst Balloons\n\nYou are given `n` balloons, indexed from `0` to `n - 1`. Each balloon is painted with a number on it represented by an array `nums`. You are asked to burst all the balloons.\n\nIf you burst the `i-th` balloon, you will get `nums[i - 1] * nums[i] * nums[i + 1]` coins. If `i - 1` or `i + 1` goes out of bounds of the array, then treat it as if there is a balloon with a `1` painted on it.\n\nReturn the maximum coins you can collect by bursting the balloons wisely.',
        constraints: 'n == nums.length\n1 <= n <= 300\n0 <= nums[i] <= 100',
        sample_input: '4\n3 1 5 8',
        sample_output: '167',
        topics: ['Array', 'Dynamic Programming'],
        starter_code: {
          python: 'import sys\n\ndef max_coins(nums):\n    pass\n'
        },
        time_limit_ms: 3000,
        memory_limit_mb: 256,
        created_by: 3,
        test_cases: [
          { input: '4\n3 1 5 8', output: '167', is_sample: true, explanation: 'Burst 1, then 5, then 3, then 8.' },
          { input: '2\n1 5', output: '10', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Think Backwards', content: 'Instead of choosing which balloon to burst first, choose which balloon to burst LAST in interval [i, j].' },
          { num: 2, title: 'Interval DP', content: 'dp[i][j] = max(dp[i][k-1] + dp[k+1][j] + nums[i-1]*nums[k]*nums[j+1]) for k in [i, j].' }
        ]
      },
      {
        title: 'Binary Tree Level Order Traversal',
        slug: 'binary-tree-level-order-traversal',
        difficulty: 'Medium',
        description: '## Binary Tree Level Order Traversal\n\nGiven the root of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).\n\n### Input Format\nLevel-order array with `null` representing empty nodes.',
        constraints: 'The number of nodes in the tree is in the range [0, 2000].\n-1000 <= Node.val <= 1000',
        sample_input: '3 9 20 null null 15 7',
        sample_output: '3\n9 20\n15 7',
        topics: ['Tree', 'Breadth-First Search', 'Binary Tree'],
        starter_code: {
          python: 'import sys\n# BFS Level order\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 2,
        test_cases: [
          { input: '3 9 20 null null 15 7', output: '3\n9 20\n15 7', is_sample: true },
          { input: '1', output: '1', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Queue for BFS', content: 'Use a FIFO queue. Record the size of the queue at the start of each level.' }
        ]
      },
      {
        title: 'Validate Binary Search Tree',
        slug: 'validate-binary-search-tree',
        difficulty: 'Medium',
        description: '## Validate Binary Search Tree\n\nGiven the root of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys strictly less than the node\'s key.\n- The right subtree of a node contains only nodes with keys strictly greater than the node\'s key.\n- Both the left and right subtrees must also be binary search trees.',
        constraints: 'The number of nodes in the tree is in the range [1, 10^4].\n-2^31 <= Node.val <= 2^31 - 1',
        sample_input: '2 1 3',
        sample_output: 'true',
        topics: ['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree'],
        starter_code: {
          python: 'import sys\n# Validate BST\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 3,
        test_cases: [
          { input: '2 1 3', output: 'true', is_sample: true },
          { input: '5 1 4 null null 3 6', output: 'false', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Min/Max Range Propagation', content: 'Pass down (min_allowed, max_allowed) bounds as you traverse recursively.' }
        ]
      },
      {
        title: 'Word Break',
        slug: 'word-break',
        difficulty: 'Medium',
        description: '## Word Break\n\nGiven a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.',
        constraints: '1 <= s.length <= 300\n1 <= wordDict.length <= 1000\n1 <= wordDict[i].length <= 20',
        sample_input: 'leetcode\n2\nleet code',
        sample_output: 'true',
        topics: ['Hash Table', 'String', 'Dynamic Programming', 'Trie', 'Memoization'],
        starter_code: {
          python: 'import sys\n# Word break DP\n'
        },
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        created_by: 2,
        test_cases: [
          { input: 'leetcode\n2\nleet code', output: 'true', is_sample: true },
          { input: 'applepenapple\n2\napple pen', output: 'true', is_sample: true },
          { input: 'catsandog\n5\ncats dog sand and cat', output: 'false', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'DP Array', content: 'dp[i] is true if s[0...i] can be segmented into dictionary words.' }
        ]
      },
      {
        title: 'Neural Graph Traversal',
        slug: 'neural-graph-traversal',
        difficulty: 'Expert',
        description: '## Neural Graph Traversal\n\nAdvanced shortest path on a weighted directed acyclic graph with capacity and latency constraints. Find the minimum latency path having bottleneck bandwidth >= B.',
        constraints: 'V <= 10^4, E <= 5 * 10^4\nAll edge weights > 0',
        sample_input: '4 4 10\n1 2 5 20\n2 4 4 15\n1 3 2 5\n3 4 3 5',
        sample_output: '9',
        topics: ['Graph', 'Dijkstra', 'Binary Search', 'Shortest Path'],
        starter_code: {
          python: 'import sys\n# Neural graph solver\n'
        },
        time_limit_ms: 4000,
        memory_limit_mb: 512,
        created_by: 3,
        test_cases: [
          { input: '4 4 10\n1 2 5 20\n2 4 4 15\n1 3 2 5\n3 4 3 5', output: '9', is_sample: true }
        ],
        hints: [
          { num: 1, title: 'Filter Edges', content: 'First filter edges with bandwidth < B, then run standard Dijkstra for shortest latency.' }
        ]
      },
      {
        title: 'Inorder Traversal of a BST',
        slug: 'inorder-bst-traversal',
        difficulty: 'Easy',
        description: '## Inorder Traversal of a Binary Search Tree\n\nInsert the given integers into a binary search tree in the order provided, then print the inorder traversal. Inorder traversal visits the left subtree, the current node, and then the right subtree.\n\n### Input Format\nThe first line contains `n`, the number of values. The second line contains `n` integers.\n\n### Output Format\nPrint the inorder values in ascending order, separated by spaces.',
        constraints: '1 <= n <= 1000\n-10^9 <= value <= 10^9',
        sample_input: '4\n3 5 7 2',
        sample_output: '2 3 5 7',
        topics: ['Tree', 'Binary Search Tree', 'Inorder Traversal'],
        starter_code: {
          c: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int value; struct Node *left, *right; } Node;
Node *insert(Node *root, int value) {
    if (!root) { Node *n = malloc(sizeof(Node)); n->value = value; n->left = n->right = NULL; return n; }
    if (value < root->value) root->left = insert(root->left, value);
    else root->right = insert(root->right, value);
    return root;
}
void inorder(Node *root, int *first) {
    if (!root) return;
    inorder(root->left, first);
    printf("%s%d", *first ? "" : " ", root->value); *first = 0;
    inorder(root->right, first);
}
int main(void) {
    int n, value;
    if (scanf("%d", &n) != 1) return 0;
    Node *root = NULL;
    for (int i = 0; i < n; i++) { if (scanf("%d", &value) != 1) return 0; root = insert(root, value); }
    int first = 1; inorder(root, &first); putchar('\\n');
    return 0;
}`,
          cpp: `#include <iostream>
using namespace std;
struct Node { int value; Node *left = nullptr, *right = nullptr; explicit Node(int v): value(v) {} };
Node *insert(Node *root, int value) {
    if (!root) return new Node(value);
    if (value < root->value) root->left = insert(root->left, value);
    else root->right = insert(root->right, value);
    return root;
}
void inorder(Node *root, bool &first) {
    if (!root) return;
    inorder(root->left, first);
    if (!first) cout << ' ';
    cout << root->value; first = false;
    inorder(root->right, first);
}
int main() {
    int n, value;
    if (!(cin >> n)) return 0;
    Node *root = nullptr;
    while (n--) { cin >> value; root = insert(root, value); }
    bool first = true; inorder(root, first); cout << '\\n';
}`,
          java: `import java.util.*;
public class Solution {
    static class Node { int value; Node left, right; Node(int value) { this.value = value; } }
    static Node insert(Node root, int value) {
        if (root == null) return new Node(value);
        if (value < root.value) root.left = insert(root.left, value);
        else root.right = insert(root.right, value);
        return root;
    }
    static void inorder(Node root, List<Integer> result) {
        if (root == null) return;
        inorder(root.left, result); result.add(root.value); inorder(root.right, result);
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt(); Node root = null;
        for (int i = 0; i < n; i++) root = insert(root, sc.nextInt());
        List<Integer> result = new ArrayList<>(); inorder(root, result);
        for (int i = 0; i < result.size(); i++) { if (i > 0) System.out.print(" "); System.out.print(result.get(i)); }
        System.out.println();
    }
}`,
          python: `import sys

class Node:
    def __init__(self, value):
        self.value = value
        self.left = self.right = None

def insert(root, value):
    if root is None:
        return Node(value)
    if value < root.value:
        root.left = insert(root.left, value)
    else:
        root.right = insert(root.right, value)
    return root

def inorder(root, result):
    if root is not None:
        inorder(root.left, result)
        result.append(root.value)
        inorder(root.right, result)

data = list(map(int, sys.stdin.buffer.read().split()))
if data:
    n = data[0]
    root = None
    for value in data[1:n + 1]:
        root = insert(root, value)
    result = []
    inorder(root, result)
    print(*result)` ,
          javascript: `const fs = require('fs');
const data = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).filter(Boolean).map(Number);
if (data.length) {
  const n = data[0];
  function insert(root, value) {
    if (!root) return { value, left: null, right: null };
    if (value < root.value) root.left = insert(root.left, value);
    else root.right = insert(root.right, value);
    return root;
  }
  function inorder(root, result) {
    if (!root) return;
    inorder(root.left, result); result.push(root.value); inorder(root.right, result);
  }
  let root = null;
  for (const value of data.slice(1, n + 1)) root = insert(root, value);
  const result = [];
  inorder(root, result);
  console.log(result.join(' '));
}`
        },
        time_limit_ms: 2000,
        memory_limit_mb: 128,
        created_by: 2,
        test_cases: [
          { input: '4\n3 5 7 2', output: '2 3 5 7', is_sample: true },
          { input: '6\n8 3 10 1 6 14', output: '1 3 6 8 10 14', is_sample: false },
          { input: '5\n5 3 7 3 7', output: '3 3 5 7 7', is_sample: false }
        ],
        hints: [
          { num: 1, title: 'Build the BST', content: 'Insert values one at a time, placing smaller values left and other values right.' },
          { num: 2, title: 'Inorder order', content: 'Visit left child, current node, then right child.' }
        ]
      }
    ];

    for (const p of problems) {
      const [res] = await conn.query(`
        INSERT INTO problems (title, slug, difficulty, description, constraints, sample_input, sample_output, time_limit_ms, memory_limit_mb, topics, starter_code, created_by, is_public, accepted_count, total_count)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `, [
        p.title,
        p.slug,
        p.difficulty,
        p.description,
        p.constraints,
        p.sample_input,
        p.sample_output,
        p.time_limit_ms,
        p.memory_limit_mb,
        JSON.stringify(p.topics),
        JSON.stringify(completeStarterCode(p.starter_code || {})),
        p.created_by,
        true,
        Math.floor(Math.random() * 40) + 10,
        Math.floor(Math.random() * 80) + 50
      ]);

      const probId = res.insertId;

      // Test Cases
      for (const tc of p.test_cases) {
        await conn.query(`
          INSERT INTO test_cases (problem_id, input, output, is_sample, explanation)
          VALUES (?,?,?,?,?)
        `, [probId, tc.input, tc.output, tc.is_sample || false, tc.explanation || null]);
      }

      // Hints
      for (const h of p.hints) {
        await conn.query(`
          INSERT INTO hints (problem_id, hint_number, title, content, penalty_points)
          VALUES (?,?,?,?,?)
        `, [probId, h.num, h.title, h.content, h.num * 5]);
      }
    }

    // ── CONTESTS ───────────────────────────────────────────────────────
    console.log('5️⃣ Seeding 3 Contests & Contest Problems...');
    const now = new Date();
    const liveStart = new Date(now.getTime() - 45 * 60 * 1000); // started 45m ago
    const liveEnd   = new Date(now.getTime() + 75 * 60 * 1000); // ends in 75m
    const upcomingStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const upcomingEnd   = new Date(now.getTime() + (2 * 24 + 3) * 60 * 60 * 1000);
    const pastStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const pastEnd   = new Date(now.getTime() - (7 * 24 - 2) * 60 * 60 * 1000);

    const contests = [
      ['Sprint Contest #42', 'Sprint', '60-minute rapid-fire contest testing core DSA speed and accuracy.', liveStart, liveEnd, 2, true, 'live'],
      ['Grand Arena Championship 2026', 'Grand Arena', '3-hour competitive programming marathon with dynamic point decay.', upcomingStart, upcomingEnd, 3, true, 'upcoming'],
      ['Campus League Invitational #1', 'Campus League', 'Inter-college competitive battle between top engineering institutions.', pastStart, pastEnd, 2, true, 'ended']
    ];

    for (let i = 0; i < contests.length; i++) {
      const [cRes] = await conn.query(`
        INSERT INTO contests (title, type, description, start_time, end_time, created_by, is_public, status)
        VALUES (?,?,?,?,?,?,?,?)
      `, contests[i]);
      const contestId = cRes.insertId;

      // Assign 3-4 problems to each contest
      const problemSubset = i === 0 ? [1, 2, 3, 4] : i === 1 ? [7, 8, 14, 16] : [5, 6, 9];
      for (let idx = 0; idx < problemSubset.length; idx++) {
        await conn.query(`
          INSERT INTO contest_problems (contest_id, problem_id, points, order_index)
          VALUES (?,?,?,?)
        `, [contestId, problemSubset[idx], (idx + 1) * 100, idx]);
      }

      // Register participants
      const studentIds = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      for (let sIdx = 0; sIdx < studentIds.length; sIdx++) {
        const score = i === 2 ? Math.floor(Math.random() * 300) : (i === 0 ? Math.floor(Math.random() * 200) : 0);
        await conn.query(`
          INSERT INTO contest_participants (contest_id, user_id, score, \`rank\`)
          VALUES (?,?,?,?)
        `, [contestId, studentIds[sIdx], score, sIdx + 1]);
      }
    }

    // ── SUBMISSIONS & ACTIVITY (Populate Heatmap and Stats) ─────────────
    console.log('6️⃣ Seeding Real Submissions and Activity Heatmap...');
    const sampleCodes = {
      pythonAC: 'import sys\n\ndef solve():\n    raw = sys.stdin.read().split()\n    if not raw: return\n    n = int(raw[0])\n    nums = [int(x) for x in raw[1:n+1]]\n    target = int(raw[n+1])\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            print(f"{seen[target - x]} {i}")\n            return\n        seen[x] = i\n\nsolve()\n',
      pythonWA: 'import sys\nprint("0 0")\n',
      pythonTLE: 'import time\ntime.sleep(5)\nprint("0 1")\n'
    };

    const studentUserIds = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    for (const uId of studentUserIds) {
      // Submissions over the last 90 days
      for (let day = 0; day < 30; day++) {
        if (Math.random() > 0.4) {
          const subCount = Math.floor(Math.random() * 5) + 1;
          const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          await conn.query(`
            INSERT INTO user_activity (user_id, activity_date, submissions)
            VALUES (?,?,?)
            ON DUPLICATE KEY UPDATE submissions = submissions + ?
          `, [uId, date, subCount, subCount]);

          // Insert matching submission records
          for (let s = 0; s < subCount; s++) {
            const probId = Math.floor(Math.random() * 15) + 1;
            const isAC = Math.random() > 0.35;
            const verdict = isAC ? 'AC' : (Math.random() > 0.5 ? 'WA' : 'TLE');
            const runtime = isAC ? Math.floor(Math.random() * 40) + 10 : (verdict === 'TLE' ? 2050 : 25);
            const mem = parseFloat((Math.random() * 6 + 7).toFixed(1));

            await conn.query(`
              INSERT INTO submissions (user_id, problem_id, language, code, verdict, runtime_ms, memory_mb, score, passed_test_cases, total_test_cases, submitted_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,DATE_SUB(NOW(), INTERVAL ? DAY))
            `, [
              uId, probId, 'python', isAC ? sampleCodes.pythonAC : sampleCodes.pythonWA,
              verdict, runtime, mem, isAC ? 100 : 0, isAC ? 5 : 2, 5, day
            ]);
          }
        }
      }
    }

    // ── GLOBAL LEADERBOARD ─────────────────────────────────────────────
    console.log('7️⃣ Calculating and Updating Global Leaderboard...');
    await conn.query(`
      INSERT INTO leaderboard_global (user_id, rating, problems_solved, contests_entered, \`rank\`)
      SELECT 
        u.id,
        u.rating,
        COALESCE((SELECT COUNT(DISTINCT problem_id) FROM submissions WHERE user_id = u.id AND verdict = 'AC'), 0) AS problems_solved,
        COALESCE((SELECT COUNT(DISTINCT contest_id) FROM contest_participants WHERE user_id = u.id), 0) AS contests_entered,
        0
      FROM users u
      WHERE u.role = 'student'
      ON DUPLICATE KEY UPDATE 
        rating = VALUES(rating),
        problems_solved = VALUES(problems_solved),
        contests_entered = VALUES(contests_entered)
    `);

    await conn.query(`
      UPDATE leaderboard_global lg
      JOIN (
        SELECT user_id, RANK() OVER (ORDER BY rating DESC, problems_solved DESC) as calculated_rank
        FROM leaderboard_global
      ) ranked ON lg.user_id = ranked.user_id
      SET lg.\`rank\` = ranked.calculated_rank
    `);

    // ── ASSIGNMENTS ────────────────────────────────────────────────────
    console.log('8️⃣ Seeding Faculty Assignments...');
    const assignments = [
      ['Lab Assignment 1: Dynamic Programming', 2, [3, 11, 16], new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), 'B.Tech CSE 2025 Sec A', 'Complete Kadane algorithm and Coin Change problems.'],
      ['Weekly Lab 2: Graph Algorithms', 3, [13, 14], new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), 'B.Tech CSE 2026 Sec B', 'Solve Number of Islands and Course Schedule. Check time limits carefully.']
    ];

    for (const a of assignments) {
      await conn.query(`
        INSERT INTO assignments (title, faculty_id, problem_ids, deadline, class_group, description)
        VALUES (?,?,?,?,?,?)
      `, [a[0], a[1], JSON.stringify(a[2]), a[3], a[4], a[5]]);
    }

    // ── ACHIEVEMENTS ───────────────────────────────────────────────────
    console.log('9️⃣ Seeding Achievements...');
    const achievements = [
      ['gold_coder', 'Gold Coder', 'Achieve a rating of 2000+ in competitive programming contests.', '🥇', 'rating_2000'],
      ['speed_demon', 'Speed Demon', 'Solve any medium/hard problem with runtime under 20ms.', '⚡', 'speed_20ms'],
      ['problem_crusher', 'Problem Crusher', 'Solve 50+ unique coding challenges.', '🎯', 'solved_50'],
      ['streak_master', '50-Day Streak', 'Maintain an uninterrupted 50-day coding streak on the platform.', '🔥', 'streak_50']
    ];

    for (const ach of achievements) {
      await conn.query(`
        INSERT INTO achievements (code, title, description, icon, requirement)
        VALUES (?,?,?,?,?)
      `, ach);
    }

    // Unlock some achievements for top students
    await conn.query('INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (6, 1), (6, 2), (6, 4), (5, 3), (7, 1)');

    // ── NOTIFICATIONS ──────────────────────────────────────────────────
    console.log('🔟 Seeding Notifications...');
    const notifs = [
      [5, 'contest', 'Sprint Contest #42 is LIVE!', 'Join now and compete against 50+ students in real-time.', 'contests.html'],
      [5, 'system', 'Problem Accepted: Two Sum', 'Your solution passed all 5 test cases with 18ms runtime.', 'dashboard-student.html'],
      [6, 'achievement', 'Achievement Unlocked: Gold Coder', 'Congratulations on reaching 2755 rating points!', 'dashboard-student.html'],
      [2, 'assignment', 'Assignment Submissions Update', '14 students submitted Lab Assignment 1.', 'dashboard-faculty.html']
    ];

    for (const n of notifs) {
      await conn.query(`
        INSERT INTO notifications (user_id, type, title, message, link, is_read)
        VALUES (?,?,?,?,?,FALSE)
      `, n);
    }

    console.log('\n✨ CODE ARENA DATABASE SEEDED SUCCESSFULLY! ✨\n');
    console.log('📊 Summary of Seeded Data:');
    console.log('   - 1 Admin: admin@codearena.io / Admin@123');
    console.log('   - 3 Faculty: sharma@faculty.com, mehta@faculty.com, verma@faculty.com / Faculty@123');
    console.log('   - 12 Students: alex@student.com, rohit@student.com, etc. / Password@123');
    console.log('   - 22 Problems with Test Cases & Progressive Hints');
    console.log('   - 3 Contests (Live, Upcoming, Past) with Leaderboards');
    console.log('   - Submissions, Heatmaps, Global Leaderboard, Assignments, Achievements');

  } catch (err) {
    console.error('❌ Error seeding database:', err);
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
