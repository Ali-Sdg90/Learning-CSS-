(() => {
    const el = {
        grid: document.getElementById("grid"),
        search: document.getElementById("search"),
        sort: document.getElementById("sort"),
        count: document.getElementById("count"),
        toggleView: document.getElementById("toggle-view"),
        sortFile: document.getElementById("sort-file"),
    };

    let games = [];
    let viewMode = "grid"; // 'grid' or 'table'

    function setCount() {
        el.count.textContent = `${games.length} games`;
    }

    function escapeHtml(s) {
        return (s + "").replace(
            /[&<>\"]/g,
            (c) =>
                ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
        );
    }

    function createCard(g) {
        const card = document.createElement("article");
        card.className = "card";
        const statusClass =
            "status-" + (g.status ? g.status.split(" ")[0] : "");
        card.classList.add(statusClass);
        if (g._highlight) card.classList.add("highlight");
        card.innerHTML = `
            <h3>${escapeHtml(g.game)}</h3>
            <div class="meta">
                <div class="badge">Status: ${escapeHtml(g.status)}</div>
                <div class="badge">Rating: ${escapeHtml(String(g.rating || "-"))}</div>
                <div class="badge">Difficulty: ${escapeHtml(g.difficulty || "-")}</div>
            </div>
            <div class="note">${escapeHtml(g.note || "")}</div>
            <div class="card-actions" style="margin-top:10px;display:flex;gap:8px;">
                <button data-share class="share-btn">Share</button>
            </div>
        `;
        return card;
    }

    function render(list) {
        if (!Array.isArray(list)) list = games;
        if (list.length === 0) {
            el.grid.innerHTML = '<div class="empty">No results</div>';
            setCount();
            return;
        }
        if (viewMode === "grid") {
            el.grid.innerHTML = "";
            const frag = document.createDocumentFragment();
            list.forEach((g) => frag.appendChild(createCard(g)));
            el.grid.appendChild(frag);
        } else {
            el.grid.innerHTML = "";
            const table = document.createElement("table");
            table.className = "data-table";
            const thead = document.createElement("thead");
            thead.innerHTML = `<tr><th>Game</th><th>Status</th><th>Rating</th><th>Difficulty</th><th>Note</th><th></th></tr>`;
            const tbody = document.createElement("tbody");
            list.forEach((g) => {
                const tr = document.createElement("tr");
                if (g._highlight) tr.classList.add("highlight");
                tr.innerHTML = `
                    <td>${escapeHtml(g.game)}</td>
                    <td>${escapeHtml(g.status)}</td>
                    <td>${escapeHtml(String(g.rating || ""))}</td>
                    <td>${escapeHtml(g.difficulty || "")}</td>
                    <td>${escapeHtml(g.note || "")}</td>
                    <td><button data-share class="share-btn">Share</button></td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(thead);
            table.appendChild(tbody);
            el.grid.appendChild(table);
        }
        setCount();
        attachShareHandlers();
    }

    function attachShareHandlers() {
        document.querySelectorAll("[data-share]").forEach((btn) => {
            btn.removeEventListener("click", onShareClick);
            btn.addEventListener("click", onShareClick);
        });
    }

    function onShareClick(e) {
        const btn = e.currentTarget;
        let title = "";
        const card = btn.closest(".card");
        if (card) {
            title = card.querySelector("h3")?.textContent || "";
        } else {
            const tr = btn.closest("tr");
            title = tr?.querySelector("td")?.textContent || "";
        }
        if (!title) return alert("Unable to determine game title");
        const url = new URL(window.location.href);
        url.searchParams.set("focus", title);
        const shareUrl = url.toString();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
                .writeText(shareUrl)
                .then(() => showToast("Link copied to clipboard"))
                .catch(() => {
                    prompt("Copy link", shareUrl);
                });
        } else {
            prompt("Copy link", shareUrl);
        }
    }

    function showToast(msg) {
        const t = document.createElement("div");
        t.className = "share-toast";
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.classList.add("visible"), 20);
        setTimeout(() => {
            t.classList.remove("visible");
            setTimeout(() => t.remove(), 200);
        }, 2000);
    }

    function applySearchAndSort() {
        const q = (el.search.value || "").toLowerCase().trim();
        let list = games.filter((g) => {
            return (
                (g.game || "").toLowerCase().includes(q) ||
                (g.note || "").toLowerCase().includes(q) ||
                (g.status || "").toLowerCase().includes(q)
            );
        });

        const mode = el.sort.value;
        list.sort((a, b) => {
            if (mode === "title-asc")
                return (a.game || "").localeCompare(b.game || "", undefined, {
                    sensitivity: "base",
                });
            if (mode === "title-desc")
                return (b.game || "").localeCompare(a.game || "", undefined, {
                    sensitivity: "base",
                });
            if (mode === "rating-desc")
                return (b.rating || 0) - (a.rating || 0);
            if (mode === "rating-asc") return (a.rating || 0) - (b.rating || 0);
            if (mode === "difficulty")
                return (a.difficulty || "").localeCompare(b.difficulty || "");
            if (mode === "status")
                return (a.status || "").localeCompare(b.status || "");
            return 0;
        });

        // focus handling AFTER sorting
        const focusParam = new URLSearchParams(window.location.search).get(
            "focus",
        );
        if (focusParam) {
            const lower = focusParam.toLowerCase();
            const idx = list.findIndex(
                (g) => (g.game || "").toLowerCase() === lower,
            );
            list.forEach((x) => delete x._highlight);
            if (idx > 0) {
                const [m] = list.splice(idx, 1);
                m._highlight = true;
                list.unshift(m);
            } else if (idx === 0) {
                list[0]._highlight = true;
            }
        } else {
            list.forEach((x) => delete x._highlight);
        }

        render(list);

        setTimeout(() => {
            const highlighted =
                document.querySelector(".card.highlight") ||
                document.querySelector(".data-table tbody tr.highlight");
            if (highlighted)
                highlighted.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
        }, 120);
    }

    function fetchData() {
        fetch("games.json")
            .then((r) => r.json())
            .then((data) => {
                games = data.slice();
                applySearchAndSort();
            })
            .catch((err) => {
                el.grid.innerHTML =
                    '<div class="empty">Failed to load games.json</div>';
                console.error("Error loading games.json", err);
            });
    }

    let timeout = null;
    el.search.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(applySearchAndSort, 180);
    });
    el.sort.addEventListener("change", applySearchAndSort);

    el.toggleView.addEventListener("click", () => {
        viewMode = viewMode === "grid" ? "table" : "grid";
        el.toggleView.textContent = viewMode === "grid" ? "Table" : "Grid";
        applySearchAndSort();
    });
    el.sortFile.addEventListener("click", () => {
        alert(
            "To permanently sort the file, run `npm run sort-games` in the Games-I-Played folder. See README.",
        );
    });

    // initial
    fetchData();
})();
