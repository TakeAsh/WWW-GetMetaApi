// ==UserScript==
// @name         Mebuki Plus
// @namespace    https://TakeAsh.net/
// @version      2025-10-18_19:30
// @description  enhance Mebuki channel
// @author       TakeAsh
// @match        https://mebuki.moe/app
// @match        https://mebuki.moe/app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mebuki.moe
// @grant        none
// ==/UserScript==

((w, d) => {
  'use strict';
  setTimeout(() => {
    const css = d.createElement('style');
    css.textContent = [
      '.custom-emoji { pointer-events: auto; }',
      '.custom-emoji:hover > .custom-emoji-image { width: initial; height: 6em; position: relative; z-index: 10; }',
      '.catalog-item:hover { z-index: 5; }',
      '.catalog-image { position: relative; }',
      '.catalog-image:hover { width: initial; height: 12em; position: absolute; z-index: 20; }',
    ].join('\n');
    d.head.appendChild(css);
  }, 2000);
})(window, document);
