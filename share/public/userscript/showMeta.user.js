// ==UserScript==
// @name         Show Meta data
// @namespace    https://TakeAsh.net/
// @version      2024-09-22_17:30
// @description  show meta data for links
// @author       TakeAsh68k
// @match        https://*.2chan.net/*/res/*
// @match        http://*.2chan.net/*/res/*
// @match        https://tsumanne.net/*
// @match        https://kako.futakuro.com/futa/*
// @match        http://*.ftbucket.info/*/cont/*
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/Util.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/PrepareElement.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/AutoSaveConfig.js
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/CyclicEnum.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        none
// ==/UserScript==

(async (w, d) => {
  'use strict';
  const heightThumbnail = 96;
  const uriGetMeta = 'https://www.takeash.net/GetMeta/api/getMeta.cgi';
  const uriIconBase = 'https://raw.githubusercontent.com/TakeAsh/WWW-GetMetaApi/refs/heads/master/share/public/image';
  const xpathContentLinks = './/a[(contains(@href, "http://") or contains(@href, "https://")) and not(@data-informed) and not(@data-index)]';
  const regJump = new RegExp(`^${quotemeta(location.origin)}\\/bin\\/jump\\.php\\?`);
  const Network = new CyclicEnum('NEVER', 'NOT_CELLULAR', 'ANY');
  const DomainType = new CyclicEnum('ALLOW', 'DENY');
  const Position = new CyclicEnum('LEFT_TOP', 'RIGHT_TOP', 'LEFT_BOTTOM', 'RIGHT_BOTTOM');
  const IconSize = new CyclicEnum('SMALL', 'MIDDLE', 'LARGE');
  const settings = new AutoSaveConfig({
    Network: Network.NOT_CELLULAR,
    Domain: {
      Type: DomainType.DENY,
      List: [
        'abema.tv', 'iwara.tv', 'tver.jp', 'twitter.com', 'www.iwara.tv', 'x.com',
      ],
    },
    Position: Position.LEFT_BOTTOM,
    IconSize: IconSize.SMALL,
  }, 'ShowMetaSettings');
  const regDomainList = !settings.Domain.List.length ? null
    : new RegExp(`:\/\/(${settings.Domain.List.map(domain => quotemeta(domain)).join('|')})\/`);
  const regForceIgnoreUrls = new RegExp([
    '://dec.2chan.net/up/',
    '://dec.2chan.net/up2/'
  ].map(domain => quotemeta(domain)).join('|'));
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const connectionType = connection.type || connection.effectiveType;
  console.log({ SettingNetwork: settings.Network, ConnectionType: connectionType, });
  const history = {};
  let index = 0;
  await sleep(3000);
  addStyle({
    '.showMeta_parent': { display: 'flex', },
    '.showMeta_title': { backgroundColor: '#eeaa88', },
    'img[data-large]': {
      maxWidth: '800px',
      maxHeight: '600px',
    },
    '.popup_base': {
      position: 'relative',
    },
    '.popup_thumbnail': {
      height: heightThumbnail,
    },
    '.popup_popup': {
      display: 'none',
      position: 'absolute',
      top: '0px',
      left: '0px',
      zIndex: 2,
    },
    '.popup_base:hover .popup_popup': {
      display: 'block',
    },
    '#panelShowMeta': {
      position: 'fixed',
      padding: '4px',
      backgroundColor: '#f0e0d6',
      zIndex: '105',
    },
    '.position_LEFT_TOP': { left: '0em', top: '0em', },
    '.position_RIGHT_TOP': { right: '0em', top: '0em', },
    '.position_LEFT_BOTTOM': { left: '0em', bottom: '0em', },
    '.position_RIGHT_BOTTOM': { right: '0em', bottom: '0em', },
    '.gridNetwork': {
      display: 'grid',
    },
    '.gridPosition': {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    },
    '.gridIconSize': {
      display: 'grid',
    },
    '.alignRight': {
      textAlign: 'right',
    },
  });
  addPanelSettings();
  const target = getNodesByXpath('//div[@class = "thre" or @class = "text"]')[0]
    || d.body;
  checkLinks(target);
  const observer = new MutationObserver(
    (mutations) => mutations.forEach(
      (mutation) => checkLinks(mutation.target)));
  observer.observe(target, { childList: true, subtree: true, });

  function addPanelSettings() {
    d.body.appendChild(prepareElement({
      tag: 'details',
      id: 'panelShowMeta',
      classes: [`position_${settings.Position}`],
      children: [
        {
          tag: 'summary',
          id: 'titleShowMeta',
          children: [{
            tag: 'img',
            id: 'iconShowMeta',
            width: 32,
            height: 32,
            src: `${uriIconBase}/ShowMeta32.png`,
          },],
          title: 'ShowMeta Settings',
        },
        {
          tag: 'div',
          children: [
            {
              tag: 'fieldset',
              children: [
                {
                  tag: 'legend',
                  textContent: 'Network',
                },
                {
                  tag: 'div',
                  classes: ['gridNetwork'],
                  children: [
                    {
                      tag: 'label',
                      title: '機能オフ',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'Network',
                          checked: settings.Network == Network.NEVER,
                          events: { change: () => { settings.Network = Network.NEVER; }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'Never',
                        },
                      ],
                    },
                    {
                      tag: 'label',
                      title: 'WiFi 接続時のみ',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'Network',
                          checked: settings.Network == Network.NOT_CELLULAR,
                          events: { change: () => { settings.Network = Network.NOT_CELLULAR; }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'WiFi',
                        },
                      ],
                    },
                    {
                      tag: 'label',
                      title: 'WiFi/キャリア回線どちらでも',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'Network',
                          checked: settings.Network == Network.ANY,
                          events: { change: () => { settings.Network = Network.ANY; }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'Any',
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
                  textContent: 'Domain',
                },
                {
                  tag: 'div',
                  children: [
                    {
                      tag: 'label',
                      title: '許す',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'DomainType',
                          checked: settings.Domain.Type == DomainType.ALLOW,
                          events: { change: () => { settings.Domain.Type = DomainType.ALLOW; }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'Allow',
                        },
                      ],
                    },
                    {
                      tag: 'label',
                      title: '絶対に許さないよ！',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'DomainType',
                          checked: settings.Domain.Type == DomainType.DENY,
                          events: { change: () => { settings.Domain.Type = DomainType.DENY; }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'Deny',
                        },
                      ],
                    },
                  ],
                },
                {
                  tag: 'textarea',
                  id: 'textareaDomainList',
                  title: 'Domain List',
                  placeholder: 'Domain List',
                  cols: 16,
                  rows: 8,
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
                  classes: ['gridPosition'],
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
            {
              tag: 'fieldset',
              children: [
                {
                  tag: 'legend',
                  textContent: 'IconSize',
                },
                {
                  tag: 'div',
                  classes: ['gridIconSize'],
                  children: [
                    {
                      tag: 'label',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'IconSize',
                          checked: settings.IconSize == IconSize.SMALL,
                          events: { change: () => { setIconSize(settings.IconSize = IconSize.SMALL); }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'Small',
                        },
                      ],
                    },
                    {
                      tag: 'label',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'IconSize',
                          checked: settings.IconSize == IconSize.MIDDLE,
                          events: { change: () => { setIconSize(settings.IconSize = IconSize.MIDDLE); }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'Middle',
                        },
                      ],
                    },
                    {
                      tag: 'label',
                      children: [
                        {
                          tag: 'input',
                          type: 'radio',
                          name: 'IconSize',
                          checked: settings.IconSize == IconSize.LARGE,
                          events: { change: () => { setIconSize(settings.IconSize = IconSize.LARGE); }, },
                        },
                        {
                          tag: 'span',
                          textContent: 'Large',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        }
      ],
      events: { toggle: onSettingsToggle, },
    }));
    setPosition(settings.Position);
    setIconSize(settings.IconSize);
  }

  function onSettingsToggle(event) {
    const details = event.target;
    const textareaDomainList = details.querySelector('#textareaDomainList');
    if (details.open) {
      textareaDomainList.value = settings.Domain.List.join('\n');
    } else {
      const hashDomains = textareaDomainList.value.trim().split('\n').reduce(
        (acc, cur) => { acc[cur.trim()] = 1; return acc; },
        {}
      )
      settings.Domain.List = Object.keys(hashDomains).sort();
    }
  }

  function setPosition(position = Position.LEFT_BOTTOM) {
    const panel = d.getElementById('panelShowMeta');
    Position.forEach(pos => { panel.classList.remove(`position_${pos}`); });
    panel.classList.add(`position_${position}`);
    const title = d.getElementById('titleShowMeta');
    if (position == Position.RIGHT_TOP || position == Position.RIGHT_BOTTOM) {
      title.classList.add('alignRight');
    } else {
      title.classList.remove('alignRight');
    }
  }

  function setIconSize(iconSize = IconSize.SMALL) {
    const icon = d.getElementById('iconShowMeta');
    Object.assign(icon,
      iconSize == IconSize.LARGE ? { width: 128, height: 128, src: `${uriIconBase}/ShowMeta128.png` } :
        iconSize == IconSize.MIDDLE ? { width: 64, height: 64, src: `${uriIconBase}/ShowMeta64.png` } :
          { width: 32, height: 32, src: `${uriIconBase}/ShowMeta32.png` }
    );
  }

  function canRunOnNetwork() {
    return settings.Network == Network.NEVER ? false :
      settings.Network == Network.NOT_CELLULAR ? connectionType != 'cellular' :
        settings.Network == Network.ANY ? connectionType != 'none' :
          false;
  }

  function isTargetLink(link) {
    if (regForceIgnoreUrls.test(link.href)) { return false; }
    return (settings.Domain.Type == DomainType.ALLOW && !!regDomainList && regDomainList.test(link.href))
      || (settings.Domain.Type == DomainType.DENY && (!regDomainList || !regDomainList.test(link.href)));
  }

  function checkLinks(node) {
    if (!node || !canRunOnNetwork()) { return; }
    const links = getNodesByXpath(xpathContentLinks, node)
      .filter(link => isTargetLink(link))
      .map(link => { link.dataset.index = ++index; return link; })
      .filter(link => {
        const key = link + '?' + link.dataset.index;
        const checked = history[key];
        history[key] = true;
        return !checked;
      });
    while (links.length > 0) {
      inform(links.splice(0, 10))
    }
  }

  async function inform(links) {
    if (!links || !links.length) { return false; }
    const formData = new FormData();
    links.forEach(link => {
      link.href = link.href.replace(regJump, '');
      formData.append('uri', link.href);
    });
    const result = await getMeta(formData);
    links.forEach(async (link) => {
      link.target = '_blank';
      link.dataset.informed = 1;
      const meta = result.metas[link.href];
      if (!meta || !meta['_title']) { return; }
      const spanMetaLink = d.createElement('span');
      link.parentNode.replaceChild(spanMetaLink, link);
      spanMetaLink.appendChild(link);
      spanMetaLink.appendChild(prepareElement({
        tag: 'div',
        classes: ['showMeta_parent'],
        children: [
          {
            tag: 'div',
            classes: ['popup_base'],
            children: [
              {
                tag: 'img',
                classes: ['popup_thumbnail'],
                src: meta['_image'],
                height: heightThumbnail,
                loading: 'lazy',
              },
              {
                tag: 'img',
                classes: ['popup_popup'],
                src: meta['_image'],
                loading: 'lazy',
                dataset: { large: 1 },
              },
            ],
          },
          {
            tag: 'div',
            children: [
              {
                tag: 'div',
                classes: ['showMeta_title'],
                textContent: meta['_title'],
              },
              {
                tag: 'div',
                textContent: meta['_description'],
              },
            ],
          },
        ],
      }));
    });
    return true;
  }

  async function getMeta(formData) {
    const response = await fetch(
      uriGetMeta,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          origin: location.origin,
          referer: location.href,
          accept: 'application/json',
        },
        body: formData,
      }
    );
    return await response.json();
  }
})(window, document);
