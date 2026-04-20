/* ===== WorkSetGo — app.js ===== */

// ===== STATE =====
const App = {
  theme: localStorage.getItem('wsg_theme') || 'light',
  selectedHireCategory: '',
  selectedFindCategory: '',
  selectedState: '',
  selectedDistrict: '',
  selectedJobId: null,
  pendingCancelId: null,
  hirePosts: JSON.parse(localStorage.getItem('wsg_hirePosts') || '[]'),
  applications: JSON.parse(localStorage.getItem('wsg_applications') || '[]'),
};

// ===== CATEGORIES =====
const CATEGORIES = [
  { icon: '⚡', name: 'Electrician' },
  { icon: '🔧', name: 'Plumber' },
  { icon: '🎨', name: 'Painter' },
  { icon: '🏗️', name: 'Mason / Construction' },
  { icon: '💻', name: 'Web Developer' },
  { icon: '📱', name: 'App Developer' },
  { icon: '🪚', name: 'Carpenter' },
  { icon: '🧹', name: 'Housekeeping' },
  { icon: '🌿', name: 'Gardener' },
  { icon: '🚗', name: 'Driver' },
  { icon: '🍳', name: 'Cook / Chef' },
  { icon: '🔒', name: 'Security Guard' },
  { icon: '❄️', name: 'AC Technician' },
  { icon: '📐', name: 'Interior Designer' },
  { icon: '🛠️', name: 'Welder' },
  { icon: '🪟', name: 'Glass / Window Work' },
];

const STATES = [
  'Uttar Pradesh', 'Delhi', 'Maharashtra', 'Bihar', 'Rajasthan',
  'Madhya Pradesh', 'Gujarat', 'Haryana', 'Punjab', 'West Bengal',
  'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala'
];

const DISTRICTS = {
  'Uttar Pradesh': ['Gautam Buddha Nagar', 'Lucknow', 'Agra', 'Kanpur', 'Varanasi', 'Meerut', 'Allahabad', 'Ghaziabad', 'Noida'],
  'Delhi': ['Central Delhi', 'East Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'New Delhi'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli-Dharwad', 'Mangaluru', 'Belagavi'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur'],
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  buildCategoryGrids();
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // set min date to today
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('h_date');
  if (dateInput) dateInput.min = today;
});

// ===== THEME =====
function applyTheme() {
  document.documentElement.setAttribute('data-theme', App.theme);
  document.getElementById('themeToggle').querySelector('.theme-icon').textContent =
    App.theme === 'dark' ? '☾' : '☀';
}

function toggleTheme() {
  App.theme = App.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('wsg_theme', App.theme);
  applyTheme();
}

// ===== NAVIGATION =====
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // Dynamic content
  if (pageId === 'page-hire-posts') renderHirePosts();
  if (pageId === 'page-my-applications') renderMyApplications();
  if (pageId === 'page-find-listings') renderJobListings();
}

// ===== BUILD CATEGORY GRIDS =====
function buildCategoryGrids() {
  buildCatGrid('hireCatGrid', 'hire');
  buildCatGrid('findCatGrid', 'find');
}

function buildCatGrid(containerId, mode) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'cat-card';
    card.innerHTML = `<span class="cat-icon">${cat.icon}</span><span class="cat-name">${cat.name}</span>`;
    card.addEventListener('click', () => selectCategory(cat.name, mode));
    grid.appendChild(card);
  });
}

function selectCategory(catName, mode) {
  if (mode === 'hire') {
    App.selectedHireCategory = catName;
    document.getElementById('hireFormSubtitle').textContent = `Category: ${catName}`;
    goTo('page-hire-form');
  } else {
    App.selectedFindCategory = catName;
    buildStateGrid();
    goTo('page-find-state');
  }
}

// ===== STATE & DISTRICT SELECTION =====
function buildStateGrid() {
  const grid = document.getElementById('stateGrid');
  grid.innerHTML = '';
  STATES.forEach(state => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = state;
    btn.addEventListener('click', () => selectState(state, btn));
    grid.appendChild(btn);
  });
}

