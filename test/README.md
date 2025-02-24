# How testing works

Testing for schemats runs in end-to-end fashion.

`indexSpec.ts` first loads SQL schema files into the databases defined by environment variable `POSTGRES_URL`.
Then typing definitions for each SQL schema is generated and placed in `test/artifacts`.
These generated files are then compared against the expected output from `test/expected` 
in a line-by-line difference. The tests pass if there is no difference, and fails otherwise.


# Running the tests

```bash 
POSTGRES_URL="postgres://youruser@localhost/anyemptytestdatabase" npm test
```
