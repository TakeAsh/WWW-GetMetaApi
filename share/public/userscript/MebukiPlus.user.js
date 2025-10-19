// ==UserScript==
// @name         Mebuki Plus
// @namespace    https://TakeAsh.net/
// @version      2025-10-19_16:00
// @description  enhance Mebuki channel
// @author       TakeAsh
// @match        https://mebuki.moe/app
// @match        https://mebuki.moe/app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mebuki.moe
// @grant        none
// ==/UserScript==

(async (w, d) => {
  'use strict';
  const urlCustomEmoji = 'https://mebuki.moe/api/custom-emoji';
  const urlEmoji = 'https://mebuki.moe/assets/emoji-data-CJuCqmpZ.js';
  const emojis = await getEmojis();
  await sleep(2000);
  const css = d.createElement('style');
  css.textContent = [
    '.custom-emoji { pointer-events: auto; }',
    '.custom-emoji:hover > .custom-emoji-image { width: initial; height: 6em; position: relative; z-index: 10; }',
    '.catalog-item:hover { transform: translate(50%,50%) translate(-6em,-6em); z-index: 20; }',
    '.catalog-image { position: relative; }',
    '.catalog-image:hover { width: initial; height: 12em; position: absolute; z-index: 20; }',
  ].join('\n');
  d.head.appendChild(css);
  watchCatalog();
  watchThread();

  function sleep(ms, resolve) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function getEmojis() {
    const resCustomEmoji = await fetch(urlCustomEmoji);
    const customEmojis = (await resCustomEmoji.json()).categories[0].emojis.reduce(
      (acc, cur) => {
        acc[cur.keywords[0]] = cur.name;
        return acc;
      },
      {}
    );
    const resEmoji = await fetch(urlEmoji);
    const jsonEmoji = /JSON\.parse\(`([^`]+?)`\)/.exec(await resEmoji.text())[1];
    const emojisFull = JSON.parse(jsonEmoji);
    const emojis = Object.keys(emojisFull).reduce(
      (acc, cur) => {
        const e = emojisFull[cur];
        acc[e.skins[0].unified] = e.name;
        return acc;
      },
      customEmojis
    );
    return emojis;
  }
  function watchCatalog() {
    const target = d.body; // d.querySelector('.catalog-auto-wrapper, ul[class*="grid-cols-"]');
    if (!target) {
      console.log('No Catalog');
      return;
    }
    const modify = (target) => {
      Array.from(target.querySelectorAll('.text-sm'))
        .filter(elm => !elm.dataset.mod)
        .forEach(elm => {
          elm.dataset.mod = 1;
          elm.title = elm.textContent;
        });
    };
    modify(target);
    const observer = new MutationObserver(
      (mutations) => mutations.forEach(
        (mutation) => modify(mutation.target)));
    observer.observe(target, { childList: true, subtree: true, });
  }
  function watchThread() {
    const target = d.body; // d.querySelector('.thread-messages');
    if (!target) {
      console.log('No Thread');
      return;
    }
    const modify = (target) => {
      Array.from(target.querySelectorAll('.custom-emoji-image'))
        .filter(elm => !elm.dataset.mod)
        .forEach(elm => {
          elm.dataset.mod = 1;
          const key = elm.src.replace(/^[\s\S]+\/([^\/\.]+)\.\w+$/, '$1');
          elm.title = emojis[key] || key;
        });
    };
    modify(target);
    const observer = new MutationObserver(
      (mutations) => mutations.forEach(
        (mutation) => modify(mutation.target)));
    observer.observe(target, { childList: true, subtree: true, });
  }
})(window, document);
