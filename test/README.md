# Backend Testing Guidelines

- All the tests should test Backend functionalities. Frontend functionalities and e2e tests are done in Frontend.
- Make use of pytest fixtures whenever it is possible. With fixtures, objects with high initialize durations are reused within tests, ex. a client session.
- All test*data resides within \_gradio/test_data* and all test_files resides within test/test_files.
- When doing network operations do not forget to make use of async to make tests faster.
- Have clear class and function naming within the tests.
- Short descriptions within test functions are great.
- Library function docstrings is expected to contain an example, please add missing docstrings to the library while you are writing tests the related function.
- Library docstring examples and descriptions are expected to align with tests, please fix divergent tests and library docstrings.
