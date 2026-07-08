// State Management
let employees = [];
let meetings = [];
let activeUser = null;
let selectedView = 'week'; // 'week', 'day'
let currentDate = new Date(2026, 6, 8); // Baseline start at July 8, 2026
let selectedEmployeeFilter = 'all';
let selectedGeneralFilter = 'all'; // 'all', 'my'
let uploadedAvatarBase64 = null;
let editProfileAvatarBase64 = null;
let transitionDirection = null;
let hideTooltipTimeout = null;

// Consts
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 20;
const TOTAL_MINUTES = (WORK_END_HOUR - WORK_START_HOUR) * 60; // 720 minutes
const HOUR_HEIGHT = 76; // matches --hour-row-height in CSS

// Elements
const elActiveUserName = document.getElementById('active-user-name');
const elActiveUserRole = document.getElementById('active-user-role');
const elActiveUserAvatar = document.getElementById('active-user-avatar');
const elBtnSwitchUser = document.getElementById('btn-switch-user');
const elBtnEditUser = document.getElementById('btn-edit-user');

const elFilterAll = document.getElementById('filter-all');
const elFilterMy = document.getElementById('filter-my');
const elSelectFilterEmployee = document.getElementById('select-filter-employee');
const elSidebarEmployeeList = document.getElementById('sidebar-employee-list');
const elEmployeeSearch = document.getElementById('employee-search');

const elViewWeek = document.getElementById('view-week');
const elViewDay = document.getElementById('view-day');

const elBtnPrevDate = document.getElementById('btn-prev-date');
const elBtnNextDate = document.getElementById('btn-next-date');
const elBtnToday = document.getElementById('btn-today');
const elDateDisplay = document.getElementById('date-display');

const elBtnNewMeeting = document.getElementById('btn-new-meeting');
const elBtnAddEmployee = document.getElementById('btn-add-employee');
const elBtnThemeToggle = document.getElementById('btn-theme-toggle');

// Viewports
const elWeekView = document.getElementById('week-view');
const elDayView = document.getElementById('day-view');
const elUpcomingTickerContainer = document.getElementById('upcoming-ticker-container');
const elTickerRow = document.getElementById('ticker-row');

// Modals
const elUserSwitchModal = document.getElementById('user-switch-modal');
const elModalUserList = document.getElementById('modal-user-list');
const elBtnShowCreateUser = document.getElementById('btn-show-create-user');

const elEmployeeCreateModal = document.getElementById('employee-create-modal');
const elCreateUserForm = document.getElementById('create-user-form');
const elNewEmpName = document.getElementById('new-emp-name');
const elNewEmpPosition = document.getElementById('new-emp-position');
const elNewEmpAvatarFile = document.getElementById('new-emp-avatar-file');
const elAvatarPreviewBox = document.getElementById('avatar-preview-box');
const elBtnTriggerUpload = document.getElementById('btn-trigger-upload');
const elBtnCloseCreateUser = document.getElementById('btn-close-create-user');
const elBtnCancelCreateUser = document.getElementById('btn-cancel-create-user');

const elProfileEditModal = document.getElementById('profile-edit-modal');
const elEditProfileForm = document.getElementById('edit-profile-form');
const elEditProfileName = document.getElementById('edit-profile-name');
const elEditProfilePosition = document.getElementById('edit-profile-position');
const elEditProfileAvatarPreview = document.getElementById('edit-profile-avatar-preview');
const elEditProfileAvatarFile = document.getElementById('edit-profile-avatar-file');
const elBtnEditProfileTriggerUpload = document.getElementById('btn-edit-profile-trigger-upload');
const elBtnEditProfileRemoveAvatar = document.getElementById('btn-edit-profile-remove-avatar');
const elBtnCloseEditProfile = document.getElementById('btn-close-edit-profile');
const elBtnCancelEditProfile = document.getElementById('btn-cancel-edit-profile');

const elBookingModal = document.getElementById('booking-modal');
const elBookingForm = document.getElementById('booking-form');
const elModalOrganizerName = document.getElementById('modal-organizer-name');
const elMeetTitle = document.getElementById('meet-title');
const elMeetDate = document.getElementById('meet-date');
const elMeetStart = document.getElementById('meet-start');
const elMeetEnd = document.getElementById('meet-end');
const elParticipantSearchInput = document.getElementById('participant-search-input');
const elModalParticipantsList = document.getElementById('modal-participants-list');
const elMeetDescription = document.getElementById('meet-description');
const elBookingErrorBanner = document.getElementById('booking-error-banner');
const elBookingErrorText = document.getElementById('booking-error-text');
const elBtnCloseBooking = document.getElementById('btn-close-booking');
const elBtnCancelBooking = document.getElementById('btn-cancel-booking');

// Tooltip
const elMeetingTooltip = document.getElementById('meeting-tooltip');
const elBtnDeleteMeetingTooltip = document.getElementById('btn-delete-meeting-tooltip');
let activeTooltipMeetingId = null;

// Toast Container
const elToastContainer = document.getElementById('toast-container');

// Settings & Zoom state
let selectedStyle = localStorage.getItem('orbit_plan_style') || 'default-glass';
let selectedColor = localStorage.getItem('orbit_plan_color') || 'default';
let selectedAnimation = localStorage.getItem('orbit_plan_animation') || 'slide';
let currentZoom = parseInt(localStorage.getItem('orbit_plan_zoom')) || 76;

// Notifications state
let notifications = JSON.parse(localStorage.getItem('orbit_plan_notifications') || '[]');
let knownMeetingIds = new Set();
let isFirstProfileCreation = false;
let isModalFirstRender = false;

// Settings, Zoom & Confirm Elements
const elBtnSettingsToggle = document.getElementById('btn-settings-toggle');
const elSettingsModal = document.getElementById('settings-modal');
const elBtnCloseSettings = document.getElementById('btn-close-settings');
const elConfirmModal = document.getElementById('confirm-modal');
const elBtnConfirmCancel = document.getElementById('btn-confirm-cancel');
const elBtnConfirmDelete = document.getElementById('btn-confirm-delete');

// Notifications & Zoom elements
const elBtnNotificationsToggle = document.getElementById('btn-notifications-toggle');
const elNotificationsBadge = document.getElementById('notifications-badge');
const elNotificationsPopover = document.getElementById('notifications-popover');
const elNotificationsList = document.getElementById('notifications-list');
const elBtnClearNotifications = document.getElementById('btn-clear-notifications');
const elBtnZoomIn = document.getElementById('btn-zoom-in');
const elBtnZoomOut = document.getElementById('btn-zoom-out');

