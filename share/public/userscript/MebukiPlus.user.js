// ==UserScript==
// @name         Mebuki Plus
// @namespace    https://TakeAsh.net/
// @version      2025-11-02_20:30
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
  const urlFavion = '/favicon.ico';
  const settings = new AutoSaveConfig({
    PopupCatalog: true,
    PopupEmoji: true,
    ThreadThumbnail: true,
    DropTime: true,
    ZoromePicker: true,
    Dice: {
      RGB: true,
    },
  }, 'MebukiPlusSettings');
  const Dice = {
    RGB: {
      Reg: /(?<dice>RGB値?[\s\S]+?dice3d255=[\s\S]*?>(?<r>\d+)\s(?<g>\d+)\s(?<b>\d+)\s\(\d+\)<[^>]+>)/giu,
      Replace: (m, html) => html.replace(
        m.groups.dice,
        `${m.groups.dice} <span style="background-color: rgb(${m.groups.r},${m.groups.g},${m.groups.b});">　　　</span>`
      ),
    },
  };
  const emojis = await getEmojis();
  await sleep(2000);
  addStyle({
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
    '.MebukiPlus_Highlight': {
      color: '#ff0000', fontSize: '125%',
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
  if (settings.ThreadThumbnail) {
    addStyle({
      '#MebukiPlus_ThreadThumbnail': {
        marginBottom: 'auto',
        height: '3em',
      },
      '#MebukiPlus_ThreadThumbnail:hover': {
        height: '12em',
      },
    });
  }
  if (settings.DropTime) {
    addStyle({
      '#MebukiPlus_DropTime': {
        color: 'var(--muted-foreground)',
        fontSize: 'var(--text-xs)',
      },
    });
  }
  watchTarget(modify, d.body);

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
  function modify(target) {
    const header = d.body.querySelector('main > header > div');
    addPanel(header);
    const elmLinkIcon = d.head.querySelector('link[rel="icon"]');
    const elmMessageContainer = d.body.querySelector('.message-container');
    if (elmMessageContainer) {
      // Thread
      elmLinkIcon.href = addThreadThumbnail(header, elmMessageContainer) || urlFavion;
      showDropTime(header, target);
      addEmojiTitlePopup(target);
      pickupZorome(target);
      modifyDice(target);
    } else {
      // Catalog
      elmLinkIcon.href = urlFavion;
      addThreadTitlePopup(target);
    }
  }
  function addPanel(header) {
    if (!header || header.querySelector('#MebukiPlus_Main')) { return; }
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
                    textContent: 'スレッド',
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
                            name: 'ThreadThumbnail',
                            checked: settings.ThreadThumbnail,
                            events: {
                              change: (ev) => { settings.ThreadThumbnail = ev.currentTarget.checked; },
                            },
                          },
                          {
                            tag: 'span',
                            textContent: 'サムネイル',
                          },
                        ],
                      },
                      {
                        tag: 'label',
                        children: [
                          {
                            tag: 'input',
                            type: 'checkbox',
                            name: 'DropTime',
                            checked: settings.DropTime,
                            events: {
                              change: (ev) => { settings.DropTime = ev.currentTarget.checked; },
                            },
                          },
                          {
                            tag: 'span',
                            textContent: '落ち',
                          },
                        ],
                      },
                    ],
                  },
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
                  },
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
  function addThreadTitlePopup(target) {
    if (!settings.PopupCatalog) { return; }
    Array.from(target.querySelectorAll('.catalog-item'))
      .filter(elm => !elm.dataset.checkThreadThumbnail)
      .forEach(elm => {
        elm.dataset.checkThreadThumbnail = 1;
        elm.title = elm.querySelector('.text-sm').textContent;
      });
  }
  function addThreadThumbnail(header, elmMessageContainer) {
    if (!settings.ThreadThumbnail) { return; }
    const elmAPspwItem = elmMessageContainer.querySelector('a[class="pspw-item"]');
    let elmThreadThumbnail = header.querySelector('#MebukiPlus_ThreadThumbnail');
    if (!elmThreadThumbnail) {
      elmThreadThumbnail = prepareElement({
        tag: 'img',
        id: 'MebukiPlus_ThreadThumbnail',
      });
      header.insertBefore(elmThreadThumbnail, header.firstElementChild);
    }
    return (elmThreadThumbnail.src = (elmAPspwItem?.href || urlFavion));
  }
  function showDropTime(header, target) {
    if (!settings.DropTime) { return; }
    const elmDropTimeSrc = d.querySelector('main > main > div:last-child > span');
    if (!elmDropTimeSrc) { return; }
    let elmDropTimeDst = header.querySelector('#MebukiPlus_DropTime');
    if (!elmDropTimeDst) {
      elmDropTimeDst = prepareElement({
        tag: 'span',
        id: 'MebukiPlus_DropTime',
        children: [
          {
            tag: 'span',
            textContent: ' 落ち:',
          },
          {
            tag: 'span',
            id: 'MebukiPlus_DropTime_Time',
            textContent: '--/-- --:--',
          },
          {
            tag: 'span',
            textContent: ' レス:',
          },
          {
            tag: 'span',
            id: 'MebukiPlus_DropTime_Res',
            textContent: '0',
          },
        ],
      });
      header.querySelector('div[class*="md:justify-start"]').appendChild(elmDropTimeDst);
    }
    const elmDropTimeTime = elmDropTimeDst.querySelector('#MebukiPlus_DropTime_Time');
    const m = /\((?<mon>\d+)月(?<day>\d+)日\s(?<hour>\d+):(?<min>\d+)\)/u.exec(elmDropTimeSrc.textContent);
    if (m) {
      const now = new Date();
      const timeDrop = new Date(`${now.getFullYear() + (now.getMonth() > parseInt(m.groups.mon) ? 1 : 0)}-${m.groups.mon}-${m.groups.day} ${m.groups.hour}:${m.groups.min}`);
      const strDrop = timeDrop.toLocaleString('ja-jp', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', });
      if (elmDropTimeTime.textContent != strDrop) {
        elmDropTimeTime.textContent = strDrop;
        if (timeDrop - now < 30 * 60 * 1000) {
          elmDropTimeTime.classList.add('MebukiPlus_Highlight');
        }
      }
    }
    const elmDropTimeRes = elmDropTimeDst.querySelector('#MebukiPlus_DropTime_Res');
    const elmLastRes = Array.from(target.querySelectorAll('.message-container')).pop();
    if (elmLastRes) {
      const elmLastResNo = elmLastRes.querySelector('.text-destructive');
      if (elmLastResNo) {
        const lastRes = parseInt(elmLastResNo.textContent);
        if (elmDropTimeRes.textContent != lastRes) {
          elmDropTimeRes.textContent = lastRes;
          if (lastRes >= 950) {
            elmDropTimeRes.classList.add('MebukiPlus_Highlight');
          }
        }
      }
    }
  }
  function addEmojiTitlePopup(target) {
    if (!settings.PopupEmoji) { return; }
    Array.from(target.querySelectorAll('.custom-emoji-image'))
      .filter(elm => !elm.dataset.checkEmoji)
      .forEach(elm => {
        elm.dataset.checkEmoji = 1;
        const key = elm.src.replace(/^[\s\S]+\/([^\/\.]+)\.\w+$/, '$1');
        elm.title = emojis[key] || key;
      });
  }
  function pickupZorome(target) {
    if (!settings.ZoromePicker) { return; }
    Array.from(target.querySelectorAll('.text-sm > .text-xs'))
      .filter(elm => !elm.dataset.checkZorome)
      .forEach(elm => {
        elm.dataset.checkZorome = 1;
        const after = elm.innerHTML.replace(
          /(\.\d*?)((\d)\3+)$/,
          '$1<span class="MebukiPlus_Highlight">$2</span>'
        );
        if (elm.innerHTML != after) {
          elm.innerHTML = after;
        }
      });
  }
  function modifyDice(target) {
    const keysDice = Object.keys(settings.Dice);
    if (keysDice.every(key => !settings.Dice[key])) { return; }
    Array.from(target.querySelectorAll('.message-content'))
      .filter(elm => !elm.dataset.checkDice)
      .forEach(elm => {
        elm.dataset.checkDice = 1;
        let m;
        keysDice.filter(key => settings.Dice[key])
          .forEach(key => {
            const dice = Dice[key];
            while (m = dice.Reg.exec(elm.innerHTML)) {
              elm.innerHTML = dice.Replace(m, elm.innerHTML);
            }
          });
      });
  }
})(window, document);
