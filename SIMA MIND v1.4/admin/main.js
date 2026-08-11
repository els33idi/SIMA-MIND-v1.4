const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');
const connectedStatus = document.getElementById('connectedStatus');
const authCard = document.getElementById('authCard');
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const statsGrid = document.getElementById('statsGrid');
const searchQuery = document.getElementById('searchQuery');
const searchButton = document.getElementById('searchButton');
const userTableBody = document.getElementById('userTableBody');
const mfaView = document.getElementById('mfaView');
const mfaCodeInput = document.getElementById('mfaCode');
const mfaVerifyButton = document.getElementById('mfaVerifyButton');
const mfaCancelButton = document.getElementById('mfaCancelButton');
const mfaHint = document.getElementById('mfaHint');
const mfaMessage = document.getElementById('mfaMessage');
const logoutButton = document.getElementById('logoutButton');
const adminEmail = document.getElementById('adminEmail');
const adminRole = document.getElementById('adminRole');
const adminMFAStatus = document.getElementById('adminMFAStatus');
const startTOTPButton = document.getElementById('startTOTPButton');
const disableMFAButton = document.getElementById('disableMFAButton');
const totpSetupView = document.getElementById('totpSetupView');
const totpQrContainer = document.getElementById('totpQrContainer');
const totpSecret = document.getElementById('totpSecret');
const totpConfirmCode = document.getElementById('totpConfirmCode');
const confirmTOTPButton = document.getElementById('confirmTOTPButton');
const cancelTOTPButton = document.getElementById('cancelTOTPButton');
const totpMessage = document.getElementById('totpMessage');
const auditUserId = document.getElementById('auditUserId');
const auditAction = document.getElementById('auditAction');
const auditStatus = document.getElementById('auditStatus');
const auditStart = document.getElementById('auditStart');
const auditEnd = document.getElementById('auditEnd');
const auditButton = document.getElementById('auditButton');
const exportAuditButton = document.getElementById('exportAuditButton');
const auditTableBody = document.getElementById('auditTableBody');
const userPrevButton = document.getElementById('userPrevButton');
const userNextButton = document.getElementById('userNextButton');
const userPageLabel = document.getElementById('userPageLabel');
const auditPrevButton = document.getElementById('auditPrevButton');
const auditNextButton = document.getElementById('auditNextButton');
const auditPageLabel = document.getElementById('auditPageLabel');
const createEmail = document.getElementById('createEmail');
const createPassword = document.getElementById('createPassword');
const createRole = document.getElementById('createRole');
const createStatus = document.getElementById('createStatus');
const createUserButton = document.getElementById('createUserButton');
const selectedUserCard = document.getElementById('selectedUserCard');
const selectedUserBanner = document.getElementById('selectedUserBanner');
const selectedUserBannerText = document.getElementById('selectedUserBannerText');
const selectedUserLabel = document.getElementById('selectedUserLabel');
const detailEmail = document.getElementById('detailEmail');
const detailRole = document.getElementById('detailRole');
const detailStatus = document.getElementById('detailStatus');
const subscriptionPlan = document.getElementById('subscriptionPlan');
const detailPlan = document.getElementById('detailPlan');
const saveSubscriptionButton = document.getElementById('saveSubscriptionButton');
const refreshUserDetailsButton = document.getElementById('refreshUserDetailsButton');
const sessionTableBody = document.getElementById('sessionTableBody');
const toast = document.getElementById('toast');