// Localization helpers
const monthsRu = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const monthsRuGenitive = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];
const daysRu = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const daysRuShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// Helper to format Date
function formatDateISO(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Convert HH:MM to minutes
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Convert minutes to HH:MM
function minutesToTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// Get initials
function getInitials(name) {
  return name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Set up avatar image or initials
function renderAvatar(emp, el) {
  el.innerHTML = '';
  if (emp.avatar) {
    const img = document.createElement('img');
    img.src = emp.avatar;
    img.alt = emp.name;
    el.appendChild(img);
    el.style.background = 'none';
  } else {
    el.textContent = getInitials(emp.name);
    el.style.background = emp.avatarColor || '#71717a';
  }
}

// Initialize
async function init() {
  // Theme Setup
  const savedTheme = localStorage.getItem('orbit_plan_theme') || 'dark-theme';
  document.body.className = savedTheme;
  
  // Style and color config setup
  applyStyleClass(selectedStyle);
  applyAnimationClass(selectedAnimation);
  const isGrad = selectedColor.includes('gradient');
  applyColor(selectedColor, isGrad);
  
  // Apply zoom setting
  applyZoom(currentZoom);

  await fetchData();
  
  // Seed known meeting IDs to prevent double notifications on startup
  knownMeetingIds = new Set(meetings.map(m => m.id));

  setupTimeOptions();
  setupEventListeners();
  setupGestureNavigation();
  checkUserSession();
  renderNotifications();
  renderAll();

  // Tick the upcoming meetings every 10 seconds for real-time glow states
  setInterval(renderUpcomingTicker, 10000);
  
  // Real-time updates: Poll new meetings from the server every 5 seconds
  setInterval(pollUpdates, 5000);
}

// Fetch
async function fetchData() {
  try {
    const [empRes, meetRes] = await Promise.all([
      fetch('/api/employees'),
      fetch('/api/meetings')
    ]);
    
    if (empRes.ok && meetRes.ok) {
      employees = await empRes.json();
      meetings = await meetRes.json();
    } else {
      showToast('Ошибка при загрузке данных', 'error');
    }
  } catch (error) {
    console.error(error);
    showToast('Ошибка связи с сервером', 'error');
  }
}

// Select options
function setupTimeOptions() {
  elMeetStart.innerHTML = '';
  elMeetEnd.innerHTML = '';
  for (let m = WORK_START_HOUR * 60; m <= WORK_END_HOUR * 60; m += 30) {
    const timeStr = minutesToTime(m);
    if (m < WORK_END_HOUR * 60) {
      const optStart = document.createElement('option');
      optStart.value = timeStr;
      optStart.textContent = timeStr;
      elMeetStart.appendChild(optStart);
    }
    if (m > WORK_START_HOUR * 60) {
      const optEnd = document.createElement('option');
      optEnd.value = timeStr;
      optEnd.textContent = timeStr;
      elMeetEnd.appendChild(optEnd);
    }
  }
  elMeetStart.value = '10:00';
  elMeetEnd.value = '11:00';
}

// User session
function checkUserSession() {
  if (employees.length === 0) {
    // Empty database - Welcome user and force creation of the first profile!
    isFirstProfileCreation = true;
    
    // Hide close/cancel options so they must complete profile setup
    const btnClose = document.getElementById('btn-close-create-user');
    const btnCancel = document.getElementById('btn-cancel-create-user');
    if (btnClose) btnClose.style.display = 'none';
    if (btnCancel) btnCancel.style.display = 'none';
    
    const titleEl = document.getElementById('add-employee-title');
    if (titleEl) titleEl.textContent = 'Создание первого профиля';
    
    elNewEmpName.value = '';
    elNewEmpPosition.value = '';
    elNewEmpAvatarFile.value = '';
    elAvatarPreviewBox.innerHTML = '<i data-lucide="camera"></i>';
    elAvatarPreviewBox.style.border = '2px dashed var(--text-muted)';
    uploadedAvatarBase64 = null;
    
    elEmployeeCreateModal.classList.add('open');
    lucide.createIcons();
    return;
  }

  const savedUserId = localStorage.getItem('orbit_plan_active_user_id');
  const user = employees.find(e => e.id === savedUserId);
  if (user) {
    setActiveUser(user);
  } else {
    openUserSwitchModal(false);
  }
}

function setActiveUser(user) {
  activeUser = user;
  localStorage.setItem('orbit_plan_active_user_id', user.id);
  
  elActiveUserName.textContent = user.name;
  elActiveUserRole.textContent = user.position || 'Сотрудник';
  renderAvatar(user, elActiveUserAvatar);
  
  // Check notifications for the new active user
  checkNewMeetingNotifications();
  
  renderAll();
  showToast(`Вход выполнен: ${user.name}`, 'info');
}

function openUserSwitchModal(allowClose = true) {
  elModalUserList.innerHTML = '';
  employees.forEach(emp => {
    const item = document.createElement('div');
    item.className = `user-select-item ${activeUser && activeUser.id === emp.id ? 'active' : ''}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'user-avatar';
    renderAvatar(emp, avatar);
    
    const info = document.createElement('div');
    info.className = 'employee-item-info';
    
    const name = document.createElement('h4');
    name.textContent = emp.name;
    
    const role = document.createElement('p');
    role.textContent = emp.position || 'Сотрудник';
    
    info.appendChild(name);
    info.appendChild(role);
    
    item.appendChild(avatar);
    item.appendChild(info);
    
    item.addEventListener('click', () => {
      setActiveUser(emp);
      elUserSwitchModal.classList.remove('open');
    });
    
    elModalUserList.appendChild(item);
  });
  
  elUserSwitchModal.classList.add('open');
  if (allowClose) {
    elUserSwitchModal.onclick = (e) => {
      if (e.target === elUserSwitchModal) {
        elUserSwitchModal.classList.remove('open');
      }
    };
  } else {
    elUserSwitchModal.onclick = null;
  }
  lucide.createIcons();
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let iconName = 'check';
  if (type === 'error') iconName = 'alert-circle';
  if (type === 'info') iconName = 'info';
  
  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <div class="toast-message">${message}</div>
  `;
  elToastContainer.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

function renderAll() {
  renderEmployeeFilters();
  renderSidebarEmployeeList();
  renderDateNavigation();
  renderUpcomingTicker();
  
  if (selectedView === 'week') {
    elWeekView.style.display = 'grid';
    elDayView.style.display = 'none';
    renderWeekView();
  } else if (selectedView === 'day') {
    elWeekView.style.display = 'none';
    elDayView.style.display = 'grid';
    renderDayView();
  }
  applyGridAnimation();
  lucide.createIcons();
}

function applyGridAnimation() {
  const targets = [];
  if (selectedView === 'week') {
    targets.push(document.getElementById('week-grid-columns'));
    targets.push(document.getElementById('week-grid-headers'));
  } else {
    targets.push(document.getElementById('day-grid-columns'));
    targets.push(document.getElementById('day-view-header'));
  }
  
  if (transitionDirection) {
    const dir = transitionDirection;
    const animClass = `anim-${selectedAnimation}-${dir === 'left' ? 'left' : 'right'}`;
    
    targets.forEach(target => {
      if (!target) return;
      // Remove any existing animation classes
      target.className = target.className.replace(/\banim-\S+/g, '').replace('slide-from-left', '').replace('slide-from-right', '');
      void target.offsetWidth; // force reflow
    });
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        targets.forEach(target => {
          if (!target) return;
          target.classList.add(animClass);
        });
      });
    });
    
    transitionDirection = null; // reset
  } else {
    targets.forEach(target => {
      if (target) {
        target.className = target.className.replace(/\banim-\S+/g, '').replace('slide-from-left', '').replace('slide-from-right', '');
      }
    });
  }
}

let lastScrollTime = 0;
const SCROLL_DEBOUNCE = 600; // ms

function setupGestureNavigation() {
  const viewport = document.getElementById('calendar-viewport');
  if (!viewport) return;
  
  // Trackpad horizontal scroll and pinch-to-zoom (wheel event)
  viewport.addEventListener('wheel', (e) => {
    // Zooming: Pinch-to-zoom on trackpad or Ctrl + Mouse Scroll
    if (e.ctrlKey) {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime < 90) return; // Responsive but smooth
      lastScrollTime = now;
      
      const zoomStep = 4;
      if (e.deltaY < 0) {
        // Zoom In
        transitionDirection = 'left';
        applyZoom(currentZoom + zoomStep);
        applyGridAnimation();
      } else if (e.deltaY > 0) {
        // Zoom Out
        transitionDirection = 'right';
        applyZoom(currentZoom - zoomStep);
        applyGridAnimation();
      }
      return;
    }

    // Only detect horizontal scrolling
    if (Math.abs(e.deltaX) > 30) {
      e.preventDefault(); // prevent native scroll
      const now = Date.now();
      if (now - lastScrollTime < SCROLL_DEBOUNCE) return;
      lastScrollTime = now;
      
      if (e.deltaX > 0) {
        // Scroll right -> Go Next day/week
        navigateDate('right');
      } else {
        // Scroll left -> Go Prev day/week
        navigateDate('left');
      }
    }
  }, { passive: false });
  
  // Touch Swipe gestures
  let touchStartX = 0;
  let touchStartY = 0;
  
  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  viewport.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Only trigger if horizontal swipe is dominant and significant
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 30) {
      if (diffX < 0) {
        // Swipe left -> Next day/week
        navigateDate('right');
      } else {
        // Swipe right -> Prev day/week
        navigateDate('left');
      }
    }
  }, { passive: true });
}

function navigateDate(direction) {
  transitionDirection = direction;
  if (selectedView === 'week') {
    currentDate.setDate(currentDate.getDate() + (direction === 'right' ? 7 : -7));
  } else {
    currentDate.setDate(currentDate.getDate() + (direction === 'right' ? 1 : -1));
  }
  renderAll();
}

