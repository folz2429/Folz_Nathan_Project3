// Shared Navigation Menu
   function initMenu() {
    const button = document.getElementById("menuButton");
    const panel = document.getElementById("menuPanel");
    if (!button || !panel) return;
  
    button.addEventListener("click", () => {
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    });
  }
  
// CSV Loader - Shared by Registration Page
  async function loadSessionsFromCSV() {
    const response = await fetch("comiccon_sessions_data.txt");
    const text = await response.text();
  
    const rows = text.trim().split("\n");
    const headers = rows[0].split(",");
  
    return rows.slice(1).map(row => {
      const values = row.split(",");
      const session = {};
      headers.forEach((h, i) => (session[h] = values[i]));
      return session;
    });
  }
  
// Populate dropdown on index.html
  async function populateSessionDropdown() {
    const dropdown = document.getElementById("sessionTitle");
    if (!dropdown) return;
  
    const sessions = await loadSessionsFromCSV();
    dropdown.innerHTML = `<option value="">-- Choose a Session --</option>`;
  
    sessions.forEach(s => {
      const option = document.createElement("option");
      option.value = s.session_title;
      option.textContent = s.session_title;
      dropdown.appendChild(option);
    });
  }
  
// Time Slot Conflict Checker
  function checkTimeSlotConflict(timeSlot) {
    const saved = JSON.parse(localStorage.getItem("comicConSessions")) || [];
  
    return saved.some(session => session.timeSlot === timeSlot);
  }
  
// Form Validation + Save to localStorage  (index.html)
  function initFormPage() {
    const form = document.getElementById("sessionForm");
    if (!form) return;
  
    form.addEventListener("submit", e => {
      e.preventDefault();
  
      const attendeeName = document.getElementById("attendeeName").value.trim();
      const email = document.getElementById("email").value.trim();
      const sessionTitle = document.getElementById("sessionTitle").value;
      const timeSlot = document.getElementById("timeSlot").value;
      const fandomCategory = document.getElementById("fandomCategory").value;
      const cosplayNotes = document.getElementById("cosplayNotes").value.trim();
  
      // Validation
      if (!attendeeName || !email || !sessionTitle || !timeSlot || !fandomCategory) {
        alert("Please fill in all required fields.");
        return;
      }
  
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Invalid email format.");
        return;
      }
  
      // Check for time slot conflict
      if (checkTimeSlotConflict(timeSlot)) {
        const proceed = confirm(
          `⚠ WARNING ⚠\nYou already have a session scheduled at ${timeSlot}.\n\nDo you want to continue anyway?`
        );
        if (!proceed) return;
      }
  
      // Save
      const stored = JSON.parse(localStorage.getItem("comicConSessions")) || [];
  
      stored.push({
        attendeeName,
        email,
        sessionTitle,
        timeSlot,
        fandomCategory,
        cosplayNotes
      });
  
      localStorage.setItem("comicConSessions", JSON.stringify(stored));
  
      window.location.href = "schedule.html";
    });
  }
  
// Schedule Page: Load + Highlight Conflicts
  function loadSchedule() {
    const tableBody = document.querySelector("#scheduleTable tbody");
    const totalFooter = document.getElementById("totalSessions");
    if (!tableBody || !totalFooter) return;
  
    const sessions = JSON.parse(localStorage.getItem("comicConSessions")) || [];
    tableBody.innerHTML = "";
  
    // Count time slot frequencies for conflict highlighting
    const slotCounts = {};
    sessions.forEach(s => {
      slotCounts[s.timeSlot] = (slotCounts[s.timeSlot] || 0) + 1;
    });
  
    sessions.forEach((s, index) => {
      const tr = document.createElement("tr");
  
      // Highlight if time slot used more than once
      if (slotCounts[s.timeSlot] > 1) {
        tr.classList.add("conflict-row");
      }
  
      tr.innerHTML = `
        <td>${s.timeSlot}</td>
        <td>${s.sessionTitle}</td>
        <td>${s.fandomCategory}</td>
        <td>${s.cosplayNotes}</td>
        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
      `;
  
      tableBody.appendChild(tr);
    });
  
    totalFooter.textContent = `Total Sessions: ${sessions.length}`;
  }
  
// Delete, Sort, Clear
  function initScheduleInteractions() {
    const table = document.getElementById("scheduleTable");
    const sortButton = document.getElementById("sortButton");
    const clearButton = document.getElementById("clearButton");
    if (!table) return;
  
    // Delete
    table.addEventListener("click", e => {
      if (e.target.classList.contains("delete-btn")) {
        const index = e.target.dataset.index;
        const sessions = JSON.parse(localStorage.getItem("comicConSessions")) || [];
        sessions.splice(index, 1);
        localStorage.setItem("comicConSessions", JSON.stringify(sessions));
        loadSchedule();
      }
    });
  
    // Sort
    if (sortButton) {
      sortButton.addEventListener("click", () => {
        const sessions = JSON.parse(localStorage.getItem("comicConSessions")) || [];
        const order = { "9 AM": 1, "11 AM": 2, "1 PM": 3, "3 PM": 4, "5 PM": 5 };
        sessions.sort((a, b) => order[a.timeSlot] - order[b.timeSlot]);
        localStorage.setItem("comicConSessions", JSON.stringify(sessions));
        loadSchedule();
      });
    }
  
    // Clear All
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        if (confirm("Clear all schedule data?")) {
          localStorage.removeItem("comicConSessions");
          loadSchedule();
        }
      });
    }
  }
  

// Initialize Everything
  document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    populateSessionDropdown();
    initFormPage();
    loadSchedule();
    initScheduleInteractions();
  });
  