function selectState(state, btn) {
  document.querySelectorAll('#stateGrid .option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  App.selectedState = state;
  setTimeout(() => {
    buildDistrictGrid(state);
    goTo('page-find-district');
  }, 200);
}

function buildDistrictGrid(state) {
  document.getElementById('districtSubtitle').textContent = `Districts in ${state}`;
  const grid = document.getElementById('districtGrid');
  grid.innerHTML = '';
  const districts = DISTRICTS[state] || ['Main City', 'North District', 'South District'];
  districts.forEach(dist => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = dist;
    btn.addEventListener('click', () => selectDistrict(dist, btn));
    grid.appendChild(btn);
  });
}

function selectDistrict(dist, btn) {
  document.querySelectorAll('#districtGrid .option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  App.selectedDistrict = dist;
  setTimeout(() => {
    document.getElementById('listingsSubtitle').textContent =
      `${App.selectedFindCategory} jobs in ${dist}, ${App.selectedState}`;
    goTo('page-find-listings');
  }, 200);
}

// ===== HIRE FORM SUBMIT =====
function submitHireForm(e) {
  e.preventDefault();
  const post = {
    id: Date.now(),
    category: App.selectedHireCategory,
    name: document.getElementById('h_name').value,
    contact: document.getElementById('h_contact').value,
    date: document.getElementById('h_date').value,
    workers: document.getElementById('h_workers').value,
    fee: document.getElementById('h_fee').value,
    state: document.getElementById('h_state').value,
    address: document.getElementById('h_address').value,
    desc: document.getElementById('h_desc').value,
    status: 'active',
    applicants: [],
    postedOn: new Date().toLocaleDateString('en-IN'),
  };
  App.hirePosts.unshift(post);
  saveHirePosts();
  document.getElementById('hireForm').reset();
  showToast('✅ Job posted successfully!');
  goTo('page-hire-posts');
}

function saveHirePosts() {
  localStorage.setItem('wsg_hirePosts', JSON.stringify(App.hirePosts));
}

// ===== RENDER HIRE POSTS =====
function renderHirePosts() {
  const list = document.getElementById('hirePostsList');
  if (!App.hirePosts.length) {
    list.innerHTML = `<div class="empty-state"><span class="empty-icon">📋</span><h3>No job posts yet</h3><p>Go back and post a job to find workers.</p></div>`;
    return;
  }
  list.innerHTML = App.hirePosts.map(post => {
    const applicantCount = post.applicants ? post.applicants.length : 0;
    const statusBadge = post.status === 'cancelled'
      ? '<span class="badge badge-cancelled">Cancelled</span>'
      : '<span class="badge badge-active">Active</span>';
    return `
    <div class="post-card" id="post-${post.id}">
      <div class="post-header">
        <div>
          <div class="post-title">${getCatIcon(post.category)} ${post.category}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">Posted on ${post.postedOn}</div>
        </div>
        ${statusBadge}
      </div>
      <div class="post-body">
        <div class="post-detail"><strong>${post.name}</strong>Posted by</div>
        <div class="post-detail"><strong>${post.date}</strong>Work Date</div>
        <div class="post-detail"><strong>₹${post.fee}/day</strong>Fee Per Worker</div>
        <div class="post-detail"><strong>${post.workers} Worker(s)</strong>Required</div>
        <div class="post-detail"><strong>${post.state}</strong>State</div>
        <div class="post-detail"><strong>${applicantCount} Applicant(s)</strong>Applied</div>
      </div>
      <div class="post-detail" style="margin-bottom:0.75rem;font-size:0.85rem;color:var(--text-muted)">📍 ${post.address}</div>
      ${post.status !== 'cancelled' ? `
      <div class="post-actions">
        <button class="btn btn-outline" onclick="viewApplicants(${post.id})">👥 View Applicants</button>
        <button class="btn btn-danger" style="font-size:0.85rem;padding:0.5rem 1rem;" onclick="askCancel(${post.id})">✕ Cancel Post</button>
      </div>` : '<div style="color:var(--text-muted);font-size:0.85rem;">This post has been cancelled.</div>'}
    </div>`;
  }).join('');
}

function viewApplicants(postId) {
  const post = App.hirePosts.find(p => p.id === postId);
  if (!post || !post.applicants || !post.applicants.length) {
    showToast('No applicants yet for this job.');
    return;
  }
  const content = document.getElementById('jobDetailContent');
  content.innerHTML = `
    <button class="modal-close" onclick="closeModal('jobDetailModal')">✕</button>
    <h3 style="font-family:var(--font-display);font-size:1.3rem;font-weight:700;margin-bottom:1.25rem;">
      Applicants for ${post.category}
    </h3>
    ${post.applicants.map((a, i) => `
    <div style="padding:1rem;background:var(--surface2);border-radius:var(--radius-sm);margin-bottom:0.75rem;border-left:3px solid var(--accent)">
      <strong style="font-size:0.95rem;">${a.name}</strong>
      <div style="font-size:0.83rem;color:var(--text-muted);margin-top:0.3rem">📞 ${a.contact} &nbsp;|&nbsp; 📍 ${a.address}</div>
      ${a.exp ? `<div style="font-size:0.83rem;color:var(--text-muted);margin-top:0.2rem">Experience: ${a.exp}</div>` : ''}
      <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
        <button class="btn btn-primary" style="font-size:0.8rem;padding:0.4rem 0.9rem;" onclick="confirmApplicant(${postId},${i})">✔ Confirm</button>
        <button class="btn btn-outline" style="font-size:0.8rem;padding:0.4rem 0.9rem;" onclick="rejectApplicant(${postId},${i})">✕ Reject</button>
      </div>
    </div>`).join('')}
  `;
  openModal('jobDetailModal');
}

function confirmApplicant(postId, applicantIndex) {
  const post = App.hirePosts.find(p => p.id === postId);
  if (post && post.applicants[applicantIndex]) {
    post.applicants[applicantIndex].hirerStatus = 'confirmed';
    // update corresponding application
    const appEntry = App.applications.find(a =>
      a.jobId === postId && a.applicantName === post.applicants[applicantIndex].name
    );
    if (appEntry) appEntry.status = 'confirmed';
    saveHirePosts();
    saveApplications();
    closeModal('jobDetailModal');
    showToast('✅ Applicant confirmed!');
    renderHirePosts();
  }
}

function rejectApplicant(postId, applicantIndex) {
  const post = App.hirePosts.find(p => p.id === postId);
  if (post && post.applicants[applicantIndex]) {
    post.applicants[applicantIndex].hirerStatus = 'rejected';
    const appEntry = App.applications.find(a =>
      a.jobId === postId && a.applicantName === post.applicants[applicantIndex].name
    );
    if (appEntry) appEntry.status = 'rejected';
    saveHirePosts();
    saveApplications();
    closeModal('jobDetailModal');
    showToast('Applicant rejected.');
    renderHirePosts();
  }
}

let pendingCancelId = null;
function askCancel(postId) {
  pendingCancelId = postId;
  openModal('confirmModal');
}

function confirmCancel() {
  const post = App.hirePosts.find(p => p.id === pendingCancelId);
  if (post) { post.status = 'cancelled'; saveHirePosts(); }
  closeModal('confirmModal');
  showToast('Job post cancelled.');
  renderHirePosts();
}

// ===== FIND JOBS LISTINGS =====
function renderJobListings() {
  const list = document.getElementById('jobListings');
  const relevantPosts = App.hirePosts.filter(p =>
    p.status === 'active' &&
    p.category.toLowerCase() === App.selectedFindCategory.toLowerCase() &&
    p.state === App.selectedState
  );

  if (!relevantPosts.length) {
    list.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">🔍</span>
      <h3>No jobs found</h3>
      <p>No ${App.selectedFindCategory} jobs in ${App.selectedState} right now.<br>Check back later or try a different area.</p>
    </div>`;
    // Show demo/sample if empty for demo purposes
    renderSampleJobs(list);
    return;
  }

  list.innerHTML = relevantPosts.map(post => `
    <div class="job-card">
      <div class="job-info">
        <h3>${getCatIcon(post.category)} ${post.category} Needed</h3>
        <div style="font-size:0.85rem;color:var(--text-muted)">📍 ${post.address}</div>
        <div class="job-meta">
          <span class="tag tag-accent">₹${post.fee}/day</span>
          <span class="tag">${post.workers} worker(s)</span>
          <span class="tag">📅 ${post.date}</span>
          <span class="tag">📞 ${post.contact}</span>
        </div>
        ${post.desc ? `<div style="font-size:0.83rem;color:var(--text-muted);margin-top:0.5rem">${post.desc}</div>` : ''}
      </div>
      <button class="btn btn-primary" onclick="openApplyForm(${post.id})" style="white-space:nowrap;flex-shrink:0;">Apply Now</button>
    </div>
  `).join('');
}

function renderSampleJobs(list) {
  const samples = [
    { id: 'sample1', cat: App.selectedFindCategory || 'Electrician', fee: 750, workers: 2, date: '2026-05-10', address: `${App.selectedDistrict || 'City Center'}, ${App.selectedState || 'UP'}`, contact: '9876543210', desc: 'Wiring work in new apartment building.' },
    { id: 'sample2', cat: App.selectedFindCategory || 'Electrician', fee: 900, workers: 1, date: '2026-05-12', address: `${App.selectedDistrict || 'Main Market'}, ${App.selectedState || 'UP'}`, contact: '9123456789', desc: 'Repair and panel installation needed.' },
  ];
  list.innerHTML = `<div style="padding:0 0 0.5rem;color:var(--text-muted);font-size:0.85rem;font-style:italic;">Showing sample listings for demo</div>` +
    samples.map(s => `
    <div class="job-card">
      <div class="job-info">
        <h3>${getCatIcon(s.cat)} ${s.cat} Needed</h3>
        <div style="font-size:0.85rem;color:var(--text-muted)">📍 ${s.address}</div>
        <div class="job-meta">
          <span class="tag tag-accent">₹${s.fee}/day</span>
          <span class="tag">${s.workers} worker(s)</span>
          <span class="tag">📅 ${s.date}</span>
          <span class="tag">📞 ${s.contact}</span>
        </div>
        <div style="font-size:0.83rem;color:var(--text-muted);margin-top:0.5rem">${s.desc}</div>
      </div>
      <button class="btn btn-primary" onclick="openApplyFormSample('${s.id}','${s.cat}','${s.fee}','${s.workers}','${s.date}','${s.address}')" style="white-space:nowrap;flex-shrink:0;">Apply Now</button>
    </div>`).join('');
}

// ===== APPLY FORM =====
function openApplyForm(postId) {
  App.selectedJobId = postId;
  const post = App.hirePosts.find(p => p.id === postId);
  if (!post) return;
  document.getElementById('applyFormSubtitle').textContent = `Applying for ${post.category} role`;
  document.getElementById('applyJobCard').innerHTML = `
    <div class="apply-preview">
      <h3>${getCatIcon(post.category)} ${post.category}</h3>
      <div class="meta-row">
        <span>💰 ₹${post.fee}/day</span>
        <span>👷 ${post.workers} needed</span>
        <span>📅 ${post.date}</span>
        <span>📍 ${post.address}</span>
      </div>
    </div>`;
  goTo('page-apply-form');
}

function openApplyFormSample(sId, cat, fee, workers, date, address) {
  App.selectedJobId = 'sample_' + sId;
  App.sampleJob = { id: sId, category: cat, fee, workers, date, address };
  document.getElementById('applyFormSubtitle').textContent = `Applying for ${cat} role`;
  document.getElementById('applyJobCard').innerHTML = `
    <div class="apply-preview">
      <h3>${getCatIcon(cat)} ${cat}</h3>
      <div class="meta-row">
        <span>💰 ₹${fee}/day</span>
        <span>👷 ${workers} needed</span>
        <span>📅 ${date}</span>
        <span>📍 ${address}</span>
      </div>
    </div>`;
  goTo('page-apply-form');
}

function submitApply(e) {
  e.preventDefault();
  const applicant = {
    name: document.getElementById('a_name').value,
    contact: document.getElementById('a_contact').value,
    address: document.getElementById('a_address').value,
    exp: document.getElementById('a_exp').value,
    hirerStatus: 'pending',
  };

  let jobInfo = null;
  if (typeof App.selectedJobId === 'number') {
    const post = App.hirePosts.find(p => p.id === App.selectedJobId);
    if (post) {
      if (!post.applicants) post.applicants = [];
      post.applicants.push(applicant);
      saveHirePosts();
      jobInfo = { jobId: App.selectedJobId, category: post.category, fee: post.fee, date: post.date, address: post.address };
    }
  } else {
    // sample job
    const s = App.sampleJob;
    jobInfo = { jobId: App.selectedJobId, category: s.category, fee: s.fee, date: s.date, address: s.address };
  }

  if (jobInfo) {
    const appEntry = {
      ...jobInfo,
      applicantName: applicant.name,
      applicantContact: applicant.contact,
      applicantAddress: applicant.address,
      status: 'pending',
      appliedOn: new Date().toLocaleDateString('en-IN'),
    };
    App.applications.unshift(appEntry);
    saveApplications();
  }

  document.getElementById('applyForm').reset();
  showToast('🎉 Application submitted! Awaiting confirmation.');
  goTo('page-my-applications');
}

function saveApplications() {
  localStorage.setItem('wsg_applications', JSON.stringify(App.applications));
}

// ===== MY APPLICATIONS =====
function renderMyApplications() {
  const list = document.getElementById('myApplicationsList');
  if (!App.applications.length) {
    list.innerHTML = `<div class="empty-state"><span class="empty-icon">📋</span><h3>No applications yet</h3><p>Browse jobs and apply to see them here.</p></div>`;
    return;
  }
  list.innerHTML = App.applications.map((app, i) => {
    const statusMap = {
      pending: '<span class="badge badge-pending">⏳ Pending</span>',
      confirmed: '<span class="badge badge-confirmed">✅ Confirmed</span>',
      rejected: '<span class="badge badge-cancelled">✕ Rejected</span>',
    };
    return `
    <div class="post-card">
      <div class="post-header">
        <div>
          <div class="post-title">${getCatIcon(app.category)} ${app.category}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">Applied on ${app.appliedOn}</div>
        </div>
        ${statusMap[app.status] || statusMap.pending}
      </div>
      <div class="post-body">
        <div class="post-detail"><strong>${app.applicantName}</strong>Your Name</div>
        <div class="post-detail"><strong>₹${app.fee}/day</strong>Fee</div>
        <div class="post-detail"><strong>${app.date}</strong>Work Date</div>
        <div class="post-detail"><strong>${app.applicantContact}</strong>Contact</div>
      </div>
      <div class="post-detail" style="margin-bottom:0.75rem;font-size:0.85rem;color:var(--text-muted)">📍 ${app.address}</div>
      ${app.status === 'confirmed'
        ? `<div style="background:var(--accent2-light);border-radius:var(--radius-sm);padding:0.75rem;font-size:0.88rem;color:var(--accent2)">🎉 Your application has been confirmed! Report to the location on ${app.date}.</div>`
        : app.status === 'rejected'
        ? `<div style="background:#fce8e8;border-radius:var(--radius-sm);padding:0.75rem;font-size:0.88rem;color:#c53030">Unfortunately this application was not selected.</div>`
        : `<div style="background:var(--surface2);border-radius:var(--radius-sm);padding:0.75rem;font-size:0.88rem;color:var(--text-muted)">Your application is under review by the hirer.</div>`
      }
    </div>`;
  }).join('');
}

// ===== AUTH MODAL =====
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-tab').forEach(t => {
    if (t.textContent.toLowerCase().includes(tab)) t.classList.add('active');
  });
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

function fakeLogin() {
  closeModal('authModal');
  showToast('👋 Welcome to WorkSetGo!');
}

// ===== MODAL HELPERS =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOutside(e, id) {
  if (e.target.id === id) closeModal(id);
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ===== HELPERS =====
function getCatIcon(catName) {
  const cat = CATEGORIES.find(c => c.name.toLowerCase() === catName.toLowerCase());
  return cat ? cat.icon : '🛠️';
}
