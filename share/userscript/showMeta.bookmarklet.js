javascript:
(async (d) => {
  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = d.createElement('script');
    script.onload = () => { resolve((/([^\/]+)$/.exec(src))[1]); };
    script.onerror = reject;
    script.src = src;
    d.head.appendChild(script);
  });
  const results = await Promise.all([
    'https://www.takeash.net/js/modules/PrepareElement.js',
    'https://www.takeash.net/GetMeta/userscript/showMeta.user.js',
  ].map((src) => loadScript(src)));
  console.log(results);
})(document);
