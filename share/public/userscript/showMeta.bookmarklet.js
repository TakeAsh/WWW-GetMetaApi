﻿javascript:
(async (d) => {
  const scripts = [
    [
      'https://www.takeash.net/js/modules/Util.js',
      'https://www.takeash.net/js/modules/PrepareElement.js',
      'https://www.takeash.net/js/modules/AutoSaveConfig.js',
      'https://www.takeash.net/js/modules/CyclicEnum.js',
    ],
    [
      'https://www.takeash.net/GetMeta/userscript/showMeta.user.js',
    ],
  ];
  const loadScript = (src) => new Promise((resolve, reject) => {
    const name = (/([^\/]+)$/.exec(src))[1];
    const script = d.createElement('script');
    script.onload = () => { resolve(name); };
    script.onerror = reject;
    script.type = name.endsWith('.mjs') ? 'module' : null;
    script.src = src;
    d.head.appendChild(script);
  });
  for (const group of scripts) {
    console.log(await Promise.all(group.map((src) => loadScript(src))));
  }
})(document);
