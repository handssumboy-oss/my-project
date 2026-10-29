// Original scenery, independent of the official character artwork.
export function townSVG(clean = false, id = 'town') {
 return `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="510" class="town-art ${clean ? 'clean' : ''}" viewBox="0 0 680 510" role="img" aria-label="${clean ? '꽃과 하트로 가득한 따뜻한 마을' : '공원과 나눔센터, 이웃집이 있는 작은 마을'}">
 <defs><linearGradient id="${id}-land" x2="0" y2="1"><stop stop-color="#cce1a2"/><stop offset="1" stop-color="#a8ce86"/></linearGradient><filter id="${id}-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="9" stdDeviation="7" flood-color="#54754b" flood-opacity=".16"/></filter></defs>
 <ellipse cx="340" cy="435" rx="280" ry="44" fill="#6d9973" opacity=".12"/>
 <path d="M49 256Q37 224 77 204L319 81Q347 67 377 84L613 204Q651 224 632 259L387 430Q350 454 310 433Z" fill="#91b477"/>
 <path d="M49 240Q37 209 77 189L319 66Q347 52 377 69L613 189Q651 209 632 244L387 415Q350 439 310 418Z" fill="url(#${id}-land)"/>
 <path d="m137 202 361 165m-231-242 76 99-137 92m137-92 170-72" stroke="#f6ecd2" stroke-width="38" fill="none" stroke-linecap="round"/>
 <path d="m137 202 361 165m-231-242 76 99-137 92m137-92 170-72" stroke="#e5dabc" stroke-width="2" stroke-dasharray="6 8" fill="none"/>
 <g filter="url(#${id}-shadow)"><g transform="translate(363 99)"><path d="m0 53 71-35 78 39-70 40Z" fill="#f6d4a4"/><path d="m0 53 79 44v74L0 126Z" fill="#fff0cf"/><path d="m79 97 70-40v73l-70 41Z" fill="#d9bc96"/><path d="m-13 51 75-66 99 69-82 45Z" fill="#dc956b"/><path d="m79 99 82-45-6 12-76 43Z" fill="#b77354"/><path d="m15 92 22 12v29l-22-12Zm39 22 15 9v25l-15-9Z" fill="#80b7ab"/><path d="m103 107 23-13v43l-23 13Z" fill="#528b79"/><path d="m17 78 45 24" stroke="#fff9df" stroke-width="9"/><text x="18" y="86" transform="rotate(29 18 86)" font-size="9" fill="#645648">나눔센터</text></g>
 <g transform="translate(174 247)"><path d="m0 30 51-25 62 30-50 29Z" fill="#eeab87"/><path d="m0 30 63 34v56L0 85Z" fill="#ffebca"/><path d="m63 64 50-29v55l-50 30Z" fill="#dfc39f"/><path d="m-10 30 54-58 81 60-62 34Z" fill="#77a5a0"/><path d="m15 60 20 11v22l-20-11Zm63 17 20-12v21L78 98Z" fill="#92c5c3"/><path d="m43 91 13 7v18l-13-7Z" fill="#b68e66"/></g></g>
 <g fill="#7fab67"><ellipse cx="188" cy="182" rx="63" ry="32"/><ellipse cx="468" cy="305" rx="62" ry="33"/></g>
 ${[[106,218,1],[182,116,1.1],[285,98,.8],[563,229,1],[465,345,.8],[336,368,.7],[116,281,.65],[519,142,.7]].map(([x,y,s])=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="13" rx="23" ry="11" fill="#4f744f" opacity=".16"/><path d="M-4 2h8v-48h-8" fill="#aa8261"/><path d="M0-81C-32-81-37-37-20-28c-9 18 41 20 41 0C39-42 29-81 0-81" fill="#70a976"/><ellipse cx="-8" cy="-60" rx="16" ry="23" fill="#88bb83"/></g>`).join('')}
 <g transform="translate(184 176)"><path d="m-26-4 48 24 0 10-48-24Z" fill="#bb8e64"/><path d="m-28 7 48 24" stroke="#d6ad7a" stroke-width="10"/><path d="m-24 9 0 15m42 8v15" stroke="#826b53" stroke-width="4"/></g>
 <g fill="#fff7dd">${[[259,180],[403,334],[529,254],[317,300],[222,359],[457,208]].map(([x,y])=>`<g transform="translate(${x} ${y})"><circle r="5"/><circle cx="7" cy="3" r="5"/><circle cy="8" r="5"/><circle cx="-6" cy="3" r="5"/><circle cy="3" r="3" fill="#efba5e"/></g>`).join('')}</g>
 ${clean ? '<g fill="#e69a87" font-size="28"><text x="285" y="170">♥</text><text x="456" y="92">♥</text><text x="350" y="325">♥</text></g>' : ''}
 <g fill="#fff" opacity=".85"><ellipse cx="101" cy="91" rx="35" ry="12"/><ellipse cx="119" cy="82" rx="22" ry="17"/><ellipse cx="571" cy="100" rx="34" ry="11"/><ellipse cx="558" cy="91" rx="20" ry="15"/></g>
 </svg>`;
}
export function placeholder() {
 return `<svg viewBox="0 0 140 160" role="img" aria-label="임시 캐릭터 도형"><ellipse cx="70" cy="148" rx="40" ry="8" fill="#426c55" opacity=".15"/><rect x="35" y="60" width="70" height="78" rx="30" fill="#f4c95c"/><circle cx="70" cy="53" r="40" fill="#ffdf81"/><circle cx="57" cy="50" r="3" fill="#435f52"/><circle cx="83" cy="50" r="3" fill="#435f52"/><path d="M62 64q8 9 16 0" fill="none" stroke="#435f52" stroke-width="3" stroke-linecap="round"/><path d="M47 98 28 79m65 19 19-21" stroke="#f4c95c" stroke-width="16" stroke-linecap="round"/><path d="M53 132v11m34-11v11" stroke="#e8b34b" stroke-width="17" stroke-linecap="round"/><path d="M70 116 57 103c-9-12 10-17 13-6 4-11 22-6 13 6Z" fill="#fff7e4"/></svg>`;
}
