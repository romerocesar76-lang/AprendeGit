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

function handleCommit() {
    const message = prompt('Escribe el mensaje del commit:');
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

function handleBranch() {
    const branchName = prompt('Nombre de la rama:');
    if (branchName === null || branchName === '') return;
    if (gitSimulator.branches[branchName]) {
        alert('La rama ya existe');
        return;
    }
    
    // Crear nueva rama desde el commit actual
    const colorIndex = Object.keys(gitSimulator.branches).length % gitSimulator.branchColors.length;
    gitSimulator.branches[branchName] = {
        color: gitSimulator.branchColors[colorIndex],
        head: gitSimulator.branches[gitSimulator.currentBranch].head,
        commits: [gitSimulator.branches[gitSimulator.currentBranch].head]
    };
    
    gitSimulator.history.push(`git branch ${branchName}`);
    redrawSimulator();
}

function handleCheckout() {
    const branchName = prompt('Rama a cambiar (' + Object.keys(gitSimulator.branches).join(', ') + '):');
    if (branchName === null) return;
    if (!gitSimulator.branches[branchName]) {
        alert('La rama no existe');
        return;
    }
    
    gitSimulator.currentBranch = branchName;
    gitSimulator.history.push(`git checkout ${branchName}`);
    redrawSimulator();
}

function handleMerge() {
    const branchName = prompt('Rama a fusionar:');
    if (branchName === null) return;
    if (!gitSimulator.branches[branchName]) {
        alert('La rama no existe');
        return;
    }
    if (branchName === gitSimulator.currentBranch) {
        alert('No puedes fusionar una rama contigo misma');
        return;
    }
    
    // Simular merge: los commits de la rama se integran a la rama actual
    const sourceCommits = gitSimulator.branches[branchName].commits;
    const targetBranch = gitSimulator.branches[gitSimulator.currentBranch];
    
    for (let commitId of sourceCommits) {
        if (!targetBranch.commits.includes(commitId)) {
            targetBranch.commits.push(commitId);
        }
    }
    
    targetBranch.head = gitSimulator.branches[branchName].head;
    gitSimulator.history.push(`git merge ${branchName}`);
    redrawSimulator();
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
    
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gitSimulator.commits.length === 0) return;
    
    const commitRadius = 8;
    const verticalSpacing = 60;
    const startX = 50;
    const startY = 30;
    
    // Dibujar líneas de ramas
    for (let branchName in gitSimulator.branches) {
        const branch = gitSimulator.branches[branchName];
        ctx.strokeStyle = branch.color;
        ctx.lineWidth = 3;
        
        for (let i = 0; i < branch.commits.length - 1; i++) {
            const commitId = branch.commits[i];
            const nextCommitId = branch.commits[i + 1];
            
            const x1 = startX + (Object.keys(gitSimulator.branches).indexOf(branchName) * 80);
            const y1 = startY + (gitSimulator.commits.findIndex(c => c.id === commitId) * verticalSpacing);
            const x2 = startX + (Object.keys(gitSimulator.branches).indexOf(branchName) * 80);
            const y2 = startY + (gitSimulator.commits.findIndex(c => c.id === nextCommitId) * verticalSpacing);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
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
        
        // Dibujar etiqueta de commit
        ctx.fillStyle = '#333';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(commit.message.substring(0, 20), x + 20, y);
        
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
    
    // Leyenda de ramas
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    let legendY = canvas.height - 100;
    ctx.fillStyle = '#333';
    ctx.fillText('Ramas:', 20, legendY);
    
    let branchIndex = 0;
    for (let branchName in gitSimulator.branches) {
        const branch = gitSimulator.branches[branchName];
        ctx.fillStyle = branch.color;
        ctx.fillRect(20, legendY + 15 + (branchIndex * 20), 15, 15);
        ctx.fillStyle = '#333';
        ctx.fillText(branchName, 40, legendY + 27 + (branchIndex * 20));
        branchIndex++;
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