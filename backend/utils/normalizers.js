'use strict';

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  if (typeof value !== 'string') return [];

  const text = value.trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'string' && parsed.trim()) return parsed.split(',').map(item => item.trim()).filter(Boolean);
    return [];
  } catch {
    return text.split(',').map(item => item.trim()).filter(Boolean);
  }
}

const DEFAULT_STARTER_CODE = {
  c: `#include <stdio.h>

int main(void) {
    /* Read the input and implement the solution here. */
    return 0;
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // Read the input and implement the solution here.
    return 0;
}`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Read the input and implement the solution here.
    }
}`,
  python: `import sys

def solve():
    data = sys.stdin.buffer.read().split()
    # Parse the input and implement the solution here.

if __name__ == '__main__':
    solve()`,
  javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim();
// Parse the input and implement the solution here.
`
};

function completeStarterCode(value) {
  let supplied = value;
  if (typeof supplied === 'string') {
    try { supplied = JSON.parse(supplied); }
    catch { supplied = { python: supplied }; }
  }
  if (!supplied || typeof supplied !== 'object' || Array.isArray(supplied)) supplied = {};

  const result = { ...DEFAULT_STARTER_CODE };
  for (const [language, code] of Object.entries(supplied)) {
    if (typeof code === 'string' && code.trim()) result[language] = code;
  }
  return result;
}

module.exports = { asArray, completeStarterCode };
