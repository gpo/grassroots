module.exports = {
  "!(*.ts|*.tsx)": ["prettier --write --ignore-unknown", "eclint fix"],
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*{package.json,package-lock.json}": () => ["syncpack list-mismatches"],
};
