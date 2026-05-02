// Basic JavaScript for Git simulations

// For commit.html
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

// For branch.html
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

// For merge.html
if (document.getElementById('simulate-merge')) {
    document.getElementById('simulate-merge').addEventListener('click', function() {
        const branch = document.getElementById('merge-branch').value;
        document.getElementById('merge-status').textContent = `Merge completado desde ${branch}`;
    });
}

// For main.html
if (document.getElementById('simulate-checkout-main')) {
    document.getElementById('simulate-checkout-main').addEventListener('click', function() {
        document.getElementById('current-branch').textContent = 'main';
    });
}

// For feature.html
if (document.getElementById('simulate-checkout-feature')) {
    document.getElementById('simulate-checkout-feature').addEventListener('click', function() {
        document.getElementById('current-branch').textContent = 'feature';
    });
}