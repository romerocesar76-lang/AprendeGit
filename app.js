// ============= SIMULADOR DE GIT =============

// Estado del simulador
const gitSimulator = {
    commits: [],
    branches: {
        main: {
            color: '#FF6B6B',
            head: 0,  // índice del commit
            commits: [0]
        }
    },
    currentBranch: 'main',
    nextCommitId: 1,
    history: [],
    branchColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
};

document.addEventListener('DOMContentLoaded', function() {
    setupSimulator();
    
    // Event listeners para botones del simulador
    if (document.getElementById('sim-commit')) {
        document.getElementById('sim-commit').addEventListener('click', handleCommit);
        document.getElementById('sim-branch').addEventListener('click', handleBranch);
        document.getElementById('sim-checkout').addEventListener('click', handleCheckout);
        document.getElementById('sim-merge').addEventListener('click', handleMerge);
        document.getElementById('sim-reset').addEventListener('click', handleReset);
    }

    const commandInput = document.getElementById('command-input');
    const commandSubmit = document.getElementById('command-submit');

    if (commandInput) {
        commandInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                executeCommand(commandInput.value);
            }
        });
    }

    if (commandSubmit) {
        commandSubmit.addEventListener('click', function() {
            if (commandInput) {
                executeCommand(commandInput.value);
            }
        });
    }
    
    // Para las páginas individuales (commit.html, branch.html, etc.)
    if (document.getElementById('simulate-commit')) {
        let commitCount = 0;
        document.getElementById('simulate-commit').addEventListener('click', function() {
            commitCount++;
            document.getElementById('commits').textContent = commitCount;
            const list = document.getElementById('commit-list');
            const li = document.createElement('li');
            li.textContent = `Commit ${commitCount}: Cambios guardados`;
            list.appendChild(li);
        });
    }

    if (document.getElementById('simulate-branch')) {
        let branches = ['main'];
        document.getElementById('simulate-branch').addEventListener('click', function() {
            const name = document.getElementById('branch-name').value;
            if (name && !branches.includes(name)) {
                branches.push(name);
                document.getElementById('branches').textContent = branches.join(', ');
            }
        });
    }

    if (document.getElementById('simulate-merge')) {
        document.getElementById('simulate-merge').addEventListener('click', function() {
            const branch = document.getElementById('merge-branch').value;
            document.getElementById('merge-status').textContent = `Merge completado desde ${branch}`;
        });
    }

    if (document.getElementById('simulate-checkout-main')) {
        document.getElementById('simulate-checkout-main').addEventListener('click', function() {
            document.getElementById('current-branch').textContent = 'main';
        });
    }

    if (document.getElementById('simulate-checkout-feature')) {
        document.getElementById('simulate-checkout-feature').addEventListener('click', function() {
            document.getElementById('current-branch').textContent = 'feature';
        });
    }
});

function setupSimulator() {
    // Agregar primer commit
    gitSimulator.commits.push({
        id: 0,
        message: 'Initial commit',
        branch: 'main'
    });
    
    redrawSimulator();
}

function handleCommit(message) {
    if (message === undefined) {
        message = prompt('Escribe el mensaje del commit:');
    }
    if (message === null) return;
    
    const newCommit = {
        id: gitSimulator.nextCommitId++,
        message: message || 'commit',
        branch: gitSimulator.currentBranch
    };
    
    gitSimulator.commits.push(newCommit);
    gitSimulator.branches[gitSimulator.currentBranch].head = newCommit.id;
    gitSimulator.branches[gitSimulator.currentBranch].commits.push(newCommit.id);
    gitSimulator.history.push(`git commit -m "${newCommit.message}"`);
    
    redrawSimulator();
}

