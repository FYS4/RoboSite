module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "comma-dangle": [
          "error",
          "never"
        ],
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "no-multiple-empty-lines": [
          "error",
          {
            "max": 1,
            "maxBOF": 1
          }
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-var": "error",
        "prefer-const": "error",
        "multiline-ternary": ["error", "never"]
    }
};
