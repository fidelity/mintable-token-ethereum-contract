module.exports = {
  no-duplicate-variable: [true, "check-parameters"],
  trailingComma: "es5",
  overrides: [
    {
      files: "*.sol",
      options: {
        tabWidth: 4,
        printWidth: 120,
        bracketSpacing: true,
        compiler: "0.8.9",
      },
    },
  ],
};
