const fs = require("fs");

module.exports = {
  "!(*.ts|*.tsx)": (files) => {
    return files
      .filter((f) => !fs.lstatSync(f).isSymbolicLink())
      .map((f) => `prettier --write --ignore-unknown "${f}"`);
  },
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*{package.json,package-lock.json}": () => ["syncpack list-mismatches"],
};
