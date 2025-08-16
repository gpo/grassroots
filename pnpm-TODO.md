Get rid of metadata post processing if unneeded.

- Run tsc in eslint_rules at some point on setup.
- Deal with:
  - `WARN 'node_modules' is present. Lockfile only installation will make it out-of-date`
  - I think this is slowing things way down.
  - Might have to do with when node_modules folders are bound (or not)

 WARN  Issues with peer dependencies found

```
├─┬ @typescript-eslint/parser 8.32.1
│ ├── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
│ └─┬ @typescript-eslint/typescript-estree 8.32.1
│   └── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
└─┬ typescript-eslint 8.32.1
  ├── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
  └─┬ @typescript-eslint/eslint-plugin 8.32.1
    ├── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
    └─┬ @typescript-eslint/type-utils 8.32.1
      ├── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
      └─┬ @typescript-eslint/utils 8.32.1
        └── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
```