function renderEmployeeFilters() {
  const val = elSelectFilterEmployee.value;
  elSelectFilterEmployee.innerHTML = '<option value="all">Все коллеги</option>';
  employees.forEach(emp => {
    const opt = document.createElement('option');
    opt.value = emp.id;
    opt.textContent = emp.name;
    elSelectFilterEmployee.appendChild(opt);
  });
  elSelectFilterEmployee.value = val || 'all';
}

function renderSidebarEmployeeList() {
  elSidebarEmployeeList.innerHTML = '';
  const searchVal = elEmployeeSearch.value.trim().toLowerCase();
  
  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchVal) || 
    (emp.position && emp.position.toLowerCase().includes(searchVal))
  );
  
  if (filtered.length === 0) {
    elSidebarEmployeeList.innerHTML = '<li class="empty-feed" style="padding: 12px; font-size: 0.9rem;">Никого не найдено</li>';
    return;
  }
  
  filtered.forEach(emp => {
    const li = document.createElement('li');
    li.className = 'employee-item';
    if (selectedEmployeeFilter === emp.id) {
      li.classList.add('active');
    }
    
    const avatar = document.createElement('div');
    avatar.className = 'employee-item-avatar';
    renderAvatar(emp, avatar);
    
    const info = document.createElement('div');
    info.className = 'employee-item-info';
    
    const name = document.createElement('div');
    name.className = 'employee-item-name';
    name.textContent = emp.name;
    
    const role = document.createElement('div');
    role.className = 'employee-item-role';
    role.textContent = emp.position || 'Сотрудник';
    
    info.appendChild(name);
    info.appendChild(role);
    
    li.appendChild(avatar);
    li.appendChild(info);
    
    li.addEventListener('click', () => {
      if (selectedEmployeeFilter === emp.id) {
        selectedEmployeeFilter = 'all';
        elSelectFilterEmployee.value = 'all';
      } else {
        selectedEmployeeFilter = emp.id;
        elSelectFilterEmployee.value = emp.id;
      }
      renderAll();
    });
    
    elSidebarEmployeeList.appendChild(li);
  });
}

function renderDateNavigation() {
  if (selectedView === 'week') {
    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startMonth = monthsRu[startOfWeek.getMonth()];
    const endMonth = monthsRu[endOfWeek.getMonth()];
    
    if (startMonth === endMonth) {
      elDateDisplay.textContent = `${startMonth} ${startOfWeek.getFullYear()}`;
    } else {
      elDateDisplay.textContent = `${startOfWeek.getDate()} ${monthsRuGenitive[startOfWeek.getMonth()]} — ${endOfWeek.getDate()} ${monthsRuGenitive[endOfWeek.getMonth()]}`;
    }
  } else {
    const dayName = daysRu[currentDate.getDay()];
    const monthName = monthsRuGenitive[currentDate.getMonth()];
    elDateDisplay.textContent = `${currentDate.getDate()} ${monthName} ${currentDate.getFullYear()}`;
  }
}

function getStartOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function getFilteredMeetings() {
  return meetings.filter(meet => {
    if (selectedGeneralFilter === 'my' && activeUser) {
      const isOrganizer = meet.organizerId === activeUser.id;
      const isParticipant = meet.participantIds.includes(activeUser.id);
      if (!isOrganizer && !isParticipant) return false;
    }
    if (selectedEmployeeFilter !== 'all') {
      const isOrganizer = meet.organizerId === selectedEmployeeFilter;
      const isParticipant = meet.participantIds.includes(selectedEmployeeFilter);
      if (!isOrganizer && !isParticipant) return false;
    }
    return true;
  });
}

// Render compact horizontal ticker cards showing Title + Time on top line and all participant avatars on bottom.
// Current logged in user's avatar lights up with glowing green border and dot indicator.
function renderUpcomingTicker() {
  elTickerRow.innerHTML = '';
  
  const filtered = getFilteredMeetings();
  if (filtered.length === 0) {
    elTickerRow.innerHTML = '<div class="ticker-empty">Нет предстоящих встреч</div>';
    return;
  }

  const now = new Date();
  
  // Construct dates
  const mapped = filtered.map(meet => {
    const meetStart = new Date(`${meet.date}T${meet.startTime}:00`);
    const meetEnd = new Date(`${meet.date}T${meet.endTime}:00`);
    return { meet, start: meetStart, end: meetEnd };
  });

  // Filter out ended meetings
  const activeOrFuture = mapped.filter(item => now < item.end);

  if (activeOrFuture.length === 0) {
    elTickerRow.innerHTML = '<div class="ticker-empty">Нет предстоящих встреч на сегодня</div>';
    return;
  }

  // Sort: active first, then closest start times
  activeOrFuture.sort((a, b) => {
    const aActive = now >= a.start && now <= a.end;
    const bActive = now >= b.start && now <= b.end;
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return a.start - b.start;
  });

  activeOrFuture.forEach(({ meet, start, end }) => {
    const card = document.createElement('div');
    card.className = 'ticker-card';
    
    // Status glow triggers
    const isActive = now >= start && now <= end;
    const diffMins = (start - now) / 60000;
    const isStartingSoon = !isActive && diffMins > 0 && diffMins <= 5;
    
    if (isActive) {
      card.classList.add('active-now');
    } else if (isStartingSoon) {
      card.classList.add('starting-soon');
    }

    // Time label formatting
    const todayStr = formatDateISO(now);
    let timeLabel = meet.startTime;
    if (meet.date !== todayStr) {
      const d = new Date(meet.date);
      timeLabel = `${d.getDate()} ${monthsRuGenitive[d.getMonth()].slice(0, 3)}, ${meet.startTime}`;
    }

    // 1. Top row container (Title & Time inline)
    const topRow = document.createElement('div');
    topRow.className = 'ticker-card-top';

    const title = document.createElement('div');
    title.className = 'ticker-meet-title';
    title.textContent = meet.title;

    const time = document.createElement('div');
    time.className = 'ticker-meet-time';
    time.textContent = isActive ? 'ИДЕТ СЕЙЧАС' : timeLabel;

    topRow.appendChild(title);
    topRow.appendChild(time);

    // 2. Bottom avatars container (Grid of all participants)
    const avatars = document.createElement('div');
    avatars.className = 'ticker-card-avatars';

    const involvedIds = [...new Set([meet.organizerId, ...meet.participantIds])];

    involvedIds.forEach(pId => {
      const emp = employees.find(e => e.id === pId);
      if (emp) {
        const av = document.createElement('div');
        av.className = 'ticker-card-avatar';
        
        // Green highlight reminder if this is the active user
        if (activeUser && emp.id === activeUser.id) {
          av.classList.add('is-current-user-avatar');
        }

        renderAvatar(emp, av);
        av.title = emp.name;
        avatars.appendChild(av);
      }
    });

    card.appendChild(topRow);
    card.appendChild(avatars);

    // Hover details card pops up menu showing full FИО and description
    bindHoverTooltip(card, meet);

    elTickerRow.appendChild(card);
  });
}

function renderWeekView() {
  const elGridHeaders = document.getElementById('week-grid-headers');
  const elTimeLabels = document.getElementById('week-time-labels');
  const elGridColumns = document.getElementById('week-grid-columns');
  
  elGridHeaders.innerHTML = '';
  elTimeLabels.innerHTML = '';
  elGridColumns.innerHTML = '';
  
  const startOfWeek = getStartOfWeek(currentDate);
  const filtered = getFilteredMeetings();
  
  // Headers & Columns
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    const dayStr = formatDateISO(dayDate);
    const todayStr = formatDateISO(new Date());
    const isToday = dayStr === todayStr;
    
    const header = document.createElement('div');
    header.className = `day-header ${isToday ? 'active-day' : ''}`;
    header.innerHTML = `
      <span class="day-name">${daysRuShort[dayDate.getDay()]}</span>
      <span class="day-num">${dayDate.getDate()}</span>
    `;
    elGridHeaders.appendChild(header);
    
    const col = document.createElement('div');
    col.className = 'grid-column';
    col.dataset.date = dayStr;
    
    col.addEventListener('click', (e) => {
      if (e.target.closest('.meeting-card')) return;
      const rect = col.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickedMinutes = WORK_START_HOUR * 60 + (clickY / (HOUR_HEIGHT * 12)) * TOTAL_MINUTES;
      const roundedMinutes = Math.max(
        WORK_START_HOUR * 60,
        Math.min((WORK_END_HOUR - 0.5) * 60, Math.round(clickedMinutes / 30) * 30)
      );
      openBookingModal(dayStr, minutesToTime(roundedMinutes), minutesToTime(roundedMinutes + 60));
    });
    elGridColumns.appendChild(col);
  }
  
  // Labels
  for (let h = WORK_START_HOUR; h <= WORK_END_HOUR; h++) {
    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = `${String(h).padStart(2, '0')}:00`;
    elTimeLabels.appendChild(label);
  }
  
  // Cards
  filtered.forEach(meet => {
    const col = elGridColumns.querySelector(`[data-date="${meet.date}"]`);
    if (col) {
      col.appendChild(createMeetingCard(meet));
    }
  });
}

