genie.js
========

This javascript library mimics the infamous genie effect in MacOS.

This version works with Firefox, Safari & Chrome.

## 2026 Refactor

This fork includes a complete refactor of the original codebase:

- **Removed jQuery-like dependency** - Uses native DOM APIs (`document.querySelectorAll`, `document.createDocumentFragment`, etc.)
- **Cleaner code structure** - Separated concerns into focused helper functions
- **Modern JavaScript patterns** - Uses `const`/`let`, arrow functions, `classList` API
- **Improved DOM manipulation** - Uses `DocumentFragment` for batch DOM operations instead of string concatenation
- **Explicit state management** - All object properties declared upfront
- **DRY principles** - Extracted reusable functions for slice creation and sine-wave calculations

## Performance Improvements

The refactored version produces noticeably smoother animations. Here's why:

### DocumentFragment vs String Concatenation

The original approach built a large HTML string in a loop, then assigned it to an element. The refactored approach uses `DocumentFragment` to create DOM nodes directly without HTML parsing. The browser doesn't need to invoke its HTML parser, which was a significant bottleneck in 2013 and still has overhead today.

### JavaScript Engine Improvements (2013 → 2026)

The original library was written 13 years ago. Modern JS engines have dramatically improved:

| Feature | 2013 | 2026 |
|---------|------|------|
| JIT compilation | Basic | Highly optimized |
| Inline caching | Limited | Aggressive |
| Hidden classes | V8 only | All engines |
| `const`/`let` | Didn't exist | Optimized paths |
| `classList` | New, slow | Native fast path |
| `forEach` | Slow | Near-native speed |

Our refactored code takes advantage of these optimizations:
- Declared properties upfront (stable hidden classes)
- `const`/`let` (compiler hints for optimization)
- `classList.add/remove` (native implementation vs className string manipulation)

### Removed Abstraction Layer

The original `$()` jQuery-like function added indirection. While minimal, every function call has overhead. Native `querySelectorAll` with `forEach` is now a single optimized path in modern browsers.

### CSS Transition Timing

With more efficient JS, the initial frame setup completes faster, giving the CSS transition engine a cleaner starting point. Janky first frames can make the whole animation appear choppy.

## Credits

**Original Author:** [Hakan Bilgin](https://github.com/hbi99) (c) 2013

**2026 Refactor:** Nicholas Smith with Claude Code