function handleBranch(branchName) {
    if (branchName === undefined) {
        branchName = prompt('Nombre de la rama:');
    }
    if (branchName === null || branchName === '') return;
    if (gitSimulator.branches[branchName]) {
        alert('La rama ya existe');
        return;
    }
    
    const colorIndex = Object.keys(gitSimulator.branches).length % gitSimulator.branchColors.length;
    gitSimulator.branches[branchName] = {
        color: gitSimulator.branchColors[colorIndex],
        head: gitSimulator.branches[gitSimulator.currentBranch].head,
        commits: [gitSimulator.branches[gitSimulator.currentBranch].head]
    };
    
    gitSimulator.history.push(`git branch ${branchName}`);
    redrawSimulator();
}

function handleCheckout(branchName) {
    if (branchName === undefined) {
        branchName = prompt('Rama a cambiar (' + Object.keys(gitSimulator.branches).join(', ') + '):');
    }
    if (branchName === null) return;
    if (!gitSimulator.branches[branchName]) {
        alert('La rama no existe');
        return;
    }
    
    gitSimulator.currentBranch = branchName;
    gitSimulator.history.push(`git checkout ${branchName}`);
    redrawSimulator();
}

function handleMerge(branchName) {
    if (branchName === undefined) {
        branchName = prompt('Rama a fusionar:');
    }
    if (branchName === null) return;
    if (!gitSimulator.branches[branchName]) {
        alert('La rama no existe');
        return;
    }
    if (branchName === gitSimulator.currentBranch) {
        alert('No puedes fusionar una rama contigo misma');
        return;
    }
    
    const sourceBranch = gitSimulator.branches[branchName];
    const targetBranch = gitSimulator.branches[gitSimulator.currentBranch];
    const sourceCommits = sourceBranch.commits;
    
    for (let commitId of sourceCommits) {
        if (!targetBranch.commits.includes(commitId)) {
            targetBranch.commits.push(commitId);
        }
        const commit = gitSimulator.commits.find(c => c.id === commitId);
        if (commit) {
            commit.branch = gitSimulator.currentBranch;
        }
    }
    
    targetBranch.head = sourceBranch.head;
    delete gitSimulator.branches[branchName];
    gitSimulator.history.push(`git merge ${branchName}`);
    redrawSimulator();
}

function executeCommand(commandText) {
    const input = commandText.trim();
    if (!input) return;

    const commitPattern = /^git\s+commit\s+-m\s+(?:"([^"]+)"|'([^']+)'|(.+))$/i;
    const branchPattern = /^git\s+branch\s+(?:"([^"]+)"|'([^']+)'|(\S+))$/i;
    const checkoutPattern = /^git\s+checkout\s+(?:"([^"]+)"|'([^']+)'|(\S+))$/i;
    const mergePattern = /^git\s+merge\s+(?:"([^"]+)"|'([^']+)'|(\S+))$/i;

    let match = input.match(commitPattern);
    if (match) {
        const message = match[1] || match[2] || match[3] || '';
        handleCommit(message);
        document.getElementById('command-input').value = '';
        return;
    }

    match = input.match(branchPattern);
    if (match) {
        const name = match[1] || match[2] || match[3];
        handleBranch(name);
        document.getElementById('command-input').value = '';
        return;
    }

    match = input.match(checkoutPattern);
    if (match) {
        const name = match[1] || match[2] || match[3];
        handleCheckout(name);
        document.getElementById('command-input').value = '';
        return;
    }

    match = input.match(mergePattern);
    if (match) {
        const name = match[1] || match[2] || match[3];
        handleMerge(name);
        document.getElementById('command-input').value = '';
        return;
    }

    alert('Error: comando no reconocido');
}

function handleReset() {
    if (confirm('¿Reiniciar el simulador?')) {
        gitSimulator.commits = [];
        gitSimulator.branches = {
            main: {
                color: '#FF6B6B',
                head: 0,
                commits: [0]
            }
        };
        gitSimulator.currentBranch = 'main';
        gitSimulator.nextCommitId = 1;
        gitSimulator.history = [];
        setupSimulator();
    }
}

function redrawSimulator() {
    drawGitGraph();
    updateBranchesList();
    updateCommitsList();
    updateHistoryList();
    updateStatus();
}

