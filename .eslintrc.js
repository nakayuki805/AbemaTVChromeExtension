module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2017
    },
    "rules": {
        "indent": [
            "off",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "off",
            "single"
        ],
        "semi": [
            "warn",
            "always"
        ],
        "no-console": "off",
        "no-unused-vars": "warn",
        "no-irregular-whitespace": "warn",
        "no-unreachable": "warn",
        "no-redeclare": "warn",
        "no-empty": "warn",
        "no-fallthrough": "warn",
        "no-useless-escape": "warn",
        "no-constant-condition": "warn"
    },
    "globals": {
        "$": false,
        "console": false,
        "chrome": false,
        "browser": false,
        "process": false
    }
};