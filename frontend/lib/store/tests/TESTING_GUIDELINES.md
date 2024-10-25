# Testing Suite Documentation

This project uses **Jest** and **@testing-library/react** for writing and running tests. Follow this guide to understand the structure of the test cases, how to write new ones, and execute them.

## Prerequisites

Make sure you have all the necessary dependencies installed by running:

```bash
npm install
```

## Testing Tools

1. **Jest**: The primary testing framework for running and managing test cases.
2. **@testing-library/react**: A set of helpers that enables testing of React components in a way similar to how users interact with them.

## Folder Structure

-   `frontend/lib/store/tests/`: This folder contains all the test files for this project.
-   `frontend/lib/store/tests/setupTests.ts`: This is the setup file where you can configure global settings or setup helpers before running any tests.

## Writing Test Cases

### Test Case Structure

1. **Setup**: Import the necessary modules, including the component or hook you want to test and any helper functions.
2. **Define Tests**: Create a test suite using `describe` and individual test cases using `it` or `test`.
3. **Render the Component/Hook**: Use `render` (for components) or `renderHook` (for hooks) from `@testing-library/react`.
4. **Interact and Assert**: Use functions like `fireEvent`, `act`, and assertions like `expect` to simulate user interactions and verify the expected outcomes.

### Sample Test Case

Here’s an example of a test case for a React component named `SampleComponent`:

```typescript
// SampleComponent.tsx
import React from 'react';

export const SampleComponent: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button data-testid="sample-button" onClick={onClick}>
      Click Me
    </button>
  );
};
```

#### Test Case for `SampleComponent`

```typescript
// SampleComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SampleComponent } from '../SampleComponent';

describe('SampleComponent', () => {
  it('should render a button with text "Click Me"', () => {
    render(<SampleComponent onClick={() => {}} />);

    const buttonElement = screen.getByTestId('sample-button');
    expect(buttonElement).toHaveTextContent('Click Me');
  });

  it('should trigger onClick when button is clicked', () => {
    const handleClick = jest.fn();
    render(<SampleComponent onClick={handleClick} />);

    const buttonElement = screen.getByTestId('sample-button');
    fireEvent.click(buttonElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Common Functions

-   **`render`**: Renders a React component for testing.
-   **`renderHook`**: Renders a hook for testing its logic and state management.
-   **`act`**: Allows simulating state changes and interactions.
-   **`fireEvent`**: Simulates user events like clicks, changes, etc.

### Assertions

-   **`expect(value).toBe(expected)`**: Checks if the value matches the expected output.
-   **`expect(value).toHaveTextContent(text)`**: Checks if a component has specific text content.
-   **`expect(mockFunction).toHaveBeenCalledTimes(count)`**: Checks if a mock function was called a certain number of times.

## Running Tests

To run all test cases, use the following command:

```bash
npm test
```

This command will execute all the test files matching the pattern specified in the Jest configuration (`jest.config.js`). If you want to run tests in watch mode to monitor changes in real-time, you can use:

```bash
npm test -- --watch
```

## Debugging Tests

1. **View Console Logs**: Add `console.log()` statements within the test cases to debug and track values.
2. **Test Failed Scenarios**: Deliberately make some tests fail to understand the root cause of errors and improve the component or hook.
3. **Use Breakpoints**: You can run tests with an interactive debugger using:

    ```bash
    node --inspect-brk node_modules/.bin/jest --runInBand
    ```

    Then attach your debugger in VS Code or another editor.

---

This documentation should help new developers quickly get up to speed with writing and managing tests using Jest and `@testing-library/react`. Feel free to adjust and expand it as necessary for your project!
