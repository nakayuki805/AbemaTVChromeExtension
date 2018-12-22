// Edge等対応
declare var browser: any;
export default (typeof chrome === 'undefined' || !chrome.extension
    ? browser
    : chrome);
