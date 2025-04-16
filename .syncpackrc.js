const config = {
  dependencyTypes: ["**"],
  filter: ".",
  sortPackages: true,
  source: [
    "package.json",
    "grassroots-backend/package.json",
    "grassroots-frontend/package.json",
  ],
};

module.exports = config;
