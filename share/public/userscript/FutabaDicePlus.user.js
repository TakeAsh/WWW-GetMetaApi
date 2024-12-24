// ==UserScript==
// @name         Futaba Dice Plus
// @namespace    https://TakeAsh.net/
// @version      2024-12-22_06:50
// @description  try to take over the world!
// @author       TakeAsh68k
// @match        https://*.2chan.net/*/res/*
// @match        http://*.2chan.net/*/res/*
// @match        https://tsumanne.net/*
// @match        https://kako.futakuro.com/futa/*
// @match        https://*.ftbucket.info/*/cont/*
// @require      https://www.takeash.net/GetMeta/userscript/modules/DiceSetting.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/Util.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/PrepareElement.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/AutoSaveConfig.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/CyclicEnum.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=2chan.net
// @grant        none
// ==/UserScript==

(async (d) => {
  'use strict';
  const shiftZenToHan = '0'.charCodeAt(0) - '０'.charCodeAt(0);
  const shiftHanToZen = '０'.charCodeAt(0) - '0'.charCodeAt(0);
  const shiftMaruSuji = '①'.charCodeAt(0) - 1;
  const Position = new CyclicEnum('LEFT_TOP', 'RIGHT_TOP', 'LEFT_BOTTOM', 'RIGHT_BOTTOM');
  const settings = new AutoSaveConfig({
    Dices: new DiceSettings(
      ['うしおす', 2, 10,
        ['四面楚歌の', '普通の', '濃厚な', '幼馴染の', '三国一の', '仏陀再誕の', 'ちょっとエッチな', '極めて練度の高い', 'キングオブ', '七つの首の',],
        ['KOUSHIROUさん', 'うしおす', 'うすしお', 'カコツフォア', 'コンソメパンチ', 'きれいなうしおす', 'ベジェしお', 'にせしお', 'うしおしお', 'クラウザーさん',],
      ],
      ['ヒロイン', 3, 49,
        [
          '青肌', 'ママ', 'TS', 'ふたなり', '後輩', '虚弱', '長身',
          '人外', 'スケベ', '幼馴染', '清楚', '腹黒', 'ババア', 'メイド',
          '安産型', '筋肉質', '巨乳', 'ギャル', 'クール', '尻軽', '鬼',
          '劇重', '欠損', 'マゾ', '処女', '強気', '即堕ち', '悪堕ち',
          '腋毛', '要介護', '金髪', '小悪魔', '関西弁', '邪悪', '魔法少女',
          '女騎士', 'ベリショ', '眼鏡', '高貴', '男装', 'アイドル', '暴力',
          '無知', 'ロリ', '一途', '日焼け', '対魔忍', '怠慢', '教師',
        ],
      ],
    ),
    Position: Position.RIGHT_BOTTOM,
  }, 'FutabaDicePlus');
  await sleep(3000);
  addStyle({
    '.dice_selected': {
      backgroundColor: '#a0ffa0',
    },
    '#panelFutabaDicePlus': {
      position: 'fixed',
      padding: '4px',
      backgroundColor: '#f0e0d6',
      zIndex: '105',
    },
    '.position_LEFT_TOP': { left: '0em', top: '0em', },
    '.position_RIGHT_TOP': { right: '0em', top: '0em', },
    '.position_LEFT_BOTTOM': { left: '0em', bottom: '0em', },
    '.position_RIGHT_BOTTOM': { right: '0em', bottom: '0em', },
    '#panelFutabaDicePlusSettings': {
      minHeight: '16em',
      maxHeight: '70vh',
      overflow: 'scroll',
      display: 'grid',
    },
    '#panelFutabaDicePlusSettings div': {
      display: 'grid',
    },
    '.inputTextName': {
      width: '10em',
    },
    '.inputTextShort': {
      width: '3em',
    },
    '#panelPosition': {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    },
    '.alignRight': {
      textAlign: 'right',
    },
  });
  addPanelSettings();
  watchTarget(checkDice, getNodesByXpath('//div[@class = "thre" or @class = "text"]')[0]);

  function addPanelSettings() {
    d.body.appendChild(prepareElement({
      tag: 'details',
      id: 'panelFutabaDicePlus',
      classes: [`position_${settings.Position}`],
      children: [
        {
          tag: 'summary',
          id: 'titleFutabaDicePlus',
          innerHTML: '&#x1F3B2;',
          title: 'Futaba Dice Plus Settings',
        },
        {
          tag: 'div',
          id: 'panelFutabaDicePlusSettings',
          children: [
            {
              tag: 'fieldset',
              children: [
                {
                  tag: 'legend',
                  textContent: 'Dice',
                },
                {
                  tag: 'div',
                  children: [
                    {
                      tag: 'select',
                      id: 'FDP_selectDice',
                      children: settings.Dices.names
                        .map(name => { return { tag: 'option', text: name, value: name, }; }),
                      events: { change: selectDice },
                    },
                    {
                      tag: 'input',
                      type: 'text',
                      name: 'Name',
                      placeholder: 'Name',
                      title: 'Name',
                      classes: ['inputTextName'],
                    },
                    {
                      tag: 'span',
                      children: [
                        {
                          tag: 'input',
                          type: 'text',
                          name: 'Dices',
                          placeholder: 'Dices',
                          title: 'Dices',
                          classes: ['inputTextShort'],
                        },
                        {
                          tag: 'span',
                          textContent: 'd',
                        },
                        {
                          tag: 'input',
                          type: 'text',
                          name: 'Faces',
                          placeholder: 'Faces',
                          title: 'Faces',
                          classes: ['inputTextShort'],
                        },
                      ],
                    },
                    {
                      tag: 'textarea',
                      name: 'Items',
                      placeholder: 'Items',
                      title: 'Items',
                      cols: 12,
                      rows: 8,
                    },
                    {
                      tag: 'button',
                      type: 'button',
                      textContent: 'Add',
                      events: { click: addDice },
                    },
                    {
                      tag: 'button',
                      type: 'button',
                      textContent: 'Remove',
                      events: { click: removeDice },
                    },
                    {
                      tag: 'button',
                      type: 'button',
                      textContent: 'Post',
                      events: { click: postDice },
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
                  textContent: 'Position',
                },
                {
                  tag: 'div',
                  id: 'panelPosition',
                  children: [
                    {
                      tag: 'label',
                      title: 'Left Top',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'Position',
                          checked: settings.Position == Position.LEFT_TOP,
                          events: { change: () => { setPosition(settings.Position = Position.LEFT_TOP); }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'LT',
                        },
                      ],
                    },
                    {
                      tag: 'label',
                      title: 'Right Top',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'Position',
                          checked: settings.Position == Position.RIGHT_TOP,
                          events: { change: () => { setPosition(settings.Position = Position.RIGHT_TOP); }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'RT',
                        },
                      ],
                    },
                    {
                      tag: 'label',
                      title: 'Left Bottom',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'Position',
                          checked: settings.Position == Position.LEFT_BOTTOM,
                          events: { change: () => { setPosition(settings.Position = Position.LEFT_BOTTOM); }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'LB',
                        },
                      ],
                    },
                    {
                      tag: 'label',
                      title: 'Right Bottom',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'Position',
                          checked: settings.Position == Position.RIGHT_BOTTOM,
                          events: { change: () => { setPosition(settings.Position = Position.RIGHT_BOTTOM); }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'RB',
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
    }));
    d.getElementById('FDP_selectDice').dispatchEvent(new Event('change'));
    setPosition(settings.Position);
  }
  function selectDice(ev) {
    const select = ev.target;
    const panel = select.parentNode;
    const diceSetting = settings.Dices[select.value];
    if (!diceSetting) { return; }
    panel.querySelector('input[name="Name"]').value = diceSetting.name;
    panel.querySelector('input[name="Dices"]').value = diceSetting.dices;
    panel.querySelector('input[name="Faces"]').value = diceSetting.faces;
    panel.querySelector('textarea[name="Items"]').value = diceSetting.flattenItems;
  }
  function addDice(ev) {
    const panel = ev.target.parentNode;
    const select = panel.querySelector('select');
    const diceSetting = new DiceSetting(
      panel.querySelector('input[name="Name"]').value,
      panel.querySelector('input[name="Dices"]').value,
      panel.querySelector('input[name="Faces"]').value,
    );
    diceSetting.flattenItems = panel.querySelector('textarea[name="Items"]').value;
    settings.Dices.add(diceSetting);
    if (!select.querySelector(`option[value="${diceSetting.name}"]`)) {
      select.appendChild(prepareElement({
        tag: 'option',
        text: diceSetting.name,
        value: diceSetting.name,
      }));
      select.value = diceSetting.name;
    }
  }
  function removeDice(ev) {
    const panel = ev.target.parentNode;
    const select = panel.querySelector('select');
    const diceSetting = new DiceSetting(
      panel.querySelector('input[name="Name"]').value,
      panel.querySelector('input[name="Dices"]').value,
      panel.querySelector('input[name="Faces"]').value,
    );
    settings.Dices.remove(diceSetting);
    select.removeChild(select.querySelector(`option[value="${diceSetting.name}"]`));
  }
  function postDice(ev) {
    const panel = ev.target.parentNode;
    const name = panel.querySelector('input[name="Name"]').value;
    const dices = panel.querySelector('input[name="Dices"]').value;
    const faces = panel.querySelector('input[name="Faces"]').value;
    const message = `\n${name}\ndice${dices}d${faces}=`;
    const comment = d.getElementById('com') || d.getElementById('ftxa');
    if (!comment) { return; }
    if ('value' in comment) {
      comment.value += message;
    } else {
      comment.appendChild(d.createTextNode(message));
      comment.dispatchEvent(new InputEvent('input'));
    }
  }
  function setPosition(position = Position.LEFT_BOTTOM) {
    const panel = d.getElementById('panelFutabaDicePlus');
    Position.forEach(pos => { panel.classList.remove(`position_${pos}`); });
    panel.classList.add(`position_${position}`);
    const title = d.getElementById('titleFutabaDicePlus');
    if (position == Position.RIGHT_TOP || position == Position.RIGHT_BOTTOM) {
      title.classList.add('alignRight');
    } else {
      title.classList.remove('alignRight');
    }
  }
  function checkDice(node) {
    if (!node) { return; }
    const regDice = new RegExp(`((?<name>${settings.Dices.names.join('|')})(\\s?|<br>))?dice(?<num>\\d{1,2})d(?<faces>\\d{1,4})=(?<results>(\\d+\\s)+)\\((?<sum>\\d+)\\)`, 'i');
    for (const comment of node.querySelectorAll('div[class="comment"], blockquote')) {
      if (comment.dataset.diceChecked) { continue; }
      comment.dataset.diceChecked = 1;
      const m = regDice.exec(comment.textContent);
      if (!m) { continue; }
      const name = m.groups['name'];
      let diceSetting;
      const results = m.groups['results'].trim().split(/\s/);
      if (name && (diceSetting = settings.Dices[name])) {
        comment.innerHTML = diceSetting.replace(comment.innerHTML, results);
      } else {
        results.forEach((result) => {
          const regResultRange = new RegExp(`(^|<br>| |　)(?<result>(?<min>[0-9０-９]+)[-,ー，～・](?<max>[0-9０-９]+)[ 　]?[^0-9<>][^<> 　]*)`, 'g');
          const regResult = new RegExp(`(^|<br>| |　)(?<result>(${result}|${HanToZen(result)}|${MaruSuji(result)})[ 　]?[^0-9<>][^<> 　]*)`, 'g');
          const numResult = parseInt(result);
          let m;
          while (m = regResultRange.exec(comment.innerHTML)) {
            if (numResult < parseInt(ZenToHan(m.groups['min']))
              || parseInt(ZenToHan(m.groups['max'])) < numResult) { continue; }
            comment.innerHTML = comment.innerHTML.replace(
              m.groups['result'],
              `<span class="dice_selected">${m.groups['result']}</span>`
            );
            return;
          }
          while (m = regResult.exec(comment.innerHTML)) {
            if (/^[ 0-9()]+$/.test(m.groups['result'])) { continue; }
            comment.innerHTML = comment.innerHTML.replace(
              m.groups['result'],
              `<span class="dice_selected">${m.groups['result']}</span>`
            );
            return;
          }
        });
      }
    }
  }
  function ZenToHan(text) {
    return text.replace(/([０-９])/g, (w, p0) => String.fromCharCode(p0.charCodeAt(0) + shiftZenToHan));
  }
  function HanToZen(text) {
    return text.replace(/([0-9])/g, (w, p0) => String.fromCharCode(p0.charCodeAt(0) + shiftHanToZen));
  }
  function MaruSuji(num) {
    return String.fromCharCode(parseInt(num) + shiftMaruSuji);
  }
})(document);