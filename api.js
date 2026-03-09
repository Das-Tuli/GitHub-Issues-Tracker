const API = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const SEARCH_API = "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=";
const SINGLE_ISSUE_API = "https://phi-lab-server.vercel.app/api/v1/lab/issue/";

let currentIssues = [];
let currentFilter = 'all';

async function loadIssues(searchQuery = "") {
    showSpinner(true);
    try {
        let res;
        if (searchQuery) {
            res = await fetch(SEARCH_API + encodeURIComponent(searchQuery));
        } else {
            res = await fetch(API);
        }
        let data = await res.json();
        currentIssues = data.data || [];
        
        applyFiltersAndRender();
    } catch (error) {
        console.error("Failed to load issues:", error);
        currentIssues = [];
        applyFiltersAndRender();
    } finally {
        showSpinner(false);
    }
}

function switchTab(type) {
    currentFilter = type;
    
    // Reset all tabs
    document.querySelectorAll('[id^="tab-"]').forEach(tab => {
        tab.className = "px-8 py-2.5 rounded-lg font-medium transition-colors bg-white border border-gray-200 text-gray-700 hover:bg-gray-50";
    });
    
    // Set active tab
    const activeTab = document.getElementById(`tab-${type}`);
    if (activeTab) {
        activeTab.className = "px-8 py-2.5 rounded-lg font-medium transition-colors bg-purple-theme text-white border border-purple-theme shadow-md";
    }
    
    applyFiltersAndRender();
}

function applyFiltersAndRender() {
    let filteredIssues = currentIssues;

    if (currentFilter === "open") {
        filteredIssues = currentIssues.filter(i => i.status === "open");
    } else if (currentFilter === "closed") {
        filteredIssues = currentIssues.filter(i => i.status === "closed");
    }

    updateStats();
    displayIssues(filteredIssues);
}

function updateStats() {
    const totalCount = currentIssues.length;
    document.getElementById("issueCount").innerText = totalCount;
}

function displayIssues(issues) {
    const container = document.getElementById("issuesContainer");
    const errorMsg = document.getElementById("errorMessage");

    container.innerHTML = "";

    if (issues.length === 0) {
        container.classList.add("hidden");
        errorMsg.classList.remove("hidden");
        errorMsg.classList.add("flex");
        return;
    }

    errorMsg.classList.add("hidden");
    errorMsg.classList.remove("flex");
    container.classList.remove("hidden");
    container.classList.add("grid");

    issues.forEach(issue => {
        const isClosed = issue.status === "closed";
        const borderColor = isClosed ? "border-purple-400" : "border-green-400";
        const iconColor = isClosed ? "text-purple-500" : "text-green-500";
        
        const priorityUpper = (issue.priority || 'Medium').toUpperCase();
        
        const priorityStyles = {
            'HIGH': 'bg-red-50 text-red-500 border border-red-100',
            'MEDIUM': 'bg-yellow-50 text-yellow-500 border border-yellow-100',
            'LOW': 'bg-gray-100 text-gray-500 border border-gray-200'
        };
        const pStyle = priorityStyles[priorityUpper] || priorityStyles['MEDIUM'];
        
        // Status indicator SVG
        const iconSvg = isClosed 
            ? `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
            : `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

        let labelsHtml = '';
        if (issue.labels && issue.labels.length > 0) {
            labelsHtml = issue.labels.map(l => {
                let colorClass = "border-gray-200 text-gray-600 bg-gray-50";
                let lUpper = l.toUpperCase();
                if(lUpper.includes("BUG")) colorClass = "border-red-200 text-red-500 bg-red-50";
                else if(lUpper.includes("HELP")) colorClass = "border-yellow-200 text-yellow-600 bg-yellow-50";
                else if(lUpper.includes("ENHANCE")) colorClass = "border-green-200 text-green-500 bg-green-50";
                return `<span class="px-2.5 py-0.5 rounded-full border ${colorClass} text-[11px] font-bold leading-none uppercase inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ${lUpper}</span>`;
            }).join('');
        } else if (issue.label) {
            labelsHtml = `<span class="px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-600 bg-gray-50 text-[11px] font-bold leading-none uppercase inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ${issue.label}</span>`;
        }

        container.innerHTML += `
            <div onclick="openModal('${issue.id}')" 
                 class="bg-white rounded-xl shadow-sm border border-gray-100 border-t-[3px] ${borderColor} p-6 flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow">
                
                <div class="flex justify-between items-start mb-3">
                    <div class="${iconColor}">${iconSvg}</div>
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${pStyle}">${priorityUpper}</span>
                </div>
                
                <h3 class="font-extrabold text-[#111827] text-lg mb-2 leading-tight">${issue.title}</h3>
                
                <p class="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed font-medium">${issue.description}</p>
                
                <div class="flex flex-wrap gap-2 mb-6 mt-auto">
                    ${labelsHtml}
                </div>
                
                <div class="border-t border-gray-100 pt-4 flex flex-col gap-1 text-[13px] text-gray-400 font-medium">
                    <div>#${issue.id} by ${issue.author}</div>
                    <div>${new Date(issue.createdAt || Date.now()).toLocaleDateString('en-US')}</div>
                </div>
                
            </div>
        `;
    });
}

