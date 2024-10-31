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

-   **useSearchStore Hook Tests** (`lib/store/tests/local-history.test.ts`):
    This test suite checks the behavior of a custom hook `useSearchStore`. The hook manages a collection of search objects, allowing users to add, update, remove, and clear searches. It also supports setting and updating an active search, as well as managing messages associated with searches.

    **Tests Included**:

    -   **Initialization**: Verifies that the searches array starts empty and that there is no active search when the hook is first used.

    -   **Add Search**: Ensures that a new search can be added correctly, updating both the searches array and the active search.

    -   **Update Existing Search**: Confirms that adding a search with an existing ID updates the previous search instead of creating a duplicate.

    -   **Add Multiple Searches**: Tests that multiple searches can be added, and they are stored in the correct order, with the newest search appearing first.

    -   **Remove Search**: Validates that a search can be removed by its ID, ensuring that the remaining searches are intact.

    -   **Clear Searches**: Checks that all searches can be cleared, returning the state to its initial empty condition.

    -   **Set Active Search**: Verifies that an active search can be set by its ID, allowing for focused operations on that specific search.

    -   **Update Active Search**: Ensures that the active search can be updated, reflecting changes in both the active search state and the corresponding search in the list.

    -   **Delete Message from Active Search**: Tests that messages can be deleted from the active search, confirming that the state updates correctly to reflect the removal.

### Running the Tests

To run the tests in this project, follow these steps:

1. **Install Dependencies**  
   Ensure all dependencies are installed. If not, run:
    ```bash
    bun i
    ```
2. **Run the Tests**
    ```bash
    bun run test
    ```
    This command will execute all test suites and display the results in the terminal.