function renderDayView() {
  const elHeader = document.getElementById('day-view-header');
  const elTimeLabels = document.getElementById('day-time-labels');
  const elGridColumns = document.getElementById('day-grid-columns');
  
  elTimeLabels.innerHTML = '';
  elGridColumns.innerHTML = '';
  
  const activeDateStr = formatDateISO(currentDate);
  const isToday = formatDateISO(new Date()) === activeDateStr;
  
  elHeader.textContent = `${daysRu[currentDate.getDay()]}, ${currentDate.getDate()} ${monthsRuGenitive[currentDate.getMonth()]}`;
  elHeader.className = isToday ? 'day-header active-day' : 'day-header';
  
  const col = document.createElement('div');
  col.className = 'grid-column';
  col.dataset.date = activeDateStr;
  
  col.addEventListener('click', (e) => {
    if (e.target.closest('.meeting-card')) return;
    const rect = col.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickedMinutes = WORK_START_HOUR * 60 + (clickY / (HOUR_HEIGHT * 12)) * TOTAL_MINUTES;
    const roundedMinutes = Math.max(
      WORK_START_HOUR * 60,
      Math.min((WORK_END_HOUR - 0.5) * 60, Math.round(clickedMinutes / 30) * 30)
    );
    openBookingModal(activeDateStr, minutesToTime(roundedMinutes), minutesToTime(roundedMinutes + 60));
  });
  elGridColumns.appendChild(col);
  
  for (let h = WORK_START_HOUR; h <= WORK_END_HOUR; h++) {
    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = `${String(h).padStart(2, '0')}:00`;
    elTimeLabels.appendChild(label);
  }
  
  getFilteredMeetings().forEach(meet => {
    if (meet.date === activeDateStr) {
      col.appendChild(createMeetingCard(meet));
    }
  });
}

function createMeetingCard(meet) {
  const card = document.createElement('div');
  card.className = 'meeting-card';
  card.dataset.id = meet.id;
  
  if (activeUser) {
    if (meet.organizerId === activeUser.id) {
      card.classList.add('is-organizer');
    } else if (meet.participantIds.includes(activeUser.id)) {
      card.classList.add('is-participant');
    } else {
      card.classList.add('is-other');
    }
  }
  
  const startM = timeToMinutes(meet.startTime);
  const endM = timeToMinutes(meet.endTime);
  const calendarStartM = WORK_START_HOUR * 60;
  
  const visualStartM = Math.max(calendarStartM, Math.min(WORK_END_HOUR * 60, startM));
  const visualEndM = Math.max(calendarStartM, Math.min(WORK_END_HOUR * 60, endM));
  
  const topPercent = ((visualStartM - calendarStartM) / TOTAL_MINUTES) * 100;
  const heightPercent = ((visualEndM - visualStartM) / TOTAL_MINUTES) * 100;
  
  card.style.top = `${topPercent}%`;
  card.style.height = `${heightPercent}%`;

  const duration = endM - startM;
  if (duration <= 30) {
    card.classList.add('very-short-meeting');
  } else if (duration < 60) {
    card.classList.add('short-meeting');
  }
  
  const title = document.createElement('div');
  title.className = 'meeting-card-title';
  title.textContent = meet.title;
  
  const time = document.createElement('div');
  time.className = 'meeting-card-time';
  time.innerHTML = `<i data-lucide="clock"></i><span>${meet.startTime} - ${meet.endTime}</span>`;
  
  const avatars = document.createElement('div');
  avatars.className = 'meeting-card-avatars';
  
  const involvedIds = [...new Set([meet.organizerId, ...meet.participantIds])];

  involvedIds.slice(0, 4).forEach(pId => {
    const emp = employees.find(e => e.id === pId);
    if (emp) {
      const av = document.createElement('div');
      av.className = 'meeting-card-avatar';
      
      // Green highlight reminder if this is the active user
      if (activeUser && emp.id === activeUser.id) {
        av.classList.add('is-current-user-avatar');
      }

      renderAvatar(emp, av);
      av.title = emp.name;
      avatars.appendChild(av);
    }
  });
  
  if (involvedIds.length > 4) {
    const avPlus = document.createElement('div');
    avPlus.className = 'meeting-card-avatar';
    avPlus.style.background = '#4b5563';
    avPlus.textContent = `+${involvedIds.length - 4}`;
    avatars.appendChild(avPlus);
  }
  
  card.appendChild(title);
  card.appendChild(time);
  card.appendChild(avatars);
  
  // Hover details card pops up menu showing full FИО and description
  bindHoverTooltip(card, meet);
  
  return card;
}

function bindHoverTooltip(triggerElement, meet) {
  triggerElement.addEventListener('mouseenter', () => {
    if (hideTooltipTimeout) {
      clearTimeout(hideTooltipTimeout);
      hideTooltipTimeout = null;
    }
    showMeetingTooltip(meet, triggerElement);
  });

  triggerElement.addEventListener('mouseleave', () => {
    hideTooltipTimeout = setTimeout(() => {
      hideMeetingTooltip();
    }, 250);
  });
}

// Display polished tooltip showing full names (ФИО) and roles of participants
function showMeetingTooltip(meet, triggerElement) {
  if (hideTooltipTimeout) {
    clearTimeout(hideTooltipTimeout);
    hideTooltipTimeout = null;
  }
  activeTooltipMeetingId = meet.id;
  
  elMeetingTooltip.querySelector('.tooltip-title').textContent = meet.title;
  const d = new Date(meet.date);
  elMeetingTooltip.querySelector('.tooltip-time-text').textContent = `${meet.startTime} - ${meet.endTime}, ${d.getDate()} ${monthsRuGenitive[d.getMonth()]}`;
  
  const org = employees.find(e => e.id === meet.organizerId);
  elMeetingTooltip.querySelector('.tooltip-organizer span').textContent = org ? org.name : 'Неизвестно';
  elMeetingTooltip.querySelector('.tooltip-desc').textContent = meet.description || 'Описание отсутствует';
  
  // Render Full Names and Roles of Participants
  const listContainer = elMeetingTooltip.querySelector('#tooltip-participants-list');
  listContainer.innerHTML = '';

  const involvedIds = [...new Set([meet.organizerId, ...meet.participantIds])];

  involvedIds.forEach(pId => {
    const emp = employees.find(e => e.id === pId);
    if (emp) {
      const li = document.createElement('li');
      li.className = 'tooltip-participant-item';

      const av = document.createElement('div');
      av.className = 'user-avatar';
      
      // Green highlight indicator for active user inside tooltip list too
      if (activeUser && emp.id === activeUser.id) {
        av.classList.add('is-current-user-avatar');
      }

      renderAvatar(emp, av);

      const info = document.createElement('div');
      info.className = 'tooltip-participant-info';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'tooltip-participant-name';
      nameSpan.textContent = emp.name + (pId === meet.organizerId ? ' (Орг.)' : '');

      const roleSpan = document.createElement('span');
      roleSpan.className = 'tooltip-participant-role';
      roleSpan.textContent = emp.position || 'Сотрудник';

      info.appendChild(nameSpan);
      info.appendChild(roleSpan);

      li.appendChild(av);
      li.appendChild(info);
      listContainer.appendChild(li);
    }
  });
  
  const deleteBtn = document.getElementById('btn-delete-meeting-tooltip');
  deleteBtn.style.display = (activeUser && meet.organizerId === activeUser.id) ? 'inline-flex' : 'none';
  
  // Open class first so browser compiles dimensions
  elMeetingTooltip.classList.add('open');
  lucide.createIcons();
  
  const tooltipHeight = elMeetingTooltip.offsetHeight || 340;
  const tooltipWidth = elMeetingTooltip.offsetWidth || 320;
  
  // Position fixed coordinates relative to trigger element
  const triggerRect = triggerElement.getBoundingClientRect();
  
  let left = triggerRect.right + 10;
  // If it goes beyond the screen edge, instead of jumping to the left of the card, we just fit it within the right edge!
  if (left + tooltipWidth > window.innerWidth) {
    left = window.innerWidth - tooltipWidth - 12;
  }
  // Ensure it never goes too far left off-screen
  if (left < 10) left = 10;
  
  let top = triggerRect.top;
  if (top + tooltipHeight > window.innerHeight) {
    top = window.innerHeight - tooltipHeight - 16;
  }
  if (top < 10) top = 10;
  
  elMeetingTooltip.style.left = `${left}px`;
  elMeetingTooltip.style.top = `${top}px`;
}