const state = {
  token: null,
  pendingEmail: null,
  pendingMethod: null,
  usersPage: 0,
  auditPage: 0,
  usersPerPage: 25,
  auditPerPage: 25,
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function setConnected(connected) {
  connectedStatus.textContent = connected ? 'Connected' : 'Offline';
  connectedStatus.style.background = connected ? '#ecfdf5' : '#eef2ff';
  connectedStatus.style.color = connected ? '#166534' : '#4338ca';
}

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

async function fetchStats() {
  try {
    const { stats } = await apiFetch('/api/admin/stats');
    statsGrid.innerHTML = `
      <div class="card"><h3>Total users</h3><strong>${stats.totalUsers}</strong></div>
      <div class="card"><h3>Active users</h3><strong>${stats.activeUsers}</strong></div>
      <div class="card"><h3>Suspended users</h3><strong>${stats.suspendedUsers}</strong></div>
    `;
  } catch (error) {
    showToast(error.message);
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '—';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

async function getSubscriptionPlans() {
  try {
    const { plans } = await apiFetch('/api/admin/subscriptions/plans');
    return plans;
  } catch (error) {
    showToast(error.message);
    return [];
  }
}

function renderUserRow(user) {
  return `
    <tr data-user-id="${user.id}">
      <td>${user.email || '—'}</td>
      <td>
        <select class="role-select" data-user-id="${user.id}">
          <option value="student" ${user.role === 'student' ? 'selected' : ''}>student</option>
          <option value="support_admin" ${user.role === 'support_admin' ? 'selected' : ''}>support_admin</option>
          <option value="analytics_admin" ${user.role === 'analytics_admin' ? 'selected' : ''}>analytics_admin</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
          <option value="super_admin" ${user.role === 'super_admin' ? 'selected' : ''}>super_admin</option>
        </select>
      </td>
      <td>
        <select class="status-select" data-user-id="${user.id}">
          <option value="active" ${user.status === 'active' ? 'selected' : ''}>active</option>
          <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>suspended</option>
        </select>
      </td>
      <td>${new Date(user.created_at).toLocaleDateString()}</td>
      <td>
        <button class="secondary user-save-button" data-user-id="${user.id}">Save</button>
        <button class="secondary user-select-button" data-user-id="${user.id}" data-user-email="${user.email}">Select</button>
        <button class="secondary user-delete-button" data-user-id="${user.id}">Delete</button>
      </td>
    </tr>
  `;
}

async function searchUsers(q = '') {
  try {
    const offset = state.usersPage * state.usersPerPage;
    const { users } = await apiFetch(`/api/admin/users?q=${encodeURIComponent(q)}&limit=${state.usersPerPage}&offset=${offset}`);
    userTableBody.innerHTML = users.map(renderUserRow).join('');
    userPageLabel.textContent = `Page ${state.usersPage + 1}`;
    userPrevButton.disabled = state.usersPage === 0;
    userNextButton.disabled = users.length < state.usersPerPage;
  } catch (error) {
    showToast(error.message);
  }
}

async function showLoginView() {
  loginView.classList.remove('hidden');
  mfaView.classList.add('hidden');
  dashboardView.classList.add('hidden');
  state.pendingEmail = null;
  state.pendingMethod = null;
  loginMessage.textContent = '';
  mfaMessage.textContent = '';
  mfaCodeInput.value = '';
  passwordInput.value = '';
}

async function showMFAView(method, email) {
  loginView.classList.add('hidden');
  mfaView.classList.remove('hidden');
  dashboardView.classList.add('hidden');
  state.pendingEmail = email;
  state.pendingMethod = method;
  mfaHint.textContent = method === 'totp'
    ? 'Enter the 6-digit authenticator app code.'
    : 'Enter the 6-digit code sent to your email or phone.';
  mfaMessage.textContent = '';
  mfaCodeInput.value = '';
}

async function completeLogin(token) {
  state.token = token;
  setConnected(true);
  loginView.classList.add('hidden');
  mfaView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  await loadProfile();
  fetchStats();
  searchUsers('');
  await loadAuditLogs();
  showToast('Signed in successfully');
}

async function loadProfile() {
  try {
    const profile = await apiFetch('/api/auth/profile');
    adminEmail.textContent = profile.email;
    adminRole.textContent = `Role: ${profile.role || 'admin'}`;
    adminMFAStatus.textContent = profile.mfaEnabled
      ? `MFA enabled (${profile.mfaType})`
      : 'MFA disabled';
    startTOTPButton.classList.toggle('hidden', profile.mfaEnabled);
    disableMFAButton.classList.toggle('hidden', !profile.mfaEnabled);
  } catch (error) {
    showToast(error.message);
  }
}

async function updateUserRecord(userId, role, status, buttonElement = null) {
  const originalText = buttonElement?.textContent;
  try {
    if (buttonElement) {
      buttonElement.disabled = true;
      buttonElement.textContent = 'Saving...';
    }

    if (role) {
      await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
    }
    if (status) {
      await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
    }
    showToast('User updated successfully.');
    await searchUsers(searchQuery.value.trim());
  } catch (error) {
    showToast(error.message);
  } finally {
    if (buttonElement) {
      buttonElement.disabled = false;
      buttonElement.textContent = originalText || 'Save';
    }
  }
}

async function loadSelectedUser(userId) {
  try {
    const { user } = await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}`);
    const plans = await getSubscriptionPlans();
    const subscription = await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/subscription`).then(result => result.subscription).catch(() => null);
    const sessions = await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/sessions`).then(result => result.sessions).catch(() => []);

    selectedUserCard.classList.remove('hidden');
    selectedUserBanner.style.display = 'flex';
    selectedUserBannerText.textContent = `Selected user: ${user.email || user.id}`;
    selectedUserLabel.textContent = `Managing ${user.email || user.id}`;
    detailEmail.textContent = user.email || '—';
    detailRole.textContent = user.role || '—';
    detailStatus.textContent = user.status || '—';
    detailPlan.textContent = subscription?.plan || user.subscription_plan || 'free';

    subscriptionPlan.innerHTML = plans.map(plan => `
      <option value="${plan.plan}" ${plan.plan === (subscription?.plan || user.subscription_plan || 'free') ? 'selected' : ''}>
        ${plan.name || plan.plan} (${plan.price || 'Free'})
      </option>
    `).join('');

    sessionTableBody.innerHTML = sessions.map(session => `
      <tr data-session-id="${session.id}">
        <td>${session.device_name || session.device_type || 'web'}</td>
        <td>${session.ip_address || '—'}</td>
        <td>${formatTimestamp(session.created_at)}</td>
        <td>${formatTimestamp(session.expires_at)}</td>
        <td><button class="secondary session-revoke-button" data-session-id="${session.id}" data-user-id="${userId}">Revoke</button></td>
      </tr>
    `).join('');

    const subscriptionHistory = await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/subscription/history?limit=20&offset=0`).then(result => result.history).catch(() => []);
    const subscriptionHistoryBody = document.getElementById('subscriptionHistoryBody');
    if (subscriptionHistory.length === 0) {
      subscriptionHistoryBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color:#64748b; padding: 16px;">No subscription history for this user.</td>
        </tr>
      `;
    } else {
      subscriptionHistoryBody.innerHTML = subscriptionHistory.map(entry => `
        <tr>
          <td>${entry.plan || 'free'}</td>
          <td>${formatTimestamp(entry.plan_started_at || entry.trial_started_at)}</td>
          <td>${formatTimestamp(entry.plan_ends_at || entry.trial_ends_at)}</td>
          <td>${formatTimestamp(entry.created_at)}</td>
          <td>${entry.is_active ? 'active' : 'expired'}</td>
        </tr>
      `).join('');
    }

    state.selectedUserId = userId;
  } catch (error) {
    showToast(error.message);
  }
}

async function loadAuditLogs({ userId = '', action = '', status = '', start = '', end = '' } = {}) {
  try {
    const query = [];
    if (userId) query.push(`userId=${encodeURIComponent(userId)}`);
    if (action) query.push(`action=${encodeURIComponent(action)}`);
    if (status) query.push(`status=${encodeURIComponent(status)}`);
    if (start) query.push(`start=${encodeURIComponent(start)}`);
    if (end) query.push(`end=${encodeURIComponent(end)}`);
    query.push(`limit=${state.auditPerPage}`);
    query.push(`offset=${state.auditPage * state.auditPerPage}`);
    const { logs } = await apiFetch(`/api/admin/audit?${query.join('&')}`);

    if (!logs || logs.length === 0) {
      auditTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; color:#64748b; padding:16px;">No audit log entries match the current filters.</td>
        </tr>
      `;
    } else {
      auditTableBody.innerHTML = logs.map(log => `
        <tr>
          <td>${new Date(log.created_at).toLocaleString()}</td>
          <td>${log.user_id || 'system'}</td>
          <td>${log.action}</td>
          <td>${log.resource_type || '-'} ${log.resource_id || ''}</td>
          <td>${log.status || '-'}</td>
          <td>${log.details ? JSON.stringify(JSON.parse(log.details || '{}')) : '-'}</td>
        </tr>
      `).join('');
    }

    auditPageLabel.textContent = `Page ${state.auditPage + 1}`;
    auditPrevButton.disabled = state.auditPage === 0;
    auditNextButton.disabled = !logs || logs.length < state.auditPerPage;
  } catch (error) {
    showToast(error.message);
  }
}

