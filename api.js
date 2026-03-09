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
        
        const priorityStyles = {
            'High': 'bg-red-50 text-red-500',
            'Medium': 'bg-yellow-50 text-yellow-600',
            'Low': 'bg-gray-100 text-gray-500'
        };
        const pStyle = priorityStyles[issue.priority] || priorityStyles['Medium'];
        
        // Status indicator SVG
        const iconSvg = isClosed 
            ? `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
            : `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

        let labelsHtml = '';
        if (issue.labels && issue.labels.length > 0) {
            labelsHtml = issue.labels.map(l => {
                let colorClass = "border-gray-200 text-gray-600";
                let lUpper = l.toUpperCase();
                if(lUpper.includes("BUG")) colorClass = "border-red-200 text-red-500";
                else if(lUpper.includes("HELP")) colorClass = "border-yellow-200 text-yellow-600";
                else if(lUpper.includes("ENHANCE")) colorClass = "border-green-200 text-green-500";
                return `<span class="px-2.5 py-0.5 rounded-full border ${colorClass} text-xs font-bold leading-none uppercase inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ${lUpper}</span>`;
            }).join('');
        } else if (issue.label) {
            labelsHtml = `<span class="px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-600 text-xs font-bold leading-none uppercase inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ${issue.label}</span>`;
        }

        container.innerHTML += `
            <div onclick="openModal('${issue._id}')" 
                 class="bg-white rounded-xl shadow-sm border border-gray-100 border-t-[3px] ${borderColor} p-6 flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow">
                
                <div class="flex justify-between items-start mb-3">
                    <div class="${iconColor}">${iconSvg}</div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${pStyle}">${issue.priority || 'Medium'}</span>
                </div>
                
                <h3 class="font-extrabold text-[#111827] text-lg mb-2 leading-tight">${issue.title}</h3>
                
                <p class="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed font-medium">${issue.description}</p>
                
                <div class="flex flex-wrap gap-2 mb-6 mt-auto">
                    ${labelsHtml}
                </div>
                
                <div class="border-t border-gray-100 pt-4 flex flex-col gap-1 text-[13px] text-gray-400 font-medium">
                    <div>#${issue._id} by ${issue.author}</div>
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
        const iconSvg = isClosed 
            ? `<div class="bg-purple-100 p-3 rounded-full text-purple-600"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></div>`
            : `<div class="bg-green-100 p-3 rounded-full text-green-600"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>`;
            
        modalContent.innerHTML = `
            <div class="flex items-start gap-5">
                ${iconSvg}
                <div class="flex-1">
                    <div class="flex gap-2 mb-2 items-center">
                        <span class="font-semibold text-gray-500">Issue #${issue._id || id}</span>
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        <span class="font-medium text-gray-500">Opened on ${new Date(issue.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <h2 class="text-[22px] font-bold text-gray-900 leading-snug mb-5">${issue.title}</h2>
                    
                    <div class="bg-gray-50 rounded-xl p-5 mb-5 border border-gray-100">
                        <p class="text-gray-600 text-sm leading-relaxed">${issue.description || 'No description provided.'}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-6 bg-white">
                        <div class="border border-gray-100 rounded-xl p-4 shadow-sm">
                            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Author</span>
                            <div class="font-semibold text-gray-800 flex items-center gap-2">
                                <div class="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">${(issue.author || 'A').charAt(0).toUpperCase()}</div>
                                ${issue.author || 'Unknown'}
                            </div>
                        </div>
                        <div class="border border-gray-100 rounded-xl p-4 shadow-sm">
                            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Priority</span>
                            <div class="font-semibold text-gray-800">${issue.priority || 'Medium'}</div>
                        </div>
                    </div>
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