function hideMeetingTooltip() {
  elMeetingTooltip.classList.remove('open');
  activeTooltipMeetingId = null;
}

async function deleteMeeting(id) {
  try {
    const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Встреча успешно отменена', 'success');
      hideMeetingTooltip();
      await fetchData();
      renderAll();
    } else {
      const err = await res.json();
      showToast(err.error || 'Ошибка при отмене', 'error');
    }
  } catch (error) {
    console.error(error);
    showToast('Не удалось отменить встречу', 'error');
  }
}

// Color Accent, Style themes, zooming, notifications & transition animation helper functions
function applyZoom(zoomVal) {
  currentZoom = Math.max(36, Math.min(120, zoomVal));
  document.documentElement.style.setProperty('--hour-row-height', `${currentZoom}px`);
  localStorage.setItem('orbit_plan_zoom', currentZoom);
}

function renderNotifications() {
  if (!elNotificationsList) return;
  elNotificationsList.innerHTML = '';
  
  const unreadCount = notifications.filter(n => !n.read).length;
  if (unreadCount > 0) {
    elBtnNotificationsToggle.classList.add('has-unread-notifications');
    elNotificationsBadge.textContent = unreadCount;
  } else {
    elBtnNotificationsToggle.classList.remove('has-unread-notifications');
  }
  
  if (notifications.length === 0) {
    elNotificationsList.innerHTML = '<li class="empty-notifications">Нет новых уведомлений</li>';
    return;
  }
  
  notifications.slice().reverse().forEach(n => {
    const li = document.createElement('li');
    li.className = `popover-item ${n.read ? 'read' : 'unread'}`;
    
    const title = document.createElement('div');
    title.className = 'popover-item-title';
    title.textContent = n.title;
    
    const text = document.createElement('div');
    text.className = 'popover-item-text';
    text.textContent = n.text;
    
    const time = document.createElement('div');
    time.className = 'popover-item-time';
    time.textContent = n.time;
    
    li.appendChild(title);
    li.appendChild(text);
    li.appendChild(time);
    elNotificationsList.appendChild(li);
  });
}

function addNotification(title, text) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const n = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title,
    text,
    time: timeStr,
    read: false
  };
  
  notifications.push(n);
  if (notifications.length > 30) notifications.shift();
  localStorage.setItem('orbit_plan_notifications', JSON.stringify(notifications));
  renderNotifications();
  
  // Show high-end right-bottom notification panel
  showToastPopover(title, text);
}

function showToastPopover(title, text) {
  const card = document.createElement('div');
  card.className = 'custom-notif-toast';
  card.innerHTML = `
    <div class="custom-notif-toast-header">
      <i data-lucide="bell" style="width: 16px; height: 16px; color: var(--primary);"></i>
      <strong>${title}</strong>
      <button class="btn-close-toast"><i data-lucide="x" style="width: 12px; height: 12px;"></i></button>
    </div>
    <div class="custom-notif-toast-body">${text}</div>
  `;
  
  document.body.appendChild(card);
  lucide.createIcons();
  
  function updateToastPositions() {
    const activeToasts = Array.from(document.querySelectorAll('.custom-notif-toast'));
    let currentBottom = 24;
    activeToasts.forEach((toast) => {
      if (toast.classList.contains('show')) {
        toast.style.bottom = `${currentBottom}px`;
        const height = toast.offsetHeight || 86; // fallback height if layout is pending
        currentBottom += height + 12;
      }
    });
  }
  
  card.querySelector('.btn-close-toast').addEventListener('click', () => {
    card.classList.remove('show');
    updateToastPositions(); // Trigger other toasts to slide down immediately
    setTimeout(() => {
      card.remove();
      updateToastPositions();
    }, 300);
  });
  
  setTimeout(() => {
    card.classList.add('show');
    updateToastPositions();
  }, 50);
  
  setTimeout(() => {
    if (card.parentNode) {
      card.classList.remove('show');
      updateToastPositions(); // Trigger other toasts to slide down immediately
      setTimeout(() => {
        card.remove();
        updateToastPositions();
      }, 300);
    }
  }, 4000); // 4 seconds auto-dismiss
}

function checkNewMeetingNotifications() {
  if (!activeUser || !meetings.length) return;
  
  const storageKey = `orbit_plan_notified_meetings_${activeUser.id}`;
  let notifiedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
  let notifiedSet = new Set(notifiedIds);
  let updated = false;
  
  meetings.forEach(meet => {
    // Only notify if user is a participant but NOT organizer
    if (meet.participantIds.includes(activeUser.id) && meet.organizerId !== activeUser.id) {
      if (!notifiedSet.has(meet.id)) {
        // Only notify for today's or future meetings to avoid history spam
        const meetDateStr = meet.date; // YYYY-MM-DD
        const todayStr = formatDateISO(new Date());
        
        if (meetDateStr >= todayStr) {
          const orgEmp = employees.find(e => e.id === meet.organizerId);
          const orgName = orgEmp ? orgEmp.name : 'Коллега';
          addNotification(
            'Приглашение на встречу',
            `${orgName} добавил(а) вас на встречу «${meet.title}» в ${meet.startTime} (${meet.date})`
          );
        }
        
        notifiedSet.add(meet.id);
        updated = true;
      }
    } else {
      // If they are the organizer, or not a participant, mark it as "notified" silently so we don't alert them later
      if (!notifiedSet.has(meet.id)) {
        notifiedSet.add(meet.id);
        updated = true;
      }
    }
  });
  
  if (updated) {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(notifiedSet)));
  }
}

async function pollUpdates() {
  try {
    const res = await fetch('/api/meetings');
    if (res.ok) {
      const freshMeetings = await res.json();
      
      const beforeCount = meetings.length;
      if (beforeCount !== freshMeetings.length || JSON.stringify(freshMeetings) !== JSON.stringify(meetings)) {
        meetings = freshMeetings;
        renderAll();
      }
      
      checkNewMeetingNotifications();
    }
  } catch (err) {
    console.error("Polling updates error:", err);
  }
}

// Color Accent, Style themes & transition animation helper functions
function applyStyleClass(styleName) {
  document.body.className = document.body.className.replace(/\bstyle-\S+/g, '');
  document.body.classList.add(`style-${styleName}`);
  selectedStyle = styleName;
  localStorage.setItem('orbit_plan_style', styleName);
}

function applyAnimationClass(animName) {
  document.body.className = document.body.className.replace(/\banim-theme-\S+/g, '');
  document.body.classList.add(`anim-theme-${animName}`);
}