async function createNewUser() {
  const email = createEmail.value.trim();
  const password = createPassword.value.trim();
  const role = createRole.value;
  const status = createStatus.value;

  if (!email || !password) {
    showToast('Email and password are required to create a user.');
    return;
  }

  try {
    await apiFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, status }),
    });
    showToast('User created successfully.');
    createEmail.value = '';
    createPassword.value = '';
    createRole.value = 'student';
    createStatus.value = 'active';
    state.usersPage = 0;
    searchUsers(searchQuery.value.trim());
  } catch (error) {
    showToast(error.message);
  }
}

async function saveUserSubscription() {
  if (!state.selectedUserId) {
    showToast('Select a user first.');
    return;
  }

  const plan = subscriptionPlan.value;
  try {
    await apiFetch(`/api/admin/users/${encodeURIComponent(state.selectedUserId)}/subscription`, {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
    showToast('Subscription updated successfully.');
    await loadSelectedUser(state.selectedUserId);
  } catch (error) {
    showToast(error.message);
  }
}

async function deleteUser(userId) {
  try {
    await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    showToast('User deleted successfully.');
    if (state.selectedUserId === userId) {
      selectedUserCard.classList.add('hidden');
      state.selectedUserId = null;
    }
    searchUsers(searchQuery.value.trim());
  } catch (error) {
    showToast(error.message);
  }
}

async function revokeSession(sessionId, userId) {
  try {
    await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
    });
    showToast('Session revoked successfully.');
    if (state.selectedUserId === userId) {
      await loadSelectedUser(userId);
    }
  } catch (error) {
    showToast(error.message);
  }
}

