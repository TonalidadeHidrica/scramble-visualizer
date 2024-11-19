// ==UserScript==
// @name Scramble Visualizer
// @namespace https://github.com/TonalidadeHidrica/
// @version 0.1
// @description Visualize scramble
// @match https://jperm.net/*
// ==/UserScript==

function drawArrow(ctx, [[x1, y1], [x2, y2]], color = 'black', strokeWidth = 2) {
  const headLength = 10; // Length of the arrowhead

  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();

  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

const drawCube = (ctx, rotation) => {
  const fullSize = ctx.canvas.width;
  console.log(fullSize);

  const s3 = Math.sqrt(3);
  const basis = [[s3, -1], [-s3, -1], [0, 2]];
  const size = fullSize / 12;
  const coord = (i, [j, k]) => [0, 1].map(x => fullSize / 2 + (basis[i][x] * j + basis[(i + 1) % 3][x] * k) * size);

  const [rotAxis, rotRow] = ((c) => {
    switch (c) {
      case "R": return [0, 0];
      case "L": return [0, 2];
      case "U": return [1, 0];
      case "D": return [1, 2];
      case "F": return [2, 0];
      case "B": return [2, 2];
    };
    throw new Error(`Invalid rotation: ${c}`);
  })(rotation[0]);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        const djk = [[0, 0], [0, 1], [1, 1], [1, 0]];
        ctx.beginPath();

        for (let l = 0; l < 4; l++) {
          const [dj, dk] = djk[l];
          const tmp = coord(i, [j + dj, k + dk])
          if (l == 0) ctx.moveTo(...tmp);
          else ctx.lineTo(...tmp);
        }
        ctx.closePath();

        const fill = (i === rotAxis && k === rotRow) || (i === (rotAxis + 1) % 3 && j === rotRow) || (i === (rotAxis + 2) % 3 && rotRow == 0);
        ctx.fillStyle = fill ? "#BBB" : "#E8E8E8";
        ctx.fill();
        ctx.strokeStyle = "#989898";
        ctx.stroke();
      }
    }
  }

  const color = ["red", "green", "blue"][rotAxis];

  const rev = rotation.includes("'") ^ (rotRow === 2);
  for (let h = 0; h < (rotation.includes("2") ? 2 : 1); h++) {
    const di = +((!!h) ^ rev);
    const pts = [
      [[0.5, rotRow + 0.5], [2.5, rotRow + 0.5]],
      [[rotRow + 0.5, 2.5], [rotRow + 0.5, 0.5]],
    ][di];
    if (rev) pts.reverse();
    drawArrow(ctx, pts.map(p => coord((rotAxis + di) % 3, p)), color, 3);
  }

  const pos = coord((rotAxis + 2) % 3, rotRow == 0 ? [1.5, 1.5] : [-0.5, -0.5]);
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Draw outer stroke
  ctx.fillStyle = ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.strokeText(rotation, ...pos);
  // Draw filled text
  ctx.fillStyle = color;
  ctx.fillText(rotation, ...pos);
};

(() => {
  'use strict';

  // Locate the scramble text element
  const scrambleText = document.getElementById('scramble-text');
  if (!scrambleText) return;

  // Function to update the canvas elements
  function updateCanvases() {
    if (scrambleText.querySelector('div')) return;

    // Parse the scramble sequence (replace existing content)
    const rotations = scrambleText.textContent.trim().split(/\s+/);
    scrambleText.textContent = ''; // Clear the original text content

    const wrapper = document.createElement("div");
    wrapper.style = "display: flex; padding: 3px;";
    scrambleText.appendChild(wrapper);
    const pairs = [];
    rotations.forEach(rotation => {
      const column = document.createElement("div");
      column.style = "flex: 1;";
      wrapper.appendChild(column);

      // const text = document.createElement("div");
      // text.innerText = rotation;
      // column.appendChild(text);

      const canvas = document.createElement("canvas");
      canvas.style = "width: 100%; aspect-ratio: 1/1;";
      canvas.width = canvas.height = 100;
      column.appendChild(canvas);

      pairs.push([rotation, canvas]);
    });
    pairs.forEach(([rotation, canvas]) => {
      if (rotation) drawCube(canvas.getContext('2d'), rotation)
    });
  }

  // Initialize the canvases for the first time
  updateCanvases();

  // Set up a MutationObserver to detect changes in the scramble text
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        updateCanvases();
        break;
      }
    }
  });

  // Start observing the scramble text element for changes
  observer.observe(scrambleText, {childList: true, subtree: true, characterData: true});
})();