function showSpinner(show) {
    const spinner = document.getElementById("loadingSpinner");
    const container = document.getElementById("issuesContainer");
    
    if (show) {
        spinner.classList.remove("hidden");
        spinner.classList.add("flex");
        container.classList.add("hidden");
        container.classList.remove("grid");
    } else {
        spinner.classList.add("hidden");
        spinner.classList.remove("flex");
    }
}

async function searchIssue() {
    const searchInput = document.getElementById("searchInput").value.trim();
    const searchInputMobile = document.getElementById("searchInputMobile");
    if(searchInputMobile) searchInputMobile.value = searchInput; // Sync
    await loadIssues(searchInput);
}

async function openModal(id) {
    const modal = document.getElementById("issueModal");
    const modalContent = document.getElementById("modalContent");
    
    modal.showModal();
    modalContent.innerHTML = `
        <div class="flex justify-center my-12">
            <span class="loading loading-spinner text-purple-theme w-10 h-10"></span>
        </div>
    `;
    
    try {
        const res = await fetch(SINGLE_ISSUE_API + id);
        const json = await res.json();
        
        let issue = json.data || json; 
        if (Array.isArray(issue)) issue = issue[0] || {};
        
        const isClosed = issue.status === "closed";
        const statusText = issue.status ? issue.status.charAt(0).toUpperCase() + issue.status.slice(1) : "Opened";
        const statusBadgeClass = isClosed ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600";
        
        let labelsHtml = '';
        if (issue.labels && issue.labels.length > 0) {
            labelsHtml = issue.labels.map(l => {
                let colorClass = "border-gray-200 text-gray-600 bg-gray-50";
                let lUpper = l.toUpperCase();
                if(lUpper.includes("BUG")) colorClass = "border-red-200 text-red-500 bg-red-50";
                else if(lUpper.includes("HELP")) colorClass = "border-yellow-200 text-yellow-600 bg-yellow-50";
                else if(lUpper.includes("ENHANCE")) colorClass = "border-green-200 text-green-500 bg-green-50";
                return `<span class="px-2.5 py-1 rounded-full border ${colorClass} text-[11px] font-bold leading-none uppercase inline-flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ${lUpper}</span>`;
            }).join('');
        } else if (issue.label) {
            labelsHtml = `<span class="px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 bg-gray-50 text-[11px] font-bold leading-none uppercase inline-flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ${issue.label}</span>`;
        }

        const priorityUpper = (issue.priority || 'High').toUpperCase();
        const pStyleModal = priorityUpper === 'HIGH' ? 'bg-red-500 text-white' : 
                            priorityUpper === 'MEDIUM' ? 'bg-yellow-500 text-white' : 
                            'bg-gray-500 text-white';

        modalContent.innerHTML = `
            <div class="px-2 pt-2 pb-4">
                <h2 class="text-[26px] font-bold text-gray-900 leading-tight mb-4 pr-8">${issue.title}</h2>
                
                <div class="flex items-center gap-2 mb-6 text-[13px]">
                    <span class="px-3 py-1 rounded-full font-semibold ${statusBadgeClass}">${statusText}</span>
                    <span class="text-gray-500 font-medium">• Opened by ${issue.author || 'Unknown'} • ${new Date(issue.createdAt || Date.now()).toLocaleDateString('en-GB')}</span>
                </div>
                
                <div class="flex flex-wrap gap-2 mb-6">
                    ${labelsHtml}
                </div>
                
                <p class="text-gray-500 text-[15px] leading-relaxed mb-8">
                    ${issue.description || 'No description provided.'}
                </p>
                
                <div class="bg-gray-50 rounded-xl p-5 flex items-center justify-between border border-gray-100 mb-8">
                    <div>
                        <p class="text-gray-500 text-[13px] font-medium mb-1">Assignee:</p>
                        <p class="text-gray-900 font-bold text-[15px]">${issue.assignee || issue.author || 'Unknown'}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-[13px] font-medium mb-1">Priority:</p>
                        <span class="px-4 py-1 rounded-full text-[12px] font-bold tracking-wider ${pStyleModal}">${priorityUpper}</span>
                    </div>
                </div>
                
                <div class="flex justify-end">
                    <button class="bg-purple-theme hover:bg-purple-700 text-white px-8 py-2.5 rounded-lg font-medium transition-colors cursor-pointer" onclick="document.getElementById('issueModal').close()">Close</button>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error("Failed to fetch issue details:", error);
        modalContent.innerHTML = `
            <div class="alert alert-error">
                <span>Failed to load issue details. Please try again.</span>
            </div>
        `;
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    switchTab('all');
    loadIssues();
});