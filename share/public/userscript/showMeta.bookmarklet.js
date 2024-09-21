javascript:
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
    const script = d.createElement('script');
    script.onload = () => { resolve((/([^\/]+)$/.exec(src))[1]); };
    script.onerror = reject;
    script.src = src;
    d.head.appendChild(script);
  });
  for (const group of scripts) {
    const results = await Promise.all(group.map((src) => loadScript(src)));
    console.log(results);
  }
})(document);