async function downloadAuditExport({ userId = '', action = '', status = '', start = '', end = '' } = {}) {
  try {
    const query = [];
    if (userId) query.push(`userId=${encodeURIComponent(userId)}`);
    if (action) query.push(`action=${encodeURIComponent(action)}`);
    if (status) query.push(`status=${encodeURIComponent(status)}`);
    if (start) query.push(`start=${encodeURIComponent(start)}`);
    if (end) query.push(`end=${encodeURIComponent(end)}`);
    query.push(`limit=${state.auditPerPage * 10}`);
    const response = await fetch(`/api/admin/audit/export?${query.join('&')}`, {
      headers: state.token ? { Authorization: `Bearer ${state.token}` } : {},
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Export failed');
    }
    const csv = await response.text();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `audit-export-${Date.now()}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    showToast('Audit export downloaded.');
  } catch (error) {
    showToast(error.message);
  }
}

async function loadAuditLogs({ userId = '', action = '', status = '', start = '', end = '' } = {}) {
  try {
    const query = [];
    if (userId) query.push(`userId=${encodeURIComponent(userId)}`);
    if (action) query.push(`action=${encodeURIComponent(action)}`);
    if (status) query.push(`status=${encodeURIComponent(status)}`);
    if (start) query.push(`start=${encodeURIComponent(start)}`);
    if (end) query.push(`end=${encodeURIComponent(end)}`);
    query.push(`limit=${state.auditPerPage}`);
    query.push(`offset=${state.auditPage * state.auditPerPage}`);
    const { logs } = await apiFetch(`/api/admin/audit?${query.join('&')}`);

    auditTableBody.innerHTML = logs.map(log => `
      <tr>
        <td>${new Date(log.created_at).toLocaleString()}</td>
        <td>${log.user_id || 'system'}</td>
        <td>${log.action}</td>
        <td>${log.resource_type || '-'} ${log.resource_id || ''}</td>
        <td>${log.status || '-'}</td>
        <td>${log.details ? JSON.stringify(JSON.parse(log.details || '{}')) : '-'}</td>
      </tr>
    `).join('');
    auditPageLabel.textContent = `Page ${state.auditPage + 1}`;
    auditPrevButton.disabled = state.auditPage === 0;
    auditNextButton.disabled = logs.length < state.auditPerPage;
  } catch (error) {
    showToast(error.message);
  }
}

async function startTOTPSetup() {
  totpMessage.textContent = '';
  try {
    const result = await apiFetch('/api/auth/mfa/setup', {
      method: 'POST',
      body: JSON.stringify({ type: 'totp' }),
    });

    totpSecret.textContent = result.secret;
    totpQrContainer.innerHTML = `<a href="${result.otpauthUrl}" target="_blank" rel="noreferrer">Open authenticator QR</a>`;
    totpSetupView.classList.remove('hidden');
  } catch (error) {
    totpMessage.textContent = error.message;
  }
}

async function confirmTOTPSetup() {
  totpMessage.textContent = '';
  const code = totpConfirmCode.value.trim();
  if (!code) {
    totpMessage.textContent = 'Please enter the code from your authenticator app.';
    return;
  }

  try {
    await apiFetch('/api/auth/mfa/confirm', {
      method: 'POST',
      body: JSON.stringify({ type: 'totp', code }),
    });

    totpSetupView.classList.add('hidden');
    totpConfirmCode.value = '';
    showToast('TOTP MFA enabled successfully.');
    await loadProfile();
  } catch (error) {
    totpMessage.textContent = error.message;
  }
}

async function cancelTOTPSetup() {
  totpSetupView.classList.add('hidden');
  totpQrContainer.innerHTML = '';
  totpSecret.textContent = '';
  totpConfirmCode.value = '';
  totpMessage.textContent = '';
}

async function disableMFA() {
  const secret = prompt('Enter your current MFA code or password to disable MFA.');
  if (!secret) return;
  try {
    await apiFetch('/api/auth/mfa/disable', {
      method: 'POST',
      body: JSON.stringify({ code: secret }),
    });
    showToast('MFA disabled successfully.');
    await loadProfile();
  } catch (error) {
    showToast(error.message);
  }
}

async function showError(message) {
  showToast(message);
}

async function signIn() {
  loginMessage.textContent = '';
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) {
    loginMessage.textContent = 'Email and password are required.';
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceType: 'admin-panel' }),
    });
    const data = await response.json();
    if (!response.ok) {
      loginMessage.textContent = data.error || 'Login failed.';
      return;
    }

    if (data.requiresMFA) {
      await showMFAView(data.method || 'code', email);
      return;
    }

    const token = data.session?.token || data.token;
    if (!token) {
      loginMessage.textContent = 'Failed to get auth token.';
      return;
    }

    await completeLogin(token);
  } catch (error) {
    loginMessage.textContent = error.message;
  }
}

async function verifyMFA() {
  mfaMessage.textContent = '';
  const code = mfaCodeInput.value.trim();
  if (!code || !state.pendingEmail) {
    mfaMessage.textContent = 'MFA code is required.';
    return;
  }

  try {
    const response = await fetch('/api/auth/verify-mfa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.pendingEmail, code }),
    });
    const data = await response.json();
    if (!response.ok) {
      mfaMessage.textContent = data.error || 'MFA verification failed.';
      return;
    }

    const token = data.session?.token || data.token;
    if (!token) {
      mfaMessage.textContent = 'Failed to retrieve auth token.';
      return;
    }

    await completeLogin(token);
  } catch (error) {
    mfaMessage.textContent = error.message;
  }
}

loginButton.addEventListener('click', signIn);
mfaVerifyButton.addEventListener('click', verifyMFA);
mfaCancelButton.addEventListener('click', () => showLoginView());
startTOTPButton.addEventListener('click', startTOTPSetup);
confirmTOTPButton.addEventListener('click', confirmTOTPSetup);
cancelTOTPButton.addEventListener('click', cancelTOTPSetup);
disableMFAButton.addEventListener('click', disableMFA);
createUserButton.addEventListener('click', createNewUser);
saveSubscriptionButton.addEventListener('click', saveUserSubscription);
refreshUserDetailsButton.addEventListener('click', () => {
  if (state.selectedUserId) {
    loadSelectedUser(state.selectedUserId);
  }
});
searchButton.addEventListener('click', () => {
  state.usersPage = 0;
  searchUsers(searchQuery.value.trim());
});
auditButton.addEventListener('click', () => {
  state.auditPage = 0;
  loadAuditLogs({
    userId: auditUserId.value.trim(),
    action: auditAction.value,
    status: auditStatus.value,
    start: auditStart.value,
    end: auditEnd.value,
  });
});
exportAuditButton?.addEventListener('click', () => {
  downloadAuditExport({
    userId: auditUserId.value.trim(),
    action: auditAction.value,
    status: auditStatus.value,
    start: auditStart.value,
    end: auditEnd.value,
  });
});
userPrevButton.addEventListener('click', () => {
  if (state.usersPage > 0) {
    state.usersPage -= 1;
    searchUsers(searchQuery.value.trim());
  }
});
userNextButton.addEventListener('click', () => {
  state.usersPage += 1;
  searchUsers(searchQuery.value.trim());
});
auditPrevButton.addEventListener('click', () => {
  if (state.auditPage > 0) {
    state.auditPage -= 1;
    loadAuditLogs({
      userId: auditUserId.value.trim(),
      action: auditAction.value,
      status: auditStatus.value,
      start: auditStart.value,
      end: auditEnd.value,
    });
  }
});
auditNextButton.addEventListener('click', () => {
  state.auditPage += 1;
  loadAuditLogs({
      userId: auditUserId.value.trim(),
      action: auditAction.value,
      status: auditStatus.value,
    start: auditStart.value,
    end: auditEnd.value,
  });
});
userTableBody.addEventListener('click', async (event) => {
  const saveButton = event.target.closest('.user-save-button');
  if (saveButton) {
    const userId = saveButton.dataset.userId;
    const row = saveButton.closest('tr');
    const role = row.querySelector('.role-select')?.value;
    const status = row.querySelector('.status-select')?.value;
    await updateUserRecord(userId, role, status, saveButton);
    return;
  }

  const selectButton = event.target.closest('.user-select-button');
  if (selectButton) {
    const userId = selectButton.dataset.userId;
    state.selectedUserId = userId;
    await loadSelectedUser(userId);
    return;
  }

  const deleteButton = event.target.closest('.user-delete-button');
  if (deleteButton) {
    const userId = deleteButton.dataset.userId;
    if (confirm('Delete this user? This cannot be undone.')) {
      await deleteUser(userId);
    }
    return;
  }

  const revokeButton = event.target.closest('.session-revoke-button');
  if (revokeButton) {
    const sessionId = revokeButton.dataset.sessionId;
    const userId = revokeButton.dataset.userId;
    if (confirm('Revoke this session?')) {
      await revokeSession(sessionId, userId);
    }
    return;
  }
});
logoutButton.addEventListener('click', () => {
  state.token = null;
  setConnected(false);
  showLoginView();
  emailInput.value = '';
  passwordInput.value = '';
  showToast('Logged out');
});
