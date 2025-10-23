// ---------- Helpers ----------
function showJSON(elId, obj) {
  const pre = document.getElementById(elId);
  pre.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);

  // also show a "no data" row in the table when we output JSON
  const tbody = document.getElementById('results-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="7" class="no-data">See JSON below</td></tr>`;
  }
}

// normalize payload and render table when possible
function handleApiResponse(payload) {
  // Accept shapes: {data:[...]}, [...], {user:{...}}, {success:true}, {error:...}
  let rows = null;

  if (Array.isArray(payload)) {
    rows = payload;
  } else if (payload && Array.isArray(payload.data)) {
    rows = payload.data;
  } else if (payload && payload.user && typeof payload.user === 'object') {
    rows = [payload.user];
  }

  if (rows) renderTable(rows);
  else showJSON('user-results', payload);
}

function renderTable(rows) {
  const tbody = document.getElementById('results-body');
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="no-data">No results</td></tr>`;
    document.getElementById('user-results').textContent = '';
    return;
  }

  const fmtDate = (v) => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleString();
  };

  tbody.innerHTML = '';
  rows.forEach((u) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.username ?? ''}</td>
      <td>${u.firstname ?? ''}</td>
      <td>${u.lastname ?? ''}</td>
      <td>${u.salary ?? ''}</td>
      <td>${u.age ?? ''}</td>
      <td>${fmtDate(u.registerday) ?? ''}</td>
      <td>${fmtDate(u.signintime) ?? ''}</td>
    `;
    tbody.appendChild(tr);
  });

  // clear raw JSON when showing table
  document.getElementById('user-results').textContent = '';
}

// ---------- Wire up UI once DOM is ready ----------
document.addEventListener('DOMContentLoaded', () => {
  // Register
  const btnRegister = document.getElementById('btn-register');
  btnRegister.onclick = async () => {
    const body = {
      username:  document.getElementById('r-username').value.trim(),
      password:  document.getElementById('r-password').value,
      firstname: document.getElementById('r-first').value.trim(),
      lastname:  document.getElementById('r-last').value.trim(),
      salary:    document.getElementById('r-salary').value || null,
      age:       document.getElementById('r-age').value || null
    };
    if (!body.username || !body.password || !body.firstname || !body.lastname) {
      return showJSON('user-results', { error: 'username, password, firstname, lastname are required' });
    }
    try {
      const res = await fetch('http://localhost:5050/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      handleApiResponse(data);
    } catch (e) {
      showJSON('user-results', { error: e.message });
    }
  };

  // Login
  const btnLogin = document.getElementById('btn-login');
  btnLogin.onclick = async () => {
    const body = {
      username: document.getElementById('l-username').value.trim(),
      password: document.getElementById('l-password').value
    };
    if (!body.username || !body.password) {
      return showJSON('user-results', { error: 'username and password required' });
    }
    try {
      const res = await fetch('http://localhost:5050/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      handleApiResponse(data);
    } catch (e) {
      showJSON('user-results', { error: e.message });
    }
  };

  // Search by first/last
  document.getElementById('btn-search-firstlast').onclick = async () => {
    const first = document.getElementById('s-first').value.trim();
    const last  = document.getElementById('s-last').value.trim();
    const url = new URL('http://localhost:5050/users/search');
    if (first) url.searchParams.set('first', first);
    if (last)  url.searchParams.set('last', last);
    const res = await fetch(url);
    handleApiResponse(await res.json());
  };

  // By username
  document.getElementById('btn-search-username').onclick = async () => {
    const u = document.getElementById('s-username').value.trim();
    if (!u) return showJSON('user-results', { error: 'enter a username' });
    const res = await fetch(`http://localhost:5050/users/${encodeURIComponent(u)}`);
    handleApiResponse(await res.json());
  };

  // Salary range
  document.getElementById('btn-search-salary').onclick = async () => {
    const min = document.getElementById('s-sal-min').value;
    const max = document.getElementById('s-sal-max').value;
    const url = new URL('http://localhost:5050/users/salary/range');
    url.searchParams.set('min', min);
    url.searchParams.set('max', max);
    const res = await fetch(url);
    handleApiResponse(await res.json());
  };

  // Age range
  document.getElementById('btn-search-age').onclick = async () => {
    const min = document.getElementById('s-age-min').value;
    const max = document.getElementById('s-age-max').value;
    const url = new URL('http://localhost:5050/users/age/range');
    url.searchParams.set('min', min);
    url.searchParams.set('max', max);
    const res = await fetch(url);
    handleApiResponse(await res.json());
  };

  // Registered after
  document.getElementById('btn-search-after').onclick = async () => {
    const u = document.getElementById('s-after-username').value.trim();
    if (!u) return showJSON('user-results', { error: 'enter a username to compare against' });
    const res = await fetch(`http://localhost:5050/users/registered-after/${encodeURIComponent(u)}`);
    handleApiResponse(await res.json());
  };

  // Never signed in
  document.getElementById('btn-never-signed').onclick = async () => {
    const res = await fetch('http://localhost:5050/users/never-signed-in');
    handleApiResponse(await res.json());
  };

  // Same day as
  document.getElementById('btn-same-day').onclick = async () => {
    const u = document.getElementById('s-same-username').value.trim();
    if (!u) return showJSON('user-results', { error: 'enter a username to compare against' });
    const res = await fetch(`http://localhost:5050/users/same-day-as/${encodeURIComponent(u)}`);
    handleApiResponse(await res.json());
  };

  // Registered today
  document.getElementById('btn-today').onclick = async () => {
    const res = await fetch('http://localhost:5050/users/registered-today');
    handleApiResponse(await res.json());
  };
});
