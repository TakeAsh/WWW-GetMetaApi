// ==UserScript==
// @name         Mebuki Plus
// @namespace    https://TakeAsh.net/
// @version      2025-10-29_03:00
// @description  enhance Mebuki channel
// @author       TakeAsh
// @match        https://mebuki.moe/app
// @match        https://mebuki.moe/app/*
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/Util.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/PrepareElement.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/AutoSaveConfig.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mebuki.moe
// @grant        none
// ==/UserScript==

(async (w, d) => {
  'use strict';
  const urlCustomEmoji = 'https://mebuki.moe/api/custom-emoji';
  const urlEmoji = 'https://mebuki.moe/assets/emoji-data-CJuCqmpZ.js';
  const settings = new AutoSaveConfig({
    PopupCatalog: true,
    PopupEmoji: true,
    ZoromePicker: true,
    Dice: {
      RGB: true,
    },
  }, 'MebukiPlusSettings');
  const Dice = {
    RGB: {
      Reg: /(?<dice>RGB値?[\s\S]+?dice3d255=[\s\S]*?>(?<r>\d+)\s(?<g>\d+)\s(?<b>\d+)\s\(\d+\)<[^>]+>)/giu,
      Replace: (m, html) => html.replace(
        m.groups['dice'],
        `${m.groups['dice']} <span style="background-color: rgb(${m.groups['r']},${m.groups['g']},${m.groups['b']});">　　　</span>`
      ),
    },
  };
  const emojis = await getEmojis();
  await sleep(2000);
  addStyle({
    '.zorome': {
      color: '#ff0000', fontSize: '125%',
    },
    '#MebukiPlus_Main': {
      marginBottom: 'auto',
    },
    '#MebukiPlus_Summary': {
      textAlign: 'right',
    },
    '#MebukiPlus_Body': {
      background: 'var(--card)',
    },
    '#MebukiPlus_Body > fieldset': {
      border: 'solid 0.15em',
      margin: '0.5em',
      padding: '0em 0.5em',
    },
    '#MebukiPlus_Body > fieldset > div': {
      display: 'grid',
    },
  });
  if (settings.PopupCatalog) {
    addStyle({
      '.catalog-item:hover': {
        transform: 'translate(50%,50%) translate(-6em,-6em)', zIndex: 20,
      },
      '.catalog-image': {
        position: 'relative',
      },
      '.catalog-image:hover': {
        width: 'initial', height: '12em', position: 'absolute', zIndex: 20,
      },
    });
  }
  if (settings.PopupEmoji) {
    addStyle({
      '.custom-emoji': {
        pointerEvents: 'auto',
      },
      '.custom-emoji:hover > .custom-emoji-image': {
        width: 'initial', height: '6em', position: 'relative', zIndex: 10,
      },
    });
  }
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
      // Panel
      const header = d.body.querySelector('main > header > div');
      if (!header.querySelector('#MebukiPlus_Main')) {
        header.appendChild(prepareElement({
          tag: 'div',
          id: 'MebukiPlus_Main',
          children: [{
            tag: 'details',
            children: [
              {
                tag: 'summary',
                id: 'MebukiPlus_Summary',
                innerHTML: '&#x1f331;+',
                title: 'Mebuki Plus',
              },
              {
                tag: 'div',
                id: 'MebukiPlus_Body',
                children: [
                  {
                    tag: 'fieldset',
                    children: [
                      {
                        tag: 'legend',
                        textContent: 'ポップアップ',
                      },
                      {
                        tag: 'div',
                        children: [
                          {
                            tag: 'label',
                            children: [
                              {
                                tag: 'input',
                                type: 'checkbox',
                                name: 'PopupCatalog',
                                checked: settings.PopupCatalog,
                                events: {
                                  change: (ev) => { settings.PopupCatalog = ev.currentTarget.checked; },
                                },
                              },
                              {
                                tag: 'span',
                                textContent: 'カタログ',
                              },
                            ],
                          },
                          {
                            tag: 'label',
                            children: [
                              {
                                tag: 'input',
                                type: 'checkbox',
                                name: 'PopupEmoji',
                                checked: settings.PopupEmoji,
                                events: {
                                  change: (ev) => { settings.PopupEmoji = ev.currentTarget.checked; },
                                },
                              },
                              {
                                tag: 'span',
                                textContent: '絵文字',
                              },
                            ],
                          },
                        ],
                      }
                    ],
                  },
                  {
                    tag: 'fieldset',
                    children: [
                      {
                        tag: 'legend',
                        textContent: 'ゾロ目',
                      },
                      {
                        tag: 'div',
                        children: [
                          {
                            tag: 'label',
                            children: [
                              {
                                tag: 'input',
                                type: 'checkbox',
                                name: 'ZoromePicker',
                                checked: settings.ZoromePicker,
                                events: {
                                  change: (ev) => { settings.ZoromePicker = ev.currentTarget.checked; },
                                },
                              },
                              {
                                tag: 'span',
                                textContent: 'ピックアップ',
                              },
                            ],
                          },
                        ],
                      }
                    ],
                  },
                  {
                    tag: 'fieldset',
                    children: [
                      {
                        tag: 'legend',
                        textContent: 'ダイス',
                      },
                      {
                        tag: 'div',
                        children: [
                          {
                            tag: 'label',
                            children: [
                              {
                                tag: 'input',
                                type: 'checkbox',
                                name: 'DiceRGB',
                                checked: settings.Dice.RGB,
                                events: {
                                  change: (ev) => { settings.Dice.RGB = ev.currentTarget.checked; },
                                },
                              },
                              {
                                tag: 'span',
                                textContent: 'RGB',
                              },
                            ],
                          },

                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          }],
        }));
      }
      // Catalog
      // Thread thumbnail popup
      if (settings.PopupCatalog) {
        Array.from(target.querySelectorAll('.catalog-item'))
          .filter(elm => !elm.dataset.checkThreadThumbnail)
          .forEach(elm => {
            elm.dataset.checkThreadThumbnail = 1;
            elm.title = elm.querySelector('.text-sm').textContent;
          });
      }

      // Thread
      // Emoji popup
      if (settings.PopupEmoji) {
        Array.from(target.querySelectorAll('.custom-emoji-image'))
          .filter(elm => !elm.dataset.checkEmoji)
          .forEach(elm => {
            elm.dataset.checkEmoji = 1;
            const key = elm.src.replace(/^[\s\S]+\/([^\/\.]+)\.\w+$/, '$1');
            elm.title = emojis[key] || key;
          });
      }
      // Zorome picker
      if (settings.ZoromePicker) {
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
      }
      // Dice
      // RGB
      if (Object.keys(settings.Dice).some(key => settings.Dice[key])) {
        Array.from(target.querySelectorAll('.message-content'))
          .filter(elm => !elm.dataset.checkDice)
          .forEach(elm => {
            elm.dataset.checkDice = 1;
            let m;
            Object.keys(settings.Dice)
              .filter(key => settings.Dice[key])
              .forEach(key => {
                const dice = Dice[key];
                while (m = dice.Reg.exec(elm.innerHTML)) {
                  elm.innerHTML = dice.Replace(m, elm.innerHTML);
                }
              });
          });
      }
    };
    watchTarget(modify, d.body);
  }
})(window, document);
