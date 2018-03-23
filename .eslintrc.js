module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
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
        "no-unused-vars": "off",
        "no-irregular-whitespace": "warn",
        "no-unreachable": "off",
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