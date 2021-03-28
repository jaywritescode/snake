// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = "#app {\n  --snake-color: #30302a;\n  --food-color: #e6902f;\n  --wall-color: #345333;\n}\n\n.overlay {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  font-size: 7rem;\n  background-color: white;\n\n  /* center text horizontally and vertically */\n  display: flex;\n  justify-content: center;\n  align-items: center;\n\n  cursor: default;\n}\n\n.cell {\n  padding-top: 100%; /* forces the 1:1 aspect ratio */\n}";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}