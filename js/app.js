(
    function ($) {
        'use strict';

        const STORAGE_KEY = 'aurora_notes_v1';
    let notes = [];
        const $notesGrid = $('#notesGrid');
        const $searchInput = $('#searchInput');
        const $tagFilter = $('#tagFilter');
        const $sortSelect = $('#sortSelect');

        function loadNotes() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                notes = raw ? JSON.parse(raw) : [];
            } catch (e) { notes = []; }
        }

        function saveNotes() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        }

        function niceDate(ts) {
            const d = new Date(ts);
            return d.toLocaleString();
        }

        function getAllTags() {
            const s = new Set();
            notes.forEach(n => (n.tags || []).forEach(t => { if (t) s.add(t); }));
            return Array.from(s).sort();
        }

        function renderTagsFilter() {
            const tags = getAllTags();
            $tagFilter.empty();
            $tagFilter.append('<option value="">Filter by tag (all)</option>');
            tags.forEach(t => $tagFilter.append(`<option value="${t}">${t}</option>`));
        }

        function renderNotes() {
            const q = $searchInput.val().toLowerCase().trim();
            const tag = $tagFilter.val();
            const sort = $sortSelect.val();

            let list = notes.slice();
            // filters
            if (q) { list = list.filter(n => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q) || (n.tags || []).join(', ').toLowerCase().includes(q)); }
            if (tag) { list = list.filter(n => (n.tags || []).includes(tag)); }

            // sort
            if (sort === 'newest') { list.sort((a, b) => b.updated - a.updated); }
            else if (sort === 'oldest') { list.sort((a, b) => a.updated - b.updated); }
            else if (sort === 'title') { list.sort((a, b) => (a.title || '').localeCompare(b.title || '')); }

            $notesGrid.empty();
            if (list.length === 0) {
                $notesGrid.append('<div class="col"><div class="p-4 text-center">No notes yet - write something and click Save ✨</div></div>');
                return;
            }

                list.forEach((n, idx) => {
                                        const col = $('<div class="col"></div>');
                                        const card = $(`
                        <div class="card notes-card note-bg-${(idx % 3) + 1} p-3 shadow-sm">
                            <div class="card-body">
                                    <div>
                                        <div class="note-title">${escapeHtml(n.title || 'Untitled')}</div>
                                        <div class="note-meta">${niceDate(n.updated)}</div>
                                    </div>
                                <hr class="my-2">
                                <div class="note-content">${escapeHtml(n.content || '')}</div>
                                <div class="mt-3">
                                    ${(n.tags || []).map(t => `<span class="badge tag-badge">${escapeHtml(t)}</span>`).join(' ')}
                                </div>
                            </div>
                        </div>
                    `);
                                        col.append(card);
                                        $notesGrid.append(col);
                                });
        }

        // escapeHtml: sanitize text for safe HTML insertion
        function escapeHtml(s) {
            return String(s || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/\'/g, '&#39;');
        }

  function addNote() {
                    const title = $('#noteTitle').val().trim();
                    const content = $('#noteContent').val().trim();
                    const tags = $('#noteTags').val().split(',').map(t => t.trim()).filter(Boolean);
                    if (!content && !title) return flash('Please write something before saving.');
                    const n = { id: Date.now().toString(), title, content, tags, created: Date.now(), updated: Date.now() };
                    notes.push(n);
                    saveNotes();
                    renderTagsFilter();
                    renderNotes();
                    clearForm();
                }

  function clearForm() {
                    $('#noteTitle').val('');
                    $('#noteContent').val('');
                    $('#noteTags').val('');
                }


  function clearAllNotes() {
                    if (!confirm('Delete all notes? This cannot be undone.')) return;
                    notes = [];
                    saveNotes();
                    renderTagsFilter();
                    renderNotes();
                }

  function flash(msg) {
                    const $f = $(`<div class="toast align-items-center text-bg-dark border-0 position-fixed bottom-0 end-0 m-3" role="alert" aria-live="assertive" aria-atomic="true"><div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>`);
                    $('body').append($f);
                    const t = new bootstrap.Toast($f[0]);
                    t.show();
                    setTimeout(() => { $f.remove(); }, 6000);
                }

  function exportNotes() {
                    const data = JSON.stringify(notes, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `aurora-notes-${Date.now()}.json`;
                    document.body.appendChild(a); a.click(); a.remove();
                    URL.revokeObjectURL(url);
                }

    function importNotes(file) {
                    const reader = new FileReader();
                    reader.onload = e => {
                        try {
                            const incoming = JSON.parse(e.target.result);
                            if (!Array.isArray(incoming)) throw new Error('Invalid format');
                            const incomingFiltered = incoming.map(n => ({ id: n.id || Date.now().toString() + Math.random(), title: n.title || '', content: n.content || '', tags: n.tags || [], created: n.created || Date.now(), updated: n.updated || Date.now() }));
                            notes = notes.concat(incomingFiltered);
                            saveNotes();
                            renderTagsFilter();
                            renderNotes();
                            flash('Imported notes successfully');
                        } catch (err) { flash('Import failed: invalid file'); }
                    };
                    reader.readAsText(file);
                }

  // events
  $(function () {
                    loadNotes();
                    renderTagsFilter();
                    renderNotes();

                    $('#saveNote').on('click', addNote);
                    $('#clearForm').on('click', clearForm);

                    $searchInput.on('input', renderNotes);
                    $tagFilter.on('change', renderNotes);
                    $sortSelect.on('change', renderNotes);

                    $('#clearAll').on('click', clearAllNotes);

                    $('#exportBtn').on('click', exportNotes);
                    $('#importBtn').on('click', () => $('#importFile').trigger('click'));
                    $('#importFile').on('change', function (e) { const f = this.files && this.files[0]; if (f) importNotes(f); this.value = ''; });

                    // quick save with Ctrl+Enter on editor
                    $('#noteContent').on('keydown', function (e) { if (e.ctrlKey && e.key === 'Enter') { $('#saveNote').trigger('click'); } });
                });

        }) (jQuery);
