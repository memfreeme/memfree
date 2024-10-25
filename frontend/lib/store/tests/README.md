## Tests Overview

This project includes a set of tests to ensure the reliability and functionality of key features within the codebase. The primary focus of these tests is to validate state management using the `useSearchLimit` hook implemented with Zustand.

### Test Suite Description

-   **useSearchLimit Hook Tests** (`lib/store/tests/local-limit.test.ts`):  
    This test suite checks the behavior of a custom hook `useSearchLimit`. The hook manages a limit on daily search operations, resets the count at the start of each new day, and provides methods to increment the count or check if more searches can be made.

    **Tests Included**:

    -   **Initialization**: Verifies that the search count starts at zero with the current date.
    -   **Increment Logic**: Ensures that the search count increases correctly within the same day.
    -   **New Day Reset**: Confirms that the search count resets to zero when a new day is detected.
    -   **Search Limit Checks**: Tests that `canSearch` returns the correct status based on the current search count and date.

### Running the Tests

To run the tests in this project, follow these steps:

1. **Install Dependencies**  
   Ensure all dependencies are installed. If not, run:
    ```bash
    npm install
    ```
2. **Run the Tests**
    ```bash
    npm run test
    ```
    This command will execute all test suites and display the results in the terminal.