function applyColor(colorVal, isGradient) {
  if (isGradient) {
    document.body.style.setProperty('--primary-bg', colorVal);
    const match = colorVal.match(/#([0-9a-fA-F]{3,8})/);
    const baseColor = match ? match[0] : '#a855f7';
    document.body.style.setProperty('--primary', baseColor);
    document.body.style.setProperty('--primary-hover', baseColor);
    document.body.style.setProperty('--primary-glow', `rgba(168, 85, 247, 0.25)`);
  } else if (colorVal === 'default') {
    document.body.style.removeProperty('--primary');
    document.body.style.removeProperty('--primary-hover');
    document.body.style.removeProperty('--primary-glow');
    document.body.style.removeProperty('--primary-bg');
  } else {
    document.body.style.setProperty('--primary', colorVal);
    document.body.style.setProperty('--primary-hover', colorVal);
    document.body.style.setProperty('--primary-glow', `${colorVal}33`);
    document.body.style.setProperty('--primary-bg', colorVal);
  }
  selectedColor = colorVal;
  localStorage.setItem('orbit_plan_color', colorVal);
}

function renderSettingsOptions() {
  const stylesList = [
    { id: 'default-glass', name: 'Space Glass' },
    { id: 'synthwave', name: 'Retro Synthwave' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077' },
    { id: 'aurora', name: 'Aurora Mist' },
    { id: 'minimalist', name: 'Minimalist' },
    { id: 'emerald', name: 'Emerald Forest' },
    { id: 'rosegold', name: 'Rose Gold' },
    { id: 'obsidian', name: 'Obsidian' },
    { id: 'nebula', name: 'Nebula Dream' },
    { id: 'solar', name: 'Solar Flare' }
  ];
  
  const stylesGrid = document.getElementById('settings-styles-grid');
  stylesGrid.innerHTML = '';
  stylesList.forEach(st => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = st.name;
    if (selectedStyle === st.id) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      applyStyleClass(st.id);
      renderSettingsOptions();
    });
    stylesGrid.appendChild(btn);
  });

  const colorsList = [
    { id: 'default', name: 'Default', value: 'default', isGradient: false },
    { id: 'blue', name: 'Royal Blue', value: '#2563eb', isGradient: false },
    { id: 'teal', name: 'Teal', value: '#0d9488', isGradient: false },
    { id: 'emerald', name: 'Emerald', value: '#059669', isGradient: false },
    { id: 'orange', name: 'Orange', value: '#ea580c', isGradient: false },
    { id: 'pink', name: 'Pink', value: '#db2777', isGradient: false },
    { id: 'coral', name: 'Coral', value: '#f43f5e', isGradient: false },
    { id: 'grad-sunset', name: 'Sunset Pink', value: 'linear-gradient(135deg, #ec4899, #f97316)', isGradient: true },
    { id: 'grad-ocean', name: 'Ocean Blue', value: 'linear-gradient(135deg, #3b82f6, #14b8a6)', isGradient: true },
    { id: 'grad-cosmic', name: 'Cosmic Purple', value: 'linear-gradient(135deg, #6366f1, #8b5cf6)', isGradient: true },
    { id: 'grad-neon', name: 'Neon Cyber', value: 'linear-gradient(135deg, #a855f7, #06b6d4)', isGradient: true },
    { id: 'grad-golden', name: 'Golden Hours', value: 'linear-gradient(135deg, #f59e0b, #ef4444)', isGradient: true }
  ];

  const colorsGrid = document.getElementById('settings-colors-grid');
  colorsGrid.innerHTML = '';
  colorsList.forEach(cl => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.fontSize = '0.75rem';
    btn.style.padding = '8px';
    
    if (cl.isGradient) {
      btn.innerHTML = `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${cl.value};margin-right:4px;"></span>${cl.name}`;
    } else if (cl.value !== 'default') {
      btn.innerHTML = `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${cl.value};margin-right:4px;"></span>${cl.name}`;
    } else {
      btn.textContent = cl.name;
    }

    if (selectedColor === cl.value) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      applyColor(cl.value, cl.isGradient);
      renderSettingsOptions();
    });
    colorsGrid.appendChild(btn);
  });

  const animsList = [
    { id: 'slide', name: 'Slide (Сдвиг)' },
    { id: 'fade', name: 'Fade (Затухание)' },
    { id: 'zoom', name: 'Zoom (Масштаб)' },
    { id: 'flip', name: 'Flip (3D Поворот)' },
    { id: 'rotate', name: 'Rotate (Вращение)' },
    { id: 'bounce', name: 'Bounce (Пружина)' },
    { id: 'skew', name: 'Skew (Наклон)' },
    { id: 'wave', name: 'Wave (Волна)' },
    { id: 'elastic', name: 'Elastic Pop' },
    { id: 'glitch', name: 'Matrix Glitch' }
  ];

  const animsGrid = document.getElementById('settings-anims-grid');
  animsGrid.innerHTML = '';
  animsList.forEach(an => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = an.name;
    if (selectedAnimation === an.id) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      selectedAnimation = an.id;
      localStorage.setItem('orbit_plan_animation', an.id);
      applyAnimationClass(an.id);
      renderSettingsOptions();
    });
    animsGrid.appendChild(btn);
  });
}

function openBookingModal(dateStr = '', startTime = '', endTime = '') {
  if (!activeUser) {
    showToast('Сначала выберите профиль', 'error');
    openUserSwitchModal(false);
    return;
  }
  
  elModalOrganizerName.textContent = activeUser.name;
  elMeetTitle.value = '';
  elMeetDate.value = dateStr || formatDateISO(new Date());
  
  let startT = startTime;
  let endT = endTime;
  if (!startT || !endT) {
    const now = new Date();
    const currentHour = now.getHours();
    const nextH = Math.max(WORK_START_HOUR, Math.min(WORK_END_HOUR - 1, currentHour + 1));
    startT = `${nextH.toString().padStart(2, '0')}:00`;
    endT = `${(nextH + 1).toString().padStart(2, '0')}:00`;
  }
  
  elMeetStart.value = startT;
  elMeetEnd.value = endT;
  elMeetDescription.value = '';
  elBookingErrorBanner.style.display = 'none';
  elParticipantSearchInput.value = '';
  
  isModalFirstRender = true;
  renderModalParticipants();
  elBookingModal.classList.add('open');
  lucide.createIcons();
}

function renderModalParticipants() {
  const previouslyChecked = new Set(
    Array.from(elModalParticipantsList.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => cb.value)
  );
  if (isModalFirstRender && activeUser) {
    previouslyChecked.add(activeUser.id);
    isModalFirstRender = false;
  }

  elModalParticipantsList.innerHTML = '';
  const searchVal = elParticipantSearchInput.value.trim().toLowerCase();
  
  const meetDate = elMeetDate.value;
  const startT = elMeetStart.value;
  const endT = elMeetEnd.value;
  const busyEmployeeIds = getBusyEmployeesForSlot(meetDate, startT, endT);
  
  const filtered = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchVal) ||
    (emp.position && emp.position.toLowerCase().includes(searchVal))
  );
  
  filtered.forEach(emp => {
    const label = document.createElement('label');
    label.className = 'participant-checkbox-label';
    
    const leftDiv = document.createElement('div');
    leftDiv.className = 'checkbox-left';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = emp.id;
    if (previouslyChecked.has(emp.id)) {
      checkbox.checked = true;
    }
    
    // Custom Avatar inside booking modal list
    const avatarEl = document.createElement('div');
    avatarEl.className = 'participant-list-avatar';
    if (activeUser && emp.id === activeUser.id) {
      avatarEl.classList.add('is-current-user-avatar');
    }
    renderAvatar(emp, avatarEl);
    
    const details = document.createElement('div');
    details.className = 'emp-details';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'emp-name';
    nameSpan.textContent = emp.name;
    
    const roleSpan = document.createElement('span');
    roleSpan.className = 'emp-role';
    roleSpan.textContent = emp.position || 'Сотрудник';
    
    details.appendChild(nameSpan);
    details.appendChild(roleSpan);
    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(avatarEl);
    leftDiv.appendChild(details);
    label.appendChild(leftDiv);
    
    if (busyEmployeeIds.has(emp.id)) {
      const badge = document.createElement('span');
      badge.className = 'busy-indicator-badge';
      badge.innerHTML = '<i data-lucide="alert-triangle"></i> Занят';
      label.appendChild(badge);
    }
    
    checkbox.addEventListener('change', validateFormOverlapLive);
    elModalParticipantsList.appendChild(label);
  });
  lucide.createIcons();
}

function getBusyEmployeesForSlot(date, startTime, endTime) {
  const busy = new Set();
  if (!date || !startTime || !endTime) return busy;
  meetings.forEach(meet => {
    if (meet.date !== date) return;
    const overlap = startTime < meet.endTime && meet.startTime < endTime;
    if (overlap) {
      busy.add(meet.organizerId);
      meet.participantIds.forEach(pId => busy.add(pId));
    }
  });
  return busy;
}

