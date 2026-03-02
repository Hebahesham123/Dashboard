(function () {
  const config = window.SUPABASE_CONFIG;
  if (!config || !config.url || !config.anonKey) {
    showError('Configure Supabase in dashboard/config.js (url, anonKey, tableName).');
    return;
  }

  const supabase = window.supabase.createClient(config.url, config.anonKey);
  const tableName = config.tableName || 'submissions';
  const createdAtColumn = config.createdAtColumn || 'created_at';

  let allRows = [];
  let sortValue = 'created_at_desc';
  let limitValue = 25;
  let searchQuery = '';

  const $searchInput = document.getElementById('searchInput');
  const $refreshBtn = document.getElementById('refreshBtn');
  const $sortSelect = document.getElementById('sortSelect');
  const $limitSelect = document.getElementById('limitSelect');
  const $loadingState = document.getElementById('loadingState');
  const $emptyState = document.getElementById('emptyState');
  const $dataTable = document.getElementById('dataTable');
  const $tableHead = document.getElementById('tableHead');
  const $tableBody = document.getElementById('tableBody');
  const $tableFooter = document.getElementById('tableFooter');
  const $tableCount = document.getElementById('tableCount');
  const $statTotal = document.getElementById('statTotal');
  const $statToday = document.getElementById('statToday');
  const $statWeek = document.getElementById('statWeek');
  const $toastContainer = document.getElementById('toastContainer');

  function showError(msg) {
    $loadingState.innerHTML = `<p style="color: var(--danger);">${escapeHtml(msg)}</p>`;
    $loadingState.style.display = 'flex';
    $emptyState.hidden = true;
    $dataTable.hidden = true;
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatDate(val) {
    if (val == null) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }

  function getDisplayColumns(row) {
    const skip = new Set(['id']);
    const keys = Object.keys(row).filter(k => !skip.has(k));
    const created = createdAtColumn && keys.includes(createdAtColumn);
    if (created) {
      keys.splice(keys.indexOf(createdAtColumn), 1);
      keys.unshift(createdAtColumn);
    }
    if (!keys.includes('id')) keys.unshift('id');
    return keys;
  }

  function buildTableHeader(columns) {
    $tableHead.innerHTML = '<tr></tr>';
    const labels = {
      id: 'ID',
      created_at: 'Date',
      name: 'Name',
      phone: 'Phone',
      address: 'Address',
      message: 'Message',
      requested_samples: 'Requested samples',
      attachment_name: 'Attachment',
      attachment_url: 'Attachment link'
    };
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = labels[col] || col.replace(/_/g, ' ');
      $tableHead.querySelector('tr').appendChild(th);
    });
  }

  function cellClass(key) {
    if (key === 'id') return 'cell-id';
    if (key === createdAtColumn) return 'cell-date';
    return 'cell-text';
  }

  function buildTableBody(rows, columns) {
    $tableBody.innerHTML = '';
    rows.forEach(row => {
      const tr = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        td.className = cellClass(col);
        const val = row[col];
        if (col === 'attachment_url' && val && typeof val === 'string') {
          const a = document.createElement('a');
          a.href = val;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = 'View file';
          a.className = 'link';
          td.appendChild(a);
        } else if (val != null && typeof val === 'object' && !(val instanceof Date)) {
          td.textContent = JSON.stringify(val);
        } else {
          td.textContent = col === createdAtColumn ? formatDate(val) : (val ?? '—');
        }
        tr.appendChild(td);
      });
      tr.dataset.id = row.id;
      $tableBody.appendChild(tr);
    });
  }

  function renderTable(rows) {
    if (rows.length === 0) {
      $dataTable.hidden = true;
      $emptyState.hidden = false;
      $tableFooter.hidden = true;
      var msg = $emptyState.querySelector('p');
      var sub = $emptyState.querySelector('span');
      if (allRows.length === 0) {
        msg.textContent = 'No submissions yet';
        sub.textContent = 'New entries will appear here when someone submits the form.';
      } else {
        msg.textContent = 'No matching submissions';
        sub.textContent = 'Try a different search or clear the search box.';
      }
      return;
    }
    $emptyState.hidden = true;
    $dataTable.hidden = false;
    $tableFooter.hidden = false;
    const columns = getDisplayColumns(rows[0]);
    buildTableHeader(columns);
    buildTableBody(rows, columns);
    $tableCount.textContent = `Showing ${rows.length} of ${allRows.length} submission${allRows.length === 1 ? '' : 's'}`;
  }

  function filterAndSort() {
    let list = [...allRows];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(row => {
        return Object.values(row).some(v => {
          if (v == null) return false;
          return String(v).toLowerCase().includes(q);
        });
      });
    }

    const [sortCol, order] = sortValue.split('_');
    const dir = order === 'asc' ? 1 : -1;
    const useCol = sortCol && list.length && list[0].hasOwnProperty(sortCol) ? sortCol : 'id';
    list.sort((a, b) => {
      const av = a[useCol];
      const bv = b[useCol];
      if (av == null && bv == null) return 0;
      if (av == null) return dir;
      if (bv == null) return -dir;
      if (typeof av === 'string' && typeof bv === 'string') {
        return dir * av.localeCompare(bv);
      }
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });

    const limit = parseInt(limitValue, 10) || 25;
    renderTable(list.slice(0, limit));
  }

  function updateStats() {
    $statTotal.textContent = allRows.length;

    if (createdAtColumn && allRows.length > 0) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      let today = 0;
      let week = 0;
      allRows.forEach(row => {
        const t = row[createdAtColumn];
        if (t == null) return;
        const d = new Date(t);
        if (isNaN(d.getTime())) return;
        if (d >= startOfToday) today++;
        if (d >= startOfWeek) week++;
      });
      $statToday.textContent = today;
      $statWeek.textContent = week;
    } else {
      $statToday.textContent = '—';
      $statWeek.textContent = '—';
    }
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;
    $toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function addNewRow(row) {
    const existing = allRows.find(r => String(r.id) === String(row.id));
    if (existing) return;
    allRows.unshift(row);
    updateStats();
    filterAndSort();
    const tr = $tableBody.querySelector(`tr[data-id="${row.id}"]`);
    if (tr) tr.classList.add('new-row');
    showToast('New submission received');
  }

  async function fetchData() {
    $loadingState.hidden = false;
    $emptyState.hidden = true;
    $dataTable.hidden = true;
    $tableFooter.hidden = true;

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(createdAtColumn || 'id', { ascending: false });

    $loadingState.hidden = true;

    if (error) {
      showError(error.message || 'Failed to load data from Supabase.');
      return;
    }

    allRows = Array.isArray(data) ? data : [];
    updateStats();
    filterAndSort();
  }

  function setupRealtime() {
    supabase
      .channel('submissions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName
        },
        function (payload) {
          const row = payload.new;
          if (row) addNewRow(row);
        }
      )
      .subscribe(function (status) {
        const badge = document.getElementById('realtimeBadge');
        if (status === 'SUBSCRIBED' && badge) {
          badge.title = 'Real-time updates connected';
        } else if (status === 'CHANNEL_ERROR' && badge) {
          badge.title = 'Real-time may be disabled for this table in Supabase';
        }
      });
  }

  $searchInput.addEventListener('input', function () {
    searchQuery = this.value;
    filterAndSort();
  });

  $sortSelect.addEventListener('change', function () {
    sortValue = this.value;
    filterAndSort();
  });

  $limitSelect.addEventListener('change', function () {
    limitValue = this.value;
    filterAndSort();
  });

  $refreshBtn.addEventListener('click', function () {
    this.disabled = true;
    fetchData().then(() => {
      this.disabled = false;
    });
  });

  fetchData();
  setupRealtime();
})();
