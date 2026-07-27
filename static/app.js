document.addEventListener('DOMContentLoaded', () => {
    // State management
    let allInstitutions = [];
    let selectedCodes = [];
    let performanceChart = null;
    let gradesChart = null;

    // DOM Elements
    const searchBox = document.getElementById('search-box');
    const dropdownResults = document.getElementById('dropdown-results');
    const selectedTagsContainer = document.getElementById('selected-tags');
    const emptyState = document.getElementById('empty-state');
    const dashboardContent = document.getElementById('dashboard-content');
    const loadingOverlay = document.getElementById('loading-overlay');
    const btnExport = document.getElementById('btn-export');
    
    const metricsGrid = document.getElementById('metrics-grid');
    const meritTableBody = document.getElementById('merit-table-body');
    const toppersTabs = document.getElementById('toppers-tabs');
    const toppersTabsContent = document.getElementById('toppers-tabs-content');

    // 1. Fetch all institutions on startup
    showLoading(true);
    fetch('/api/institutions')
        .then(res => res.json())
        .then(data => {
            allInstitutions = data;
            showLoading(false);
        })
        .catch(err => {
            console.error('Failed to load institutions:', err);
            showLoading(false);
            alert('Failed to load institution database. Please ensure students.json exists and restart the backend.');
        });

    // 2. Search Autocomplete Logic
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            hideDropdown();
            return;
        }

        const filtered = allInstitutions.filter(inst => 
            inst.name.toLowerCase().includes(query) || 
            inst.code.includes(query)
        ).slice(0, 30); // limit to 30 results for rendering speed

        renderDropdown(filtered);
    });

    // Hide dropdown on clicking outside
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && !dropdownResults.contains(e.target)) {
            hideDropdown();
        }
    });

    // Handle Total Marks change
    document.getElementById('total-marks-input').addEventListener('change', () => {
        if (selectedCodes.length > 0) {
            fetchComparisonData();
        }
    });

    function renderDropdown(items) {
        if (items.length === 0) {
            dropdownResults.innerHTML = '<div class="dropdown-item" style="cursor: default; color: var(--text-secondary);">No match found</div>';
        } else {
            dropdownResults.innerHTML = items.map(item => `
                <div class="dropdown-item" data-code="${item.code}" data-name="${item.name}">
                    <span>${item.name}</span>
                    <span class="code-badge">${item.code}</span>
                </div>
            `).join('');

            // Add click events to dropdown items
            dropdownResults.querySelectorAll('.dropdown-item').forEach(el => {
                el.addEventListener('click', () => {
                    const code = el.getAttribute('data-code');
                    addInstitution(code);
                    hideDropdown();
                    searchBox.value = '';
                });
            });
        }
        dropdownResults.style.display = 'block';
    }

    function hideDropdown() {
        dropdownResults.style.display = 'none';
        dropdownResults.innerHTML = '';
    }

    // 3. Selection Handlers
    function addInstitution(code) {
        if (selectedCodes.includes(code)) return;
        if (selectedCodes.length >= 5) {
            alert('You can compare a maximum of 5 institutions.');
            return;
        }
        selectedCodes.push(code);
        renderTags();
        fetchComparisonData();
    }

    function removeInstitution(code) {
        selectedCodes = selectedCodes.filter(c => c !== code);
        renderTags();
        if (selectedCodes.length === 0) {
            emptyState.style.display = 'flex';
            dashboardContent.style.display = 'none';
            btnExport.disabled = true;
        } else {
            fetchComparisonData();
        }
    }

    function renderTags() {
        selectedTagsContainer.innerHTML = selectedCodes.map(code => {
            const inst = allInstitutions.find(i => i.code === code);
            const name = inst ? inst.name : `Code ${code}`;
            return `
                <span class="tag">
                    ${name.substring(0, 40)}${name.length > 40 ? '...' : ''} (${code})
                    <button class="tag-remove" data-code="${code}">&times;</button>
                </span>
            `;
        }).join('');

        selectedTagsContainer.querySelectorAll('.tag-remove').forEach(el => {
            el.addEventListener('click', () => {
                const code = el.getAttribute('data-code');
                removeInstitution(code);
            });
        });
    }

    // 4. Fetch Data and Update Dashboard
    function fetchComparisonData() {
        if (selectedCodes.length === 0) return;
        
        showLoading(true);
        const codesQuery = selectedCodes.join(',');
        const totalMarks = parseInt(document.getElementById('total-marks-input').value) || 1100;
        
        fetch(`/api/compare?codes=${codesQuery}&total_marks=${totalMarks}`)
            .then(res => res.json())
            .then(data => {
                showLoading(false);
                if (data.error) {
                    alert(data.error);
                    return;
                }
                renderDashboard(data);
            })
            .catch(err => {
                console.error(err);
                showLoading(false);
                alert('An error occurred during data fetching.');
            });
    }

    function renderDashboard(data) {
        emptyState.style.display = 'none';
        dashboardContent.style.display = 'block';
        btnExport.disabled = false;

        // Render Quick Cards
        renderCards(data.leaderboard);

        // Render Merit Table
        renderMeritTable(data.overall_merit);

        // Render Topper Tabs
        renderTopperTabs(data.leaderboard);

        // Render Visualizations
        renderCharts(data.leaderboard);
    }

    function renderCards(leaderboard) {
        metricsGrid.innerHTML = leaderboard.map((report, idx) => `
            <div class="card" style="margin-bottom: 0;">
                <div class="inst-card-header">
                    <div class="inst-name">${report.institution}</div>
                    <div class="inst-code">Institution Code: ${report.code} | Topper Rank: #${idx + 1}</div>
                </div>
                <div class="stats-grid">
                    <div class="stat-box">
                        <span class="stat-label">Total Students</span>
                        <span class="stat-value accent">${report.total_students}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Pass Percentage</span>
                        <span class="stat-value success">${report.pass_percentage}%</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Average Marks</span>
                        <span class="stat-value">${report.average_marks}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Highest Marks</span>
                        <span class="stat-value success">${report.highest_marks}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Lowest Marks</span>
                        <span class="stat-value error">${report.lowest_marks}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Passed / Failed</span>
                        <span class="stat-value" style="font-size: 0.95rem; font-weight: 600; margin-top: 0.25rem;">
                            ${report.passed} P / ${report.failed} F
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderMeritTable(overallMerit) {
        meritTableBody.innerHTML = overallMerit.slice(0, 15).map((student, idx) => `
            <tr>
                <td><span class="rank-badge rank-${idx + 1}">${idx + 1}</span></td>
                <td>${student.roll_no}</td>
                <td><strong style="color: var(--text-primary);">${student.name}</strong></td>
                <td style="font-size: 0.85rem; color: var(--text-secondary);">${student.institution}</td>
                <td><strong style="color: var(--success);">${student.marks}</strong></td>
                <td>${student.grade}</td>
                <td><span class="status-tag pass">${student.status}</span></td>
            </tr>
        `).join('');
    }

    function renderTopperTabs(leaderboard) {
        const totalMarks = parseInt(document.getElementById('total-marks-input').value) || 1100;

        // Render headers
        toppersTabs.innerHTML = leaderboard.map((report, idx) => `
            <button class="tab-btn ${idx === 0 ? 'active' : ''}" data-target="tab-${report.code}">
                ${report.institution.substring(0, 20)}...
            </button>
        `).join('');

        // Render contents
        toppersTabsContent.innerHTML = leaderboard.map((report, idx) => `
            <div id="tab-${report.code}" class="tab-content ${idx === 0 ? 'active' : ''}">
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 80px;">Rank</th>
                                <th style="width: 120px;">Roll No</th>
                                <th>Student Name</th>
                                <th style="width: 120px;">Marks (${totalMarks})</th>
                                <th style="width: 120px;">Percentage</th>
                                <th style="width: 100px;">Grade</th>
                                <th style="width: 100px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${report.top10.map((s, sIdx) => `
                                <tr>
                                    <td><span class="rank-badge">${sIdx + 1}</span></td>
                                    <td>${s.roll_no}</td>
                                    <td><strong>${s.name}</strong></td>
                                    <td>${s.marks}</td>
                                    <td>${((s.marks / totalMarks) * 100).toFixed(1)}%</td>
                                    <td>${s.grade}</td>
                                    <td><span class="status-tag ${s.status === 'PASS' ? 'pass' : 'fail'}">${s.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('');

        // Tab button click events
        toppersTabs.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                toppersTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                toppersTabsContent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const targetId = btn.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');
            });
        });
    }

    // 5. Render Charts using Chart.js
    function renderCharts(leaderboard) {
        const labels = leaderboard.map(r => r.institution.substring(0, 25) + '...');
        const passPercentages = leaderboard.map(r => r.pass_percentage);
        const averages = leaderboard.map(r => r.average_marks);
        
        // --- 1. Performance Chart (Double Y-Axis or group bar) ---
        if (performanceChart) {
            performanceChart.destroy();
        }
        
        const ctxPerformance = document.getElementById('performance-chart').getContext('2d');
        performanceChart = new Chart(ctxPerformance, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Pass Percentage (%)',
                        data: passPercentages,
                        backgroundColor: 'rgba(16, 185, 129, 0.65)',
                        borderColor: '#10b981',
                        borderWidth: 2,
                        yAxisID: 'y-pass',
                        borderRadius: 6,
                    },
                    {
                        label: 'Average Marks',
                        data: averages,
                        backgroundColor: 'rgba(99, 102, 241, 0.65)',
                        borderColor: '#6366f1',
                        borderWidth: 2,
                        yAxisID: 'y-avg',
                        borderRadius: 6,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#f8fafc' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    'y-pass': {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Pass Rate (%)', color: '#f8fafc' },
                        min: 0,
                        max: 100,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    'y-avg': {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Marks (out of 1100)', color: '#f8fafc' },
                        min: 0,
                        max: 1100,
                        ticks: { color: '#94a3b8' },
                        grid: { drawOnChartArea: false } // Avoid grid lines overlapping
                    }
                }
            }
        });

        // --- 2. Stacked Grades Distribution Chart ---
        const grades = ["A1", "A", "B", "C", "D", "E", "F"];
        const datasets = grades.map((g, idx) => {
            const colors = [
                '#10b981', // A1 - Emerald
                '#34d399', // A - Light emerald
                '#3b82f6', // B - Blue
                '#60a5fa', // C - Light blue
                '#f59e0b', // D - Amber
                '#fbbf24', // E - Yellow
                '#ef4444'  // F - Red
            ];
            return {
                label: `Grade ${g}`,
                data: leaderboard.map(r => r.grade_counts[g] || 0),
                backgroundColor: colors[idx],
                stack: 'Stack 0',
            };
        });

        if (gradesChart) {
            gradesChart.destroy();
        }

        const ctxGrades = document.getElementById('grades-chart').getContext('2d');
        gradesChart = new Chart(ctxGrades, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#f8fafc', boxWidth: 12 }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    y: {
                        stacked: true,
                        title: { display: true, text: 'Number of Students', color: '#f8fafc' },
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                }
            }
        });
    }

    // 6. Excel Export Trigger
    btnExport.addEventListener('click', () => {
        if (selectedCodes.length === 0) return;
        const codesQuery = selectedCodes.join(',');
        const totalMarks = parseInt(document.getElementById('total-marks-input').value) || 1100;
        window.location.href = `/api/export?codes=${codesQuery}&total_marks=${totalMarks}`;
    });

    // Helpers
    function showLoading(show) {
        if (show) {
            loadingOverlay.classList.add('active');
        } else {
            loadingOverlay.classList.remove('active');
        }
    }
});
