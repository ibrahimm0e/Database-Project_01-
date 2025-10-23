// helpers
function showJSON(elId, obj) {
  document.getElementById(elId).textContent = JSON.stringify(obj, null, 2);
}

// Buttons wiring (Users)
document.getElementById('btn-register').onclick = async () => {
  const body = {
    username:  document.getElementById('r-username').value,
    password:  document.getElementById('r-password').value,
    firstname: document.getElementById('r-first').value,
    lastname:  document.getElementById('r-last').value,
    salary:    document.getElementById('r-salary').value || null,
    age:       document.getElementById('r-age').value || null
  };
  const res = await fetch('http://localhost:5050/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  showJSON('user-results', await res.json());
};

document.getElementById('btn-login').onclick = async () => {
  const body = {
    username: document.getElementById('l-username').value,
    password: document.getElementById('l-password').value
  };
  const res = await fetch('http://localhost:5050/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  showJSON('user-results', await res.json());
};

document.getElementById('btn-search-firstlast').onclick = async () => {
  const first = document.getElementById('s-first').value;
  const last  = document.getElementById('s-last').value;
  const url = new URL('http://localhost:5050/users/search');
  if (first) url.searchParams.set('first', first);
  if (last)  url.searchParams.set('last', last);
  const res = await fetch(url);
  showJSON('user-results', await res.json());
};

document.getElementById('btn-search-username').onclick = async () => {
  const u = document.getElementById('s-username').value;
  const res = await fetch(`http://localhost:5050/users/${encodeURIComponent(u)}`);
  showJSON('user-results', await res.json());
};

document.getElementById('btn-search-salary').onclick = async () => {
  const min = document.getElementById('s-sal-min').value;
  const max = document.getElementById('s-sal-max').value;
  const url = new URL('http://localhost:5050/users/salary/range');
  url.searchParams.set('min', min);
  url.searchParams.set('max', max);
  const res = await fetch(url);
  showJSON('user-results', await res.json());
};

document.getElementById('btn-search-age').onclick = async () => {
  const min = document.getElementById('s-age-min').value;
  const max = document.getElementById('s-age-max').value;
  const url = new URL('http://localhost:5050/users/age/range');
  url.searchParams.set('min', min);
  url.searchParams.set('max', max);
  const res = await fetch(url);
  showJSON('user-results', await res.json());
};

document.getElementById('btn-search-after').onclick = async () => {
  const u = document.getElementById('s-after-username').value;
  const res = await fetch(`http://localhost:5050/users/registered-after/${encodeURIComponent(u)}`);
  showJSON('user-results', await res.json());
};

document.getElementById('btn-never-signed').onclick = async () => {
  const res = await fetch('http://localhost:5050/users/never-signed-in');
  showJSON('user-results', await res.json());
};

document.getElementById('btn-same-day').onclick = async () => {
  const u = document.getElementById('s-same-username').value;
  const res = await fetch(`http://localhost:5050/users/same-day-as/${encodeURIComponent(u)}`);
  showJSON('user-results', await res.json());
};

document.getElementById('btn-today').onclick = async () => {
  const res = await fetch('http://localhost:5050/users/registered-today');
  showJSON('user-results', await res.json());
};
