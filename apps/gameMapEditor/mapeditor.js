document.addEventListener('DOMContentLoaded', () => {
// Global variables
let spriteSheet;
let tileWidth, tileHeight, mapWidth, mapHeight;
let tiles = [];
let selectedTileId = null;
let mapData = [];
let mapCanvas = document.getElementById('mapCanvas');
let mapCtx = mapCanvas.getContext('2d');
let currentTool = 'draw'; // Default
let brushSize = 1;
let undoStack = [];
let redoStack = [];
let undoInterval, redoInterval;

let scale = 2; // scale tiles on the map to make them visually large

function initMapEditor() {
    tileWidth = parseInt(document.getElementById('tileWidth').value);
    tileHeight = parseInt(document.getElementById('tileHeight').value);
    mapWidth = parseInt(document.getElementById('mapWidth').value);
    mapHeight = parseInt(document.getElementById('mapHeight').value);

    mapCanvas.width = tileWidth * scale * mapWidth;
    mapCanvas.height = tileHeight * scale * mapHeight;
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);


    mapData = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(null));

    drawGrid();

    if (spriteSheet) {
        splitSpriteSheet();
    }
}

function splitSpriteSheet() {
    const container = document.getElementById('sprite-toolbar');
    container.innerHTML = '';
    tiles = [];

    const cols = Math.floor(spriteSheet.width / tileWidth);
    const rows = Math.floor(spriteSheet.height / tileHeight);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const tileCanvas = document.createElement('canvas');
            tileCanvas.width = tileWidth;
            tileCanvas.height = tileHeight;
            const ctx = tileCanvas.getContext('2d');
            ctx.drawImage(spriteSheet, x * tileWidth, y * tileHeight, tileWidth, tileHeight,
                0, 0, tileWidth, tileHeight);
            tileCanvas.className = 'tile';
            tileCanvas.dataset.tileId = tiles.length;

            tileCanvas.addEventListener('click', () => {
                document.querySelectorAll('.tile').forEach(tile => tile.classList.remove('selected'));
                tileCanvas.classList.add('selected');
                selectedTileId = parseInt(tileCanvas.dataset.tileId);
            });

            container.appendChild(tileCanvas);
            tiles.push([x, y]);
        }
    }
}

// --- Drawing Functions ---

function drawGrid() {
    mapCtx.strokeStyle = '#ccc';
    for (let x = 0; x <= mapWidth; x++) {
        mapCtx.beginPath();
        mapCtx.moveTo(x * tileWidth * scale, 0);
        mapCtx.lineTo(x * tileWidth * scale, mapHeight * tileHeight * scale);
        mapCtx.stroke();
    }
    for (let y = 0; y <= mapHeight; y++) {
        mapCtx.beginPath();
        mapCtx.moveTo(0, y * tileHeight * scale);
        mapCtx.lineTo(mapWidth * tileWidth * scale, y * tileHeight * scale);
        mapCtx.stroke();
    }
}

function drawTile(x, y, tileId) {
    const [tileX, tileY] = tiles[tileId];
    mapCtx.drawImage(
        spriteSheet,
        tileX * tileWidth, tileY * tileHeight, tileWidth, tileHeight,
        x * tileWidth * scale, y * tileHeight * scale, tileWidth * scale, tileHeight * scale
    );
}

function redrawMap() {
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const tileId = mapData[y][x];
            if (tileId !== null) {
                drawTile(x, y, tileId);
            }
        }
    }
    drawGrid();
}

// --- Editing Functions ---

function applyEdit(x, y, newTileId) {
    const oldTileId = mapData[y][x];
    if (oldTileId === newTileId) return;

    undoStack.push({ x, y, from: oldTileId, to: newTileId });
    redoStack = [];

    mapData[y][x] = newTileId;

    redrawMap();
}

function applyEditArea(centerX, centerY, newTileId) {
    const half = Math.floor((brushSize - 1) / 2);
    const changes = [];

    for (let y = centerY - half; y < centerY - half + brushSize; y++) {
        for (let x = centerX - half; x < centerX - half + brushSize; x++) {
            if (x >= 0 && y >= 0 && x < mapWidth && y < mapHeight) {
                const oldTileId = mapData[y][x];
                if (oldTileId !== newTileId) {
                    mapData[y][x] = newTileId;
                    changes.push({ x, y, from: oldTileId, to: newTileId });
                }
            }
        }
    }

    if (changes.length > 0) {
        undoStack.push({ type: 'areaEdit', changes });
        redoStack = [];
        redrawMap();
    }
}