function drawGitGraph() {
    const canvas = document.getElementById('git-canvas');
    if (!canvas) return;
    
    const commitRadius = 8;
    const verticalSpacing = 60;
    const startX = 50;
    const startY = 30;
    const branchNames = Object.keys(gitSimulator.branches);
    
    canvas.width = Math.max(600, startX + branchNames.length * 80 + 100);
    canvas.height = Math.max(500, startY + gitSimulator.commits.length * verticalSpacing + 50);
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gitSimulator.commits.length === 0) return;
    
    // Dibujar líneas de ramas
    for (let branchName of branchNames) {
        const branch = gitSimulator.branches[branchName];
        ctx.strokeStyle = branch.color;
        ctx.lineWidth = 3;
        const x = startX + (branchNames.indexOf(branchName) * 80);

        if (branch.commits.length > 1) {
            for (let i = 0; i < branch.commits.length - 1; i++) {
                const commitId = branch.commits[i];
                const nextCommitId = branch.commits[i + 1];

                const y1 = startY + (gitSimulator.commits.findIndex(c => c.id === commitId) * verticalSpacing);
                const y2 = startY + (gitSimulator.commits.findIndex(c => c.id === nextCommitId) * verticalSpacing);

                ctx.beginPath();
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
                ctx.stroke();
            }
        } else if (branch.commits.length === 1) {
            const commitId = branch.commits[0];
            const y1 = startY + (gitSimulator.commits.findIndex(c => c.id === commitId) * verticalSpacing);
            const y2 = y1 + 20;
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();
        }
    }
    
    // Dibujar commits (puntos)
    for (let i = 0; i < gitSimulator.commits.length; i++) {
        const commit = gitSimulator.commits[i];
        const branch = gitSimulator.branches[commit.branch];
        const branchIndex = Object.keys(gitSimulator.branches).indexOf(commit.branch);
        
        const x = startX + (branchIndex * 80);
        const y = startY + (i * verticalSpacing);
        
        // Dibujar círculo del commit
        ctx.fillStyle = branch.color;
        ctx.beginPath();
        ctx.arc(x, y, commitRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Dibujar número de commit
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(commit.id, x, y);
        
        // Marcar HEAD si está en esta rama y commit
        if (gitSimulator.currentBranch === commit.branch && 
            branch.head === commit.id) {
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, commitRadius + 5, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
}

function updateBranchesList() {
    const list = document.getElementById('branches-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    for (let branchName in gitSimulator.branches) {
        const branch = gitSimulator.branches[branchName];
        const li = document.createElement('li');
        li.innerHTML = `<span class="branch-dot" style="background-color: ${branch.color};"></span> ${branchName}`;
        if (gitSimulator.currentBranch === branchName) {
            li.style.backgroundColor = '#e8f5e9';
            li.style.fontWeight = 'bold';
        }
        list.appendChild(li);
    }
}

function updateCommitsList() {
    const list = document.getElementById('commits-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    for (let commit of gitSimulator.commits) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>#${commit.id}:</strong> ${commit.message}`;
        li.style.fontSize = '11px';
        li.style.borderLeft = `3px solid ${gitSimulator.branches[commit.branch].color}`;
        list.appendChild(li);
    }
    
    // Actualizar contador
    const totalElement = document.getElementById('total-commits');
    if (totalElement) {
        totalElement.textContent = gitSimulator.commits.length;
    }
}

function updateHistoryList() {
    const list = document.getElementById('history-list');
    if (!list) return;
    
    // Mantener el primer elemento
    if (list.children.length === 0) {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.textContent = 'Simulador iniciado';
        list.appendChild(li);
    }
    
    // Agregar nuevos comandos
    for (let i = list.children.length - 1; i < gitSimulator.history.length; i++) {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.textContent = '$ ' + gitSimulator.history[i];
        list.appendChild(li);
    }
}

function updateStatus() {
    const branchElement = document.getElementById('current-branch-sim');
    if (branchElement) {
        branchElement.textContent = gitSimulator.currentBranch;
    }
    
    const totalElement = document.getElementById('total-commits');
    if (totalElement) {
        totalElement.textContent = gitSimulator.commits.length;
    }
}