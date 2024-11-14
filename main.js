// ==UserScript==
// @name Scramble Visualizer
// @namespace https://github.com/TonalidadeHidrica/
// @version 0.1
// @description Visualize scramble
// @match https://jperm.net/*
// ==/UserScript==

const drawCube = (ctx, rotation) => {
  const fullSize = ctx.canvas.width;
  console.log(fullSize);

  const s3 = Math.sqrt(3);
  const basis = [[s3, -1], [-s3, -1], [0, 2]];
  const size = fullSize / 12;
  const coord = (i, j, k) => [0, 1].map(x => fullSize / 2 + (basis[i][x] * j + basis[(i + 1)%3][x] * k) * size);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        const djk = [[0, 0], [0, 1], [1, 1], [1, 0]];
        ctx.beginPath();

        for (let l = 0; l < 4; l++) {
          const [dj, dk] = djk[l];
          const tmp = coord(i, j+dj, k+dk)
          if (l == 0) ctx.moveTo(...tmp);
          else ctx.lineTo(...tmp);
        }
        ctx.closePath();

        ctx.fillStyle = "#E8E8E8";
        ctx.fill();
        ctx.strokeStyle = "#AAA";
        ctx.stroke();
      }
    }
  }
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
    wrapper.style = "display: flex";
    scrambleText.appendChild(wrapper);
    const pairs = [];
    rotations.forEach(rotation => {
      const column = document.createElement("div");
      column.style = "flex: 1;";
      wrapper.appendChild(column);

      const text = document.createElement("div");
      text.innerText = rotation;
      column.appendChild(text);

      const canvas = document.createElement("canvas");
      canvas.style = "width: 100%; aspect-ratio: 1/1;";
      canvas.width = canvas.height = 100;
      column.appendChild(canvas);

      pairs.push([rotation, canvas]);
    });
    pairs.forEach(([rotation, canvas]) => {
      drawCube(canvas.getContext('2d'), rotation)
    });

    // // Create a table to hold rotation text and corresponding canvases
    // const table = document.createElement('table');
    // table.style.borderCollapse = 'collapse';

    // const textRow = document.createElement('tr');
    // table.appendChild(textRow);
    // const canvasRow = document.createElement('tr');
    // table.appendChild(canvasRow);

    // // Populate the table with rows for each rotation
    // rotations.forEach((rotation) => {
    //   // Create a cell for the rotation text
    //   const textCell = document.createElement('td');
    //   textCell.textContent = rotation;
    //   textCell.style.padding = '5px';
    //   textRow.appendChild(textCell);

    //   // Create a cell for the canvas
    //   const canvasCell = document.createElement('td');
    //   const canvas = document.createElement('canvas');
    //   // const size = 40;
    //   canvas.style = "border: 1px solid black; width: 100%; aspect-ratio: 1/1;";
    //   // canvas.width = size;
    //   // canvas.height = size;
    //   // canvas.style.border = '1px solid black';
    //   canvasCell.appendChild(canvas);
    //   canvasRow.appendChild(canvasCell);

    //   drawCube(canvas.getContext('2d'), rotation, size);
    // });

    // Insert the table into the scramble text div
    // scrambleText.appendChild(table);
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
  observer.observe(scrambleText, { childList: true, subtree: true, characterData: true });
})();
