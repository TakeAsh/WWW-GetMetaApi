// ==UserScript==
// @name         Mebuki Plus
// @namespace    https://TakeAsh.net/
// @version      2025-10-13_06:00
// @description  enhance Mebuki channel
// @author       TakeAsh
// @match        https://mebuki.moe/app/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mebuki.moe
// @grant        none
// ==/UserScript==

((w, d) => {
  'use strict';
  setTimeout(() => {
    const css = d.createElement('style');
    css.textContent = '.custom-emoji:hover .custom-emoji-image { width: initial; height: 6em; position: relative; z-index: 10; }';
    d.head.appendChild(css);
  }, 2000);
})(window, document);