function validateFormOverlapLive() {
  const dateVal = elMeetDate.value;
  const startVal = elMeetStart.value;
  const endVal = elMeetEnd.value;
  
  if (startVal >= endVal) {
    showBookingError('Время начала должно быть раньше окончания');
    return false;
  }
  
  const checkedIds = Array.from(
    elModalParticipantsList.querySelectorAll('input[type="checkbox"]:checked')
  ).map(cb => cb.value);
  
  const allInvolvedPeople = new Set(checkedIds);
  const busyPeople = getBusyEmployeesForSlot(dateVal, startVal, endVal);
  const conflictingEmployees = [...allInvolvedPeople].filter(pId => busyPeople.has(pId));
  
  if (conflictingEmployees.length > 0) {
    const names = conflictingEmployees.map(pId => {
      const emp = employees.find(e => e.id === pId);
      return emp ? emp.name : 'Сотрудник';
    });
    showBookingError(`Участники заняты в это время: ${names.join(', ')}`);
    return false;
  }
  
  elBookingErrorBanner.style.display = 'none';
  return true;
}

function showBookingError(msg) {
  elBookingErrorText.textContent = msg;
  elBookingErrorBanner.style.display = 'flex';
  lucide.createIcons();
}

// Edit Profile Modal Controllers
function openEditProfileModal() {
  if (!activeUser) {
    showToast('Сначала выберите профиль', 'error');
    openUserSwitchModal(false);
    return;
  }
  
  elEditProfileName.value = activeUser.name;
  elEditProfilePosition.value = activeUser.position || '';
  editProfileAvatarBase64 = activeUser.avatar;
  
  updateEditProfileAvatarPreview();
  elProfileEditModal.classList.add('open');
  lucide.createIcons();
}

function updateEditProfileAvatarPreview() {
  elEditProfileAvatarPreview.innerHTML = '';
  if (editProfileAvatarBase64) {
    const img = document.createElement('img');
    img.src = editProfileAvatarBase64;
    elEditProfileAvatarPreview.appendChild(img);
    elEditProfileAvatarPreview.style.border = 'none';
  } else {
    // Generate initials based on current text in name input field
    const nameText = elEditProfileName.value || activeUser.name || '?';
    elEditProfileAvatarPreview.textContent = getInitials(nameText);
    elEditProfileAvatarPreview.style.background = activeUser.avatarColor || '#71717a';
    elEditProfileAvatarPreview.style.border = '2px dashed var(--text-muted)';
  }
}

