const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read database
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { employees: [], meetings: [] };
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB file:', error);
    return { employees: [], meetings: [] };
  }
}

// Helper to write database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing DB file:', error);
    return false;
  }
}

// API: Get all employees
app.get('/api/employees', (req, res) => {
  const db = readDB();
  res.json(db.employees);
});

// API: Create new employee
app.post('/api/employees', (req, res) => {
  const { name, position, avatar } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Имя сотрудника не может быть пустым' });
  }

  const db = readDB();
  
  // Check if already exists (case insensitive, trim whitespace)
  const normalizedNewName = name.trim().toLowerCase();
  const exists = db.employees.some(emp => emp.name.trim().toLowerCase() === normalizedNewName);
  if (exists) {
    return res.status(400).json({ error: 'Сотрудник с таким именем уже существует' });
  }

  // Generate nice gradients for avatars
  const gradients = [
    'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
    'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',
    'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    'linear-gradient(135deg, #4ca1af 0%, #c4e0e5 100%)',
    'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  ];
  const randomGradient = gradients[db.employees.length % gradients.length];

  const newEmployee = {
    id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    position: position ? position.trim() : 'Сотрудник',
    avatarColor: randomGradient,
    avatar: avatar || null
  };

  db.employees.push(newEmployee);
  writeDB(db);
  res.status(201).json(newEmployee);
});

// API: Update employee details
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, position, avatar } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Имя сотрудника не может быть пустым' });
  }

  const db = readDB();
  const empIndex = db.employees.findIndex(e => e.id === id);
  if (empIndex === -1) {
    return res.status(404).json({ error: 'Сотрудник не найден' });
  }

  // Check if name is taken by another employee
  const normalizedNewName = name.trim().toLowerCase();
  const exists = db.employees.some(emp => emp.id !== id && emp.name.trim().toLowerCase() === normalizedNewName);
  if (exists) {
    return res.status(400).json({ error: 'Сотрудник с таким именем уже существует' });
  }

  db.employees[empIndex].name = name.trim();
  db.employees[empIndex].position = position ? position.trim() : 'Сотрудник';
  if (avatar !== undefined) {
    db.employees[empIndex].avatar = avatar;
  }

  writeDB(db);
  res.json(db.employees[empIndex]);
});

// API: Get all meetings
app.get('/api/meetings', (req, res) => {
  const db = readDB();
  res.json(db.meetings);
});

// API: Create new meeting (with overlap check)
app.post('/api/meetings', (req, res) => {
  const { title, organizerId, participantIds, date, startTime, endTime, description } = req.body;

  // Validation
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Укажите название встречи' });
  }
  if (!organizerId) {
    return res.status(400).json({ error: 'Укажите организатора встречи' });
  }
  if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
    return res.status(400).json({ error: 'Выберите хотя бы одного участника' });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Укажите корректную дату в формате ГГГГ-ММ-ДД' });
  }
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    return res.status(400).json({ error: 'Укажите корректное время начала (ЧЧ:ММ)' });
  }
  if (!endTime || !/^\d{2}:\d{2}$/.test(endTime)) {
    return res.status(400).json({ error: 'Укажите корректное время окончания (ЧЧ:ММ)' });
  }
  if (startTime >= endTime) {
    return res.status(400).json({ error: 'Время начала встречи должно быть раньше времени окончания' });
  }

  const db = readDB();

  // Let's get the list of all involved people for the new meeting: actual participants
  const newMeetingPeople = new Set(participantIds);

  // Check overlaps with existing meetings
  const overlappingMeetings = db.meetings.filter(existing => {
    // 1. Must be the same date
    if (existing.date !== date) return false;

    // 2. Must share at least one person (participant)
    const existingMeetingPeople = new Set(existing.participantIds);
    const hasCommonPerson = [...newMeetingPeople].some(person => existingMeetingPeople.has(person));
    if (!hasCommonPerson) return false;

    // 3. Must overlap in time
    // Interval overlap condition: Start1 < End2 AND Start2 < End1
    const start1 = startTime;
    const end1 = endTime;
    const start2 = existing.startTime;
    const end2 = existing.endTime;

    return start1 < end2 && start2 < end1;
  });

  if (overlappingMeetings.length > 0) {
    // Find who exactly is busy
    const busyNames = [];
    overlappingMeetings.forEach(meet => {
      const existingPeople = [meet.organizerId, ...meet.participantIds];
      const overlapPeople = [...newMeetingPeople].filter(person => existingPeople.includes(person));
      overlapPeople.forEach(personId => {
        const emp = db.employees.find(e => e.id === personId);
        if (emp && !busyNames.includes(emp.name)) {
          busyNames.push(emp.name);
        }
      });
    });

    const conflictsDetails = overlappingMeetings.map(meet => 
      `«${meet.title}» (${meet.startTime} - ${meet.endTime})`
    ).join(', ');

    return res.status(409).json({
      error: `Невозможно забронировать время. Участник(и): ${busyNames.join(', ')} уже заняты на встрече: ${conflictsDetails}.`
    });
  }

  const newMeeting = {
    id: `meet_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: title.trim(),
    organizerId,
    participantIds,
    date,
    startTime,
    endTime,
    description: description ? description.trim() : ''
  };

  db.meetings.push(newMeeting);
  writeDB(db);

  res.status(201).json(newMeeting);
});

// API: Delete a meeting
app.delete('/api/meetings/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  const index = db.meetings.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Встреча не найдена' });
  }

  const deletedMeeting = db.meetings.splice(index, 1)[0];
  writeDB(db);

  res.json({ message: 'Встреча успешно удалена', deletedMeeting });
});

// Catch-all route to serve index.html for spa
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