function floodFillWithHistory(x, y, targetId, replacementId) {
    if (targetId === replacementId) return;

    const changes = [] //all tiles that changed
    const stack = [[x, y]];

    while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cy < 0 || cx >= mapWidth || cy >= mapHeight) continue;
        if (mapData[cy][cx] !== targetId) continue;

        changes.push({ x: cx, y: cy, from: targetId, to: replacementId });
        mapData[cy][cx] = replacementId;

        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
    }

    if (changes.length > 0) {
        undoStack.push({ type: 'fill', changes });
        redoStack = [];
    }
}

function clearMap() {
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            mapData[y][x] = null;
        }
    }
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    drawGrid();
}

// --- Undo / Redo ---

function undo() {
    const action = undoStack.pop();
    if (!action) return;
    if (action.type === 'areaEdit') {
        action.changes.forEach(({ x, y, from }) => {
            mapData[y][x] = from;
        });
        redoStack.push(action);
    }
    else if (action.type === 'fill') {
        // revert all tiles in fill batch
        action.changes.forEach(({ x, y, from, to }) => {
            mapData[y][x] = from;
        });
        redoStack.push(action);
    } else {
        const { x, y, from, to } = action;
        mapData[y][x] = from;
        redoStack.push({ x, y, from: to, to: from });
    }
    redrawMap();
}

function redo() {
    const action = redoStack.pop();
    if (!action) return;

    if (action.type === 'areaEdit') {
        action.changes.forEach(({ x, y, to }) => {
            mapData[y][x] = to;
        });
        undoStack.push(action);
    } else if(action.type === 'fill') {
        // reapply all tiles in fill batch
        action.changes.forEach(({ x, y, from, to }) => {
            mapData[y][x] = to;
        });
        undoStack.push(action);
    } else {
        const { x, y, from, to } = action;
        mapData[y][x] = to;
        undoStack.push(action);
    };
    redrawMap();
}

// --- User Interaction: Tools and Drawing ---
function setTool(toolName) {
    currentTool = toolName;
    document.querySelectorAll('#right-toolbar button').forEach(btn => btn.classList.remove('active'));
    if (toolName === 'draw') document.getElementById('drawToolButton').classList.add('active');
    if (toolName === 'fill') document.getElementById('fillToolButton').classList.add('active');
    if (toolName === 'erase') document.getElementById('eraserToolButton').classList.add('active');
}

let isDrawing = false;

function startDrawing(e) {
    isDrawing = true;
    drawAtMouse(e);
}

function drawWhileMoving(e) {
    if (isDrawing) {
        drawAtMouse(e);
    }
}

function stopDrawing() {
    isDrawing = false;
}

function drawAtMouse(e) {
    const rect = mapCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (tileWidth * scale));
    const y = Math.floor((e.clientY - rect.top) / (tileHeight * scale));

    if (selectedTileId !== null && x >= 0 && y >= 0 && x < mapWidth && y < mapHeight) {
        if (currentTool === 'draw') {
            applyEditArea(x, y, selectedTileId);
        }
        else if (currentTool === 'fill') {
            if (mapData[y][x] !== selectedTileId) {
                floodFillWithHistory(x, y, mapData[y][x], selectedTileId);
                redrawMap();
            }
        }
        else if (currentTool === 'erase') {
            applyEditArea(x, y, null);
        }
    }
}

// --- Export ---

function exportMap() {
    const exportType = document.getElementById('exportType').value;
    if (exportType === 'png') {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = tileWidth * mapWidth;
        exportCanvas.height = tileHeight * mapHeight;
        const ctx = exportCanvas.getContext('2d');

        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const tileId = mapData[y][x];
                if (tileId !== null) {
                    const [tileX, tileY] = tiles[tileId];
                    ctx.drawImage(spriteSheet, tileX * tileWidth, tileY * tileHeight, tileWidth, tileHeight,
                        x * tileWidth, y * tileHeight, tileWidth, tileHeight);
                }
            }
        }

        exportCanvas.toBlob(blob => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'map.png';
            a.click();
        });
    } else {

        const javaArray = mapData.map(row => '{' + row.map(id => id ?? -1).join(', ') + '}').join(',\n');
        const javaString = `int[][] map = {
${javaArray}
};`;
        const blob = new Blob([javaString], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'map.java';
        link.click();
    }
}

