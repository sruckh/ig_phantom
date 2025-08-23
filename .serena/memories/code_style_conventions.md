# Code Style and Conventions

## JavaScript Style
- **ES6+ Features**: Consistently uses modern JavaScript
- **Variable Declaration**: Uses `const` for immutable references, `let` for mutable
- **Function Style**: Arrow functions for callbacks and simple functions
- **Async Patterns**: async/await preferred over Promise chains
- **String Templates**: Template literals with `${}` interpolation

## Naming Conventions
- **camelCase**: Used for variables, functions, and DOM elements
  - Examples: `urlInput`, `sessionCookieInput`, `setLoading`, `updateSelectionUI`
- **SCREAMING_SNAKE_CASE**: Used for constants from environment variables
  - Examples: `N8N_WEBHOOK_URL`, `PHANTOM_API_KEY`, `AGENT_ID`
- **kebab-case**: Used for HTML IDs and CSS classes
  - Examples: `url-input`, `session-cookie-input`, `scrape-button`

## Code Organization
- **Separation of Concerns**: Clear sections for:
  - Configuration constants
  - State management
  - DOM element references
  - Helper functions
  - Event handlers
- **Helper Functions**: Well-named utility functions like `showMessage`, `setLoading`, `updateSelectionUI`
- **Comments**: Section headers and purpose explanations

## HTML/CSS Style
- **Semantic HTML**: Proper use of header, main, section elements
- **Tailwind Classes**: Utility-first approach with responsive design
- **Accessibility**: Proper form labels, ARIA attributes, focus states
- **Mobile-First**: Responsive design with breakpoint prefixes

## Error Handling
- **Try-Catch Blocks**: Proper error handling for async operations
- **User Feedback**: Clear error messages with visual styling
- **Validation**: Input validation before API calls
- **Graceful Degradation**: Fallbacks for missing configuration

## State Management
- **Global State**: Simple variables for app state (allImages, selectedImages, isLoading)
- **UI State Sync**: Helper functions to keep UI in sync with state
- **Event-Driven**: DOM events trigger state changes and UI updates