// ==UserScript==
// @name         VisZWSP
// @namespace    https://TakeAsh.net/
// @version      2025-07-02_11:31
// @description  Visualize Zero Width Space
// @author       TakeAsh
// @match        https://*.2chan.net/b/res/*
// @match        https://tsumanne.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=2chan.net
// @grant        none
// ==/UserScript==

((d) => {
    'use strict';
    setTimeout(() => {
        const styleZWSP = d.createElement('style');
        styleZWSP.textContent = '.ZWSP { background-color: #ff8080; }';
        d.head.appendChild(styleZWSP);
        visualize(d);
        const observer = new MutationObserver(
            (mutations) => mutations.forEach(
                (mutation) => visualize(mutation.target)));
        observer.observe(d, { childList: true, subtree: true, });
    }, 2000);
    function visualize(target) {
        Array.from(target.querySelectorAll('td[class="rtd"], div[data-number]'))
            .forEach(comment => {
                comment.innerHTML = comment.innerHTML.replace(
                    /(\u200b|&#8203;|&#x200B;|&ZeroWidthSpace;)(?![\/?&])/giu,
                    '<span class="ZWSP">ZWSP</span>'
                );
            });
    }
})(document);