function setupEventListeners() {
  // Theme toggle action
  elBtnThemeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-theme')) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('orbit_plan_theme', 'light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('orbit_plan_theme', 'dark-theme');
    }
  });

  // View switchers
  elViewWeek.addEventListener('click', () => {
    elViewWeek.classList.add('active');
    elViewDay.classList.remove('active');
    selectedView = 'week';
    renderAll();
  });
  elViewDay.addEventListener('click', () => {
    elViewWeek.classList.remove('active');
    elViewDay.classList.add('active');
    selectedView = 'day';
    renderAll();
  });
  
  // Date navigation
  elBtnPrevDate.addEventListener('click', () => navigateDate('left'));
  elBtnNextDate.addEventListener('click', () => navigateDate('right'));
  elBtnToday.addEventListener('click', () => {
    const todayBase = new Date(2026, 6, 8);
    if (currentDate.getTime() !== todayBase.getTime()) {
      transitionDirection = currentDate > todayBase ? 'left' : 'right';
      currentDate = todayBase; // reset baseline
      renderAll();
    }
  });
  
  elBtnSwitchUser.addEventListener('click', () => openUserSwitchModal(true));
  elBtnEditUser.addEventListener('click', openEditProfileModal);

  elSelectFilterEmployee.addEventListener('change', () => {
    selectedEmployeeFilter = elSelectFilterEmployee.value;
    renderAll();
  });
  
  elEmployeeSearch.addEventListener('input', renderSidebarEmployeeList);
  
  elFilterAll.addEventListener('click', () => {
    elFilterAll.classList.add('active');
    elFilterMy.classList.remove('active');
    selectedGeneralFilter = 'all';
    renderAll();
  });
  elFilterMy.addEventListener('click', () => {
    elFilterAll.classList.remove('active');
    elFilterMy.classList.add('active');
    selectedGeneralFilter = 'my';
    renderAll();
  });
  
  elBtnNewMeeting.addEventListener('click', () => openBookingModal());
  elBtnAddEmployee.addEventListener('click', () => {
    elNewEmpName.value = '';
    elNewEmpPosition.value = '';
    elNewEmpAvatarFile.value = '';
    elAvatarPreviewBox.innerHTML = '<i data-lucide="camera"></i>';
    elAvatarPreviewBox.style.border = '2px dashed var(--text-muted)';
    uploadedAvatarBase64 = null;
    elEmployeeCreateModal.classList.add('open');
    lucide.createIcons();
  });
  
  elBtnCloseCreateUser.addEventListener('click', () => elEmployeeCreateModal.classList.remove('open'));
  elBtnCancelCreateUser.addEventListener('click', () => elEmployeeCreateModal.classList.remove('open'));
  
  elBtnCloseBooking.addEventListener('click', () => elBookingModal.classList.remove('open'));
  elBtnCancelBooking.addEventListener('click', () => elBookingModal.classList.remove('open'));
  
  // Close modals when clicking on the overlay backdrop
  [
    elEmployeeCreateModal,
    elBookingModal,
    elProfileEditModal,
    elUserSwitchModal
  ].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    }
  });

  // Hover grace period handling for the meeting details tooltip card
  elMeetingTooltip.addEventListener('mouseenter', () => {
    if (hideTooltipTimeout) {
      clearTimeout(hideTooltipTimeout);
      hideTooltipTimeout = null;
    }
  });

  elMeetingTooltip.addEventListener('mouseleave', () => {
    hideTooltipTimeout = setTimeout(() => {
      hideMeetingTooltip();
    }, 200);
  });

  // Close hover card instantly when scrolling the calendar viewport or window
  const viewport = document.getElementById('calendar-viewport');
  if (viewport) {
    viewport.addEventListener('scroll', () => {
      hideMeetingTooltip();
    }, { passive: true });
  }
  window.addEventListener('scroll', () => {
    hideMeetingTooltip();
  }, { passive: true });
  
  // Custom Avatar upload handlers for creating a user
  elBtnTriggerUpload.addEventListener('click', () => elNewEmpAvatarFile.click());
  elAvatarPreviewBox.addEventListener('click', () => elNewEmpAvatarFile.click());
  
  elNewEmpAvatarFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) {
        showToast('Файл слишком большой. Максимальный размер 2 МБ', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedAvatarBase64 = event.target.result;
        elAvatarPreviewBox.innerHTML = `<img src="${uploadedAvatarBase64}">`;
        elAvatarPreviewBox.style.border = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  // Create User Form Submit
  elCreateUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = elNewEmpName.value;
    const position = elNewEmpPosition.value;
    
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, position, avatar: uploadedAvatarBase64 })
      });
      
      if (res.ok) {
        const newEmp = await res.json();
        showToast(`Профиль сотрудника «${newEmp.name}» создан`, 'success');
        elEmployeeCreateModal.classList.remove('open');
        uploadedAvatarBase64 = null;
        
        // Restore standard states
        const btnClose = document.getElementById('btn-close-create-user');
        const btnCancel = document.getElementById('btn-cancel-create-user');
        if (btnClose) btnClose.style.display = 'inline-flex';
        if (btnCancel) btnCancel.style.display = 'inline-flex';
        const titleEl = document.getElementById('add-employee-title');
        if (titleEl) titleEl.textContent = 'Новый коллега';
        
        await fetchData();
        setActiveUser(newEmp);
        isFirstProfileCreation = false;
      } else {
        const err = await res.json();
        alert(err.error || 'Ошибка при создании сотрудника');
      }
    } catch (err) {
      console.error(err);
      showToast('Не удалось отправить запрос', 'error');
    }
  });

  // Edit Profile Actions
  elBtnCloseEditProfile.addEventListener('click', () => elProfileEditModal.classList.remove('open'));
  elBtnCancelEditProfile.addEventListener('click', () => elProfileEditModal.classList.remove('open'));
  
  elBtnEditProfileTriggerUpload.addEventListener('click', () => elEditProfileAvatarFile.click());
  elEditProfileAvatarPreview.addEventListener('click', () => elEditProfileAvatarFile.click());
  
  elEditProfileAvatarFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) {
        showToast('Файл слишком большой. Максимальный размер 2 МБ', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        editProfileAvatarBase64 = event.target.result;
        updateEditProfileAvatarPreview();
      };
      reader.readAsDataURL(file);
    }
  });
  
  elBtnEditProfileRemoveAvatar.addEventListener('click', () => {
    editProfileAvatarBase64 = null;
    updateEditProfileAvatarPreview();
  });
  
  elEditProfileName.addEventListener('input', () => {
    if (!editProfileAvatarBase64) {
      updateEditProfileAvatarPreview();
    }
  });

  elEditProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = elEditProfileName.value;
    const position = elEditProfilePosition.value;
    
    try {
      const res = await fetch(`/api/employees/${activeUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, position, avatar: editProfileAvatarBase64 })
      });
      
      if (res.ok) {
        const updatedEmp = await res.json();
        showToast('Профиль успешно обновлен', 'success');
        elProfileEditModal.classList.remove('open');
        
        await fetchData();
        setActiveUser(updatedEmp);
      } else {
        const err = await res.json();
        alert(err.error || 'Ошибка при обновлении профиля');
      }
    } catch (err) {
      console.error(err);
      showToast('Не удалось обновить профиль', 'error');
    }
  });
  
  elBtnShowCreateUser.addEventListener('click', () => {
    elUserSwitchModal.classList.remove('open');
    elNewEmpName.value = '';
    elNewEmpPosition.value = '';
    elNewEmpAvatarFile.value = '';
    elAvatarPreviewBox.innerHTML = '<i data-lucide="camera"></i>';
    elAvatarPreviewBox.style.border = '2px dashed var(--text-muted)';
    uploadedAvatarBase64 = null;
    elEmployeeCreateModal.classList.add('open');
    lucide.createIcons();
  });
  
  elMeetDate.addEventListener('change', () => {
    renderModalParticipants();
    validateFormOverlapLive();
  });
  elMeetStart.addEventListener('change', () => {
    const startM = timeToMinutes(elMeetStart.value);
    const endM = timeToMinutes(elMeetEnd.value);
    if (endM <= startM) {
      const newEndM = Math.min(WORK_END_HOUR * 60, startM + 60);
      elMeetEnd.value = minutesToTime(newEndM);
    }
    renderModalParticipants();
    validateFormOverlapLive();
  });
  elMeetEnd.addEventListener('change', () => {
    renderModalParticipants();
    validateFormOverlapLive();
  });
  
  elParticipantSearchInput.addEventListener('input', renderModalParticipants);
  
  // Booking Form Submit
  elBookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = elMeetTitle.value;
    const dateVal = elMeetDate.value;
    const startVal = elMeetStart.value;
    const endVal = elMeetEnd.value;
    const description = elMeetDescription.value;
    
    const participantIds = Array.from(
      elModalParticipantsList.querySelectorAll('input[type="checkbox"]:checked')
    ).map(cb => cb.value);
    

    // Validation visual feedback (glow, shake, placeholder red)
    let isValid = true;
    if (!title.trim()) {
      elMeetTitle.classList.add('invalid-field');
      elMeetTitle.placeholder = 'Пожалуйста, укажите тему встречи!';
      isValid = false;
    } else {
      elMeetTitle.classList.remove('invalid-field');
    }

    if (!dateVal) {
      elMeetDate.classList.add('invalid-field');
      isValid = false;
    } else {
      elMeetDate.classList.remove('invalid-field');
    }

    const selectorBox = document.querySelector('.participants-selector-box');
    if (participantIds.length === 0 || (participantIds.length === 1 && activeUser && participantIds[0] === activeUser.id)) {
      if (selectorBox) selectorBox.classList.add('invalid-field');
      showBookingError('Выберите хотя бы одного коллегу-участника');
      isValid = false;
    } else {
      if (selectorBox) selectorBox.classList.remove('invalid-field');
    }

    // Attach dynamic listeners to clean invalid state
    [elMeetTitle, elMeetDate].forEach(field => {
      field.addEventListener('input', () => field.classList.remove('invalid-field'), { once: true });
      field.addEventListener('change', () => field.classList.remove('invalid-field'), { once: true });
    });
    if (selectorBox) {
      elModalParticipantsList.addEventListener('change', () => selectorBox.classList.remove('invalid-field'), { once: true });
    }

    if (!isValid) return;
    if (!validateFormOverlapLive()) return;
    
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          organizerId: activeUser.id,
          participantIds,
          date: dateVal,
          startTime: startVal,
          endTime: endVal,
          description
        })
      });
      
      if (res.ok) {
        showToast('Встреча забронирована успешно!', 'success');
        elBookingModal.classList.remove('open');
        await fetchData();
        renderAll();
      } else {
        const err = await res.json();
        showBookingError(err.error || 'Ошибка при сохранении встречи');
      }
    } catch (error) {
      console.error(error);
      showBookingError('Не удалось отправить запрос');
    }
  });
  
  // Custom confirmation modal binding
  let meetingIdToDelete = null;

  elBtnDeleteMeetingTooltip.addEventListener('click', () => {
    if (activeTooltipMeetingId) {
      meetingIdToDelete = activeTooltipMeetingId;
      elConfirmModal.classList.add('open');
      lucide.createIcons();
    }
  });

  if (elBtnConfirmCancel) {
    elBtnConfirmCancel.addEventListener('click', () => {
      elConfirmModal.classList.remove('open');
      meetingIdToDelete = null;
    });
  }

  if (elBtnConfirmDelete) {
    elBtnConfirmDelete.addEventListener('click', async () => {
      if (meetingIdToDelete) {
        elConfirmModal.classList.remove('open');
        await deleteMeeting(meetingIdToDelete);
        meetingIdToDelete = null;
      }
    });
  }

  elConfirmModal.addEventListener('click', (e) => {
    if (e.target === elConfirmModal) {
      elConfirmModal.classList.remove('open');
      meetingIdToDelete = null;
    }
  });

  // Settings toggle
  if (elBtnSettingsToggle) {
    elBtnSettingsToggle.addEventListener('click', () => {
      renderSettingsOptions();
      elSettingsModal.classList.add('open');
      lucide.createIcons();
    });
  }

  if (elBtnCloseSettings) {
    elBtnCloseSettings.addEventListener('click', () => elSettingsModal.classList.remove('open'));
  }

  elSettingsModal.addEventListener('click', (e) => {
    if (e.target === elSettingsModal) {
      elSettingsModal.classList.remove('open');
    }
  });

  // Notifications bindings
  if (elBtnNotificationsToggle) {
    elBtnNotificationsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      elNotificationsPopover.classList.toggle('open');
      
      // Clear unread state
      notifications.forEach(n => n.read = true);
      localStorage.setItem('orbit_plan_notifications', JSON.stringify(notifications));
      renderNotifications();
    });
  }

  if (elBtnClearNotifications) {
    elBtnClearNotifications.addEventListener('click', () => {
      notifications = [];
      localStorage.setItem('orbit_plan_notifications', JSON.stringify(notifications));
      renderNotifications();
    });
  }

  // Close notifications popover on click outside
  document.addEventListener('click', (e) => {
    if (elNotificationsPopover && !elNotificationsPopover.contains(e.target) && e.target !== elBtnNotificationsToggle) {
      elNotificationsPopover.classList.remove('open');
    }
  });

  // Zoom bindings (with chosen animation transition)
  if (elBtnZoomIn) {
    elBtnZoomIn.addEventListener('click', () => {
      transitionDirection = 'left';
      applyZoom(currentZoom + 8);
      applyGridAnimation();
    });
  }

  if (elBtnZoomOut) {
    elBtnZoomOut.addEventListener('click', () => {
      transitionDirection = 'right';
      applyZoom(currentZoom - 8);
      applyGridAnimation();
    });
  }
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.meeting-card') && !e.target.closest('#meeting-tooltip') && !e.target.closest('.ticker-card')) {
      hideMeetingTooltip();
    }
  });
}

window.addEventListener('DOMContentLoaded', init);
