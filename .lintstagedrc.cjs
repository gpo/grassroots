module.exports = {
  "!(*.ts|*.tsx)": ["prettier --write --ignore-unknown"],
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*{package.json,pnpm-lock.yaml}": () => ["syncpack list-mismatches"],
};
