// ==UserScript==
// @name         Mebuki Plus
// @namespace    https://TakeAsh.net/
// @version      2025-10-25_18:30
// @description  enhance Mebuki channel
// @author       TakeAsh
// @match        https://mebuki.moe/app
// @match        https://mebuki.moe/app/*
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/Util.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/PrepareElement.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/AutoSaveConfig.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/CyclicEnum.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mebuki.moe
// @grant        none
// ==/UserScript==

(async (w, d) => {
  'use strict';
  const urlCustomEmoji = 'https://mebuki.moe/api/custom-emoji';
  const urlEmoji = 'https://mebuki.moe/assets/emoji-data-CJuCqmpZ.js';
  const emojis = await getEmojis();
  await sleep(2000);
  addStyle({
    '.custom-emoji': {
      pointerEvents: 'auto',
    },
    '.custom-emoji:hover > .custom-emoji-image': {
      width: 'initial', height: '6em', position: 'relative', zIndex: 10,
    },
    '.catalog-item:hover': {
      transform: 'translate(50%,50%) translate(-6em,-6em)', zIndex: 20,
    },
    '.catalog-image': {
      position: 'relative',
    },
    '.catalog-image:hover': {
      width: 'initial', height: '12em', position: 'absolute', zIndex: 20,
    },
    '.zorome': {
      color: '#ff0000', fontSize: '125%',
    },
  });
  watch();

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
  function watch() {
    const modify = (target) => {
      // Catalog
      // Thread thumbnail popup
      Array.from(target.querySelectorAll('.catalog-item'))
        .filter(elm => !elm.dataset.checkThreadThumbnail)
        .forEach(elm => {
          elm.dataset.checkThreadThumbnail = 1;
          elm.title = elm.querySelector('.text-sm').textContent;
        });

      // Thread
      // Emoji popup
      Array.from(target.querySelectorAll('.custom-emoji-image'))
        .filter(elm => !elm.dataset.checkEmoji)
        .forEach(elm => {
          elm.dataset.checkEmoji = 1;
          const key = elm.src.replace(/^[\s\S]+\/([^\/\.]+)\.\w+$/, '$1');
          elm.title = emojis[key] || key;
        });
      // Zorome picker
      Array.from(target.querySelectorAll('.text-sm > .text-xs'))
        .filter(elm => !elm.dataset.checkZorome)
        .forEach(elm => {
          elm.dataset.checkZorome = 1;
          const after = elm.innerHTML.replace(
            /(\.\d*?)((\d)\3+)$/,
            '$1<span class="zorome">$2</span>'
          );
          if (elm.innerHTML != after) {
            elm.innerHTML = after;
          }
        });
    };
    watchTarget(modify, d.body);
  }
})(window, document);
