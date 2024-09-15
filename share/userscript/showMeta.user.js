// ==UserScript==
// @name         Show Meta data
// @namespace    https://TakeAsh.net/
// @version      2024-09-13_19:03
// @description  show meta data for links
// @author       TakeAsh68k
// @match        https://*.2chan.net/*/res/*
// @match        http://*.2chan.net/*/res/*
// @match        https://tsumanne.net/*
// @match        http://kako.futakuro.com/futa/*
// @match        http://*.ftbucket.info/*/cont/*
// @require      https://raw.githubusercontent.com/TakeAsh/js-Modules/main/modules/PrepareElement.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        none
// ==/UserScript==

(async (w, d) => {
  'use strict';
  const heightThumbnail = 96;
  const uriGetMeta = 'https://www.takeash.net/GetMeta/api/getMeta.cgi';
  const supportedHosts = [
    'bookwalker.jp', 'www.bookwalker.jp', 'r18.bookwalker.jp', 'help.bookwalker.jp',
  ];
  const xpathContentLinks = './/a[('
    + supportedHosts.map(host => 'contains(@href, "//' + host + '/")').join(' or ')
    + ') and not(@data-informed) and not(@data-index)]';
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
  });
  const target = getNodesByXpath('//div[@class = "thre" or @class = "text"]')[0]
    || d.body;
  checkLinks(target);
  const observer = new MutationObserver(
    (mutations) => mutations.forEach(
      (mutation) => checkLinks(mutation.target)));
  observer.observe(target, { childList: true, subtree: true, });

  function checkLinks(node) {
    if (!node) { return; }
    const links = getNodesByXpath(xpathContentLinks, node)
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
    links.forEach(link => { formData.append('uri', link.href); });
    const result = await getMeta(formData);
    links.forEach(async (link) => {
      link.target = '_blank';
      link.dataset.informed = 1;
      const meta = result.metas[link.href];
      if (!meta['_title']) { return; }
      const div = d.createElement('div');
      link.parentNode.replaceChild(div, link);
      div.appendChild(link);
      div.appendChild(prepareElement({
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

  function sleep(ms, resolve) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getNodesByXpath(xpath, context) {
    const itr = d.evaluate(
      xpath,
      context || d,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    const nodes = [];
    let node = null;
    while (node = itr.iterateNext()) {
      nodes.push(node);
    }
    return nodes;
  }
})(window, document);