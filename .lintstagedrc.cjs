module.exports = {
  "!(*.ts|*.tsx)": ["eclint fix", "prettier --write --ignore-unknown"],
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*{package.json,package-lock.json}": () => ["syncpack list-mismatches"],
};