// --- Zoom Control ---

const zoomSlider = document.getElementById('zoomSlider');
const zoomLevelDisplay = document.getElementById('zoomLevel');

function updateZoom(newScale) {
    scale = newScale;

    // Resize canvas based on new scale
    mapCanvas.width = tileWidth * scale * mapWidth;
    mapCanvas.height = tileHeight * scale * mapHeight;

    // Redraw everything with new scale
    redrawMap();

    // Show zoom percent (rounded)
    zoomLevelDisplay.textContent = Math.round(scale * 100) + '%';
}

// --- Event Listeners ---

document.getElementById('spriteSheetInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const img = new Image();
    img.onload = function () {
        spriteSheet = img;
        initMapEditor();
    };
    img.src = URL.createObjectURL(file);
});

document.getElementById('tileWidth').addEventListener('input', () => {
    if (spriteSheet) splitSpriteSheet();
});

document.getElementById('tileHeight').addEventListener('input', () => {
    if (spriteSheet) splitSpriteSheet();
});

const brushSlider = document.getElementById('brushSizeSlider');
const brushLabel = document.getElementById('brushSizeLabel');
brushSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value, 10);
    brushLabel.textContent = `${brushSize} px`;
});

document.getElementById('drawToolButton').addEventListener('click', () => setTool('draw'));
document.getElementById('fillToolButton').addEventListener('click', () => setTool('fill'));
document.getElementById('eraserToolButton').addEventListener('click', () => setTool('erase'));
document.getElementById('undoButton').addEventListener('click', undo);
document.getElementById('redoButton').addEventListener('click', redo);

undoButton.addEventListener('mousedown', () => {
    undo();
    undoInterval = setInterval(undo, 150); // repeat every 150ms while held
});

undoButton.addEventListener('mouseup', () => {
    clearInterval(undoInterval);
});

undoButton.addEventListener('mouseleave', () => {
    clearInterval(undoInterval);
});

redoButton.addEventListener('mousedown', () => {
    redo();
    redoInterval = setInterval(redo, 150);
});

redoButton.addEventListener('mouseup', () => {
    clearInterval(redoInterval);
});

redoButton.addEventListener('mouseleave', () => {
    clearInterval(redoInterval);
});

mapCanvas.addEventListener('mousedown', startDrawing);
mapCanvas.addEventListener('mousemove', drawWhileMoving);
mapCanvas.addEventListener('mouseup', stopDrawing);

zoomSlider.addEventListener('input', () => {
    updateZoom(parseFloat(zoomSlider.value));
});

document.getElementById('toggleControls').addEventListener('click', () => {
    const controls = document.getElementById('controls');
    const toggleBtn = document.getElementById('toggleControls');
    controls.classList.toggle('collapsed');
    toggleBtn.textContent = controls.classList.contains('collapsed') ? '⏵' : '⏷';
});

document.addEventListener('keydown', function (e) {
    // Windows/Linux: Ctrl+Z / Ctrl+Y
    // macOS: MetaKey (Command) + Z / Y
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
    }
});

updateZoom(scale);

// --- Draggable Right Toolbar ---

const toolbar = document.getElementById('right-toolbar');
const dragHandle = document.getElementById('dragHandle');

let isDragging = false;
let offsetX = 0;

if (dragHandle) {
    dragHandle.style.cursor = 'move';

    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - toolbar.getBoundingClientRect().left;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const x = e.clientX - offsetX;
        toolbar.style.left = x + 'px';
        toolbar.style.right = 'auto';
        toolbar.classList.remove('left');
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = '';

        const middle = window.innerWidth / 2;
        if (e.clientX < middle) {
            toolbar.style.left = '0';
            toolbar.style.right = 'auto';
            toolbar.classList.add('left');
        } else {
            toolbar.style.right = '0';
            toolbar.style.left = 'auto';
            toolbar.classList.remove('left');
        }
    });
}

});