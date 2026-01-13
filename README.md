genie.js
========

This javascript library mimics the infamous genie effect in MacOS.

See this script in action at Codepen.io
http://codepen.io/hbi99/pen/mFhzH

This version works with Firefox, Safari & Chrome.

## 2024 Refactor

This fork includes a complete refactor of the original codebase:

- **Removed jQuery-like dependency** - Uses native DOM APIs (`document.querySelectorAll`, `document.createDocumentFragment`, etc.)
- **Cleaner code structure** - Separated concerns into focused helper functions
- **Modern JavaScript patterns** - Uses `const`/`let`, arrow functions, `classList` API
- **Improved DOM manipulation** - Uses `DocumentFragment` for batch DOM operations instead of innerHTML string concatenation
- **Explicit state management** - All object properties declared upfront
- **DRY principles** - Extracted reusable functions for slice creation and sine-wave calculations

### Performance Improvements

The refactored version produces noticeably smoother animations due to:
- More efficient DOM operations using `DocumentFragment`
- Removal of jQuery-like abstraction overhead
- Direct use of modern browser APIs

## Credits

**Original Author:** [Hakan Bilgin](https://github.com/hbi99) (c) 2013

**2024 Refactor:** Nicholas Smith with Claude Code
