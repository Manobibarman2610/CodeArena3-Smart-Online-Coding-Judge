'use strict';

const axios = require('axios');
const { pool } = require('../config/db');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


function analyzeCodeLocally(code, language, problemTitle = '', verdict = '', submissionContext = {}) {
  const codeLower = (code || '').toLowerCase();
  const langLower = (language || 'python').toLowerCase();

  const passedCount = submissionContext.passedCount || 0;
  const totalCount = submissionContext.totalCount || 1;
  const failedCase = submissionContext.failedTestCase || null;
  const errorOutput = submissionContext.errorOutput || '';

  // 1. Result & Verdict Status
  let resultStatus = 'Incorrect';
  let resultBadge = 'WA';
  let resultColor = 'var(--danger)';

  if (verdict === 'AC') {
    resultStatus = 'Correct';
    resultBadge = 'AC';
    resultColor = 'var(--success)';
  } else if (verdict === 'WA' && passedCount > 0) {
    resultStatus = 'Partially Correct';
    resultBadge = 'WA (Partial)';
    resultColor = 'var(--warning)';
  } else if (verdict === 'TLE') {
    resultStatus = 'Time Limit Exceeded';
    resultBadge = 'TLE';
    resultColor = 'var(--warning)';
  } else if (verdict === 'RE') {
    resultStatus = 'Runtime Error';
    resultBadge = 'RE';
    resultColor = 'var(--danger)';
  } else if (verdict === 'CE') {
    resultStatus = 'Compilation Error';
    resultBadge = 'CE';
    resultColor = 'var(--danger)';
  }

  // 2. Test Cases Breakdown
  const passPercentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const testCasesDetail = {
    passedCount,
    totalCount,
    passPercentage,
    summaryText: `${passedCount} of ${totalCount} test cases passed (${passPercentage}%)`,
    failedTestCase: failedCase ? {
      caseNumber: failedCase.caseNumber,
      isSample: failedCase.isSample,
      input: failedCase.input,
      expectedOutput: failedCase.expectedOutput,
      actualOutput: failedCase.actualOutput
    } : null
  };

  // 3. Complexity & Static Analysis
  let timeComplexity = 'O(n)';
  let spaceComplexity = 'O(1)';
  let complexityAdvice = 'Solution is within optimal time & space complexity.';

  const forMatches = (code.match(/for\s*\(|for\s+[a-zA-Z0-9_]+\s+in/g) || []).length;
  const whileMatches = (code.match(/while\s*\(/g) || []).length;

  if (forMatches >= 2 || (forMatches >= 1 && whileMatches >= 1)) {
    timeComplexity = 'O(n²)';
    complexityAdvice = 'Nested loop structure detected. Quadric time complexity O(n²) can cause TLE for inputs n > 10^4. Consider Hash Maps or Two Pointers for O(n).';
  } else if (codeLower.includes('binarysearch') || codeLower.includes('low') && codeLower.includes('high') && codeLower.includes('mid')) {
    timeComplexity = 'O(log n)';
    complexityAdvice = 'Logarithmic time complexity O(log n) achieved via divide-and-conquer / binary search.';
  } else if (codeLower.includes('def solve(') || codeLower.includes('int solve(') || codeLower.includes('def helper(')) {
    if (!codeLower.includes('memo') && !codeLower.includes('dp') && !codeLower.includes('cache')) {
      timeComplexity = 'O(2^n)';
      complexityAdvice = 'Unmemoized recursive branching detected (O(2^n)). Add memoization or dynamic programming to optimize to polynomial time.';
    } else {
      timeComplexity = 'O(n)';
      complexityAdvice = 'Memoized recursion reduces recomputation effectively.';
    }
  }

  if (code.includes('.slice(') || code.includes('[:]') || code.includes('new int[') || code.includes('vector<int>') || code.includes('malloc(') || code.includes('[]')) {
    spaceComplexity = 'O(n)';
  }

  // 4. Error & Logic Explanation
  let detailedErrorExplanation = '';
  if (verdict === 'AC') {
    detailedErrorExplanation = 'Your program satisfied all automated test cases, executed within time/memory constraints, and produced expected outputs for all edge cases.';
  } else if (verdict === 'WA') {
    if (passedCount > 0) {
      detailedErrorExplanation = `Your code passed ${passedCount}/${totalCount} test cases but failed on boundary inputs. Look closely at how array boundaries, empty input cases, or loop condition equality (<= vs <) are handled.`;
    } else {
      detailedErrorExplanation = `Your solution returned incorrect outputs across test cases. Verify loop initialization, accumulator reset between runs, and pointer update conditions.`;
    }
  } else if (verdict === 'TLE') {
    detailedErrorExplanation = 'Your code ran longer than the allowed time limit (2000ms). Look for infinite loops, missing loop counter increments, or nested O(n²) iterations.';
  } else if (verdict === 'RE') {
    detailedErrorExplanation = `Runtime crash detected: ${errorOutput || 'Array Index Out of Bounds, Null Pointer Dereference, or Stack Overflow'}. Verify memory allocation and index boundaries.`;
  } else if (verdict === 'CE') {
    detailedErrorExplanation = `Compilation failed. Please review syntax errors, missing semicolons, unbalanced braces, or invalid imports.`;
  }

  // 5. Correct Problem-Solving Approach (Concept Guidance without raw code)
  let correctApproach = '';
  const titleLower = problemTitle.toLowerCase();

  if (titleLower.includes('binary search') || codeLower.includes('low') || codeLower.includes('high')) {
    correctApproach = 'Use a two-pointer Binary Search (`low`, `high`). Compute `mid = low + Math.floor((high - low) / 2)`. If `arr[mid] == target`, return `mid`. If `arr[mid] < target`, move `low = mid + 1`, otherwise move `high = mid - 1`. Check edge conditions when `target` is at boundary index 0 or length - 1.';
  } else if (titleLower.includes('two sum') || titleLower.includes('hash')) {
    correctApproach = 'Use a Hash Map / Dictionary to store `{ value: index }` as you iterate through the collection. For each element `x`, check if `target - x` exists in the map. This achieves O(n) time instead of nested O(n²) loops.';
  } else if (titleLower.includes('parentheses') || titleLower.includes('stack')) {
    correctApproach = 'Use a Stack data structure. Push opening brackets `(`, `{`, `[` onto the stack. When encountering a closing bracket, verify that the stack is non-empty and top element matches. At the end, the stack must be empty.';
  } else {
    correctApproach = 'Decompose the problem into core algorithmic steps. Identify invariant properties, select appropriate data structures (Hash Map for O(1) lookups, Stack/Queue for ordering, or Two Pointers for sorted search), and handle boundary edge cases.';
  }

  // 6. Code Quality & Readability Review
  const qualitySuggestions = [];
  if (code.length < 50) {
    qualitySuggestions.push('Code is very compact. Ensure variable names are descriptive to maintain readability.');
  }
  if (!code.includes('//') && !code.includes('#')) {
    qualitySuggestions.push('Add brief inline comments explaining non-trivial algorithmic steps.');
  }
  if (code.includes('var ') && langLower === 'javascript') {
    qualitySuggestions.push('Use block-scoped `const` or `let` instead of `var` in modern JavaScript.');
  }
  if (qualitySuggestions.length === 0) {
    qualitySuggestions.push('Code structure is clean, well-formatted, and follows idiomatic language guidelines.');
  }

  // 7. Concept Understanding & Mastery Level
  let conceptMastery = 'Developing';
  if (verdict === 'AC') conceptMastery = 'Mastered';
  else if (passedCount > 0) conceptMastery = 'Developing';
  else conceptMastery = 'Needs Practice';

  const identifiedConcepts = [];
  if (codeLower.includes('binary') || titleLower.includes('search')) identifiedConcepts.push('Binary Search', 'Divide & Conquer');
  if (codeLower.includes('map') || codeLower.includes('dict') || codeLower.includes('hash')) identifiedConcepts.push('Hash Maps & Lookups');
  if (codeLower.includes('stack') || codeLower.includes('.pop(') || codeLower.includes('.push(')) identifiedConcepts.push('Stack Data Structure');
  if (codeLower.includes('for') || codeLower.includes('while')) identifiedConcepts.push('Loop Control & Iteration');
  if (identifiedConcepts.length === 0) identifiedConcepts.push('Algorithm Fundamentals', 'Problem Solving');

  // 8. Actionable Recommendations
  const recommendations = [];
  if (verdict === 'AC') {
    recommendations.push('Great job passing all test cases! Challenge yourself with the next difficulty level or optimize space complexity.');
    recommendations.push('Try solving 2 similar problems in this topic to solidify speed.');
  } else if (verdict === 'WA') {
    recommendations.push('Review boundary conditions (empty arrays, single-element collections, minimum/maximum target values).');
    recommendations.push(`Practice 2–3 fundamental exercises in ${identifiedConcepts[0] || 'DSA Core'} to master boundary updates.`);
  } else if (verdict === 'TLE') {
    recommendations.push('Replace nested loops with Hash Maps, Two Pointers, or Sliding Window to reduce time complexity to O(n).');
  } else {
    recommendations.push('Review error trace lines, test boundary inputs locally, and verify type definitions.');
  }

  return {
    resultSummary: {
      status: resultStatus,
      badge: resultBadge,
      badgeColor: resultColor,
      verdict
    },
    testCasesDetail,
    errorExplanation: detailedErrorExplanation,
    correctApproach,
    codeQuality: {
      score: verdict === 'AC' ? '95 / 100' : passedCount > 0 ? '80 / 100' : '65 / 100',
      suggestions: qualitySuggestions
    },
    complexity: {
      timeComplexity,
      spaceComplexity,
      advice: complexityAdvice
    },
    conceptUnderstanding: {
      masteryLevel: conceptMastery,
      concepts: identifiedConcepts
    },
    recommendations,
    provider: 'CodeArena AI Judge Engine'
  };
}

/**
 * Main AI Code Analysis function
 */
async function analyzeCode({ userId, problemId, problemTitle, code, language, verdict, submissionContext = {} }) {
  let analysis = null;

  // Try LLM providers if available
  if (GEMINI_API_KEY) {
    try {
      const prompt = `You are the CodeArena AI Assistant for competitive programming.
Analyze the following ${language} submission for "${problemTitle || 'Problem'}" (Verdict: ${verdict}):

\`\`\`${language}
${code}
\`\`\`

Provide structured analysis in JSON:
{
  "errorExplanation": "...",
  "correctApproach": "...",
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "codeQuality": { "score": "...", "suggestions": ["..."] },
  "conceptUnderstanding": { "masteryLevel": "...", "concepts": ["..."] },
  "recommendations": ["..."]
}`;

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { timeout: 5000 }
      );

      const replyText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = replyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        analysis = analyzeCodeLocally(code, language, problemTitle, verdict, submissionContext);
        analysis = { ...analysis, ...parsed, provider: 'Google Gemini AI' };
      }
    } catch (err) {
      console.warn('[AI Service] Gemini API skipped/failed:', err.message);
    }
  }

  // Fallback to local analyzer
  if (!analysis) {
    analysis = analyzeCodeLocally(code, language, problemTitle, verdict, submissionContext);
  }

  // Save to database
  try {
    if (userId && problemId) {
      await pool.query(`
        INSERT INTO ai_analyses (user_id, problem_id, language, code, analysis_json)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, problemId, language, code, JSON.stringify(analysis)]);
    }
  } catch { }

  return analysis;
}

module.exports = {
  analyzeCode,
  analyzeCodeLocally
};

