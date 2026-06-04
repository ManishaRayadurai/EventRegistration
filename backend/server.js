const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const DATA_DIR = path.join(__dirname, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const PART_FILE = path.join(DATA_DIR, 'participants.json');

fs.ensureDirSync(DATA_DIR);

// ✅ Initialize files if missing
if (!fs.existsSync(EVENTS_FILE)) {
  fs.writeJsonSync(EVENTS_FILE, [
    { id: 1, title: "AI & Data Science Workshop", date: "2025-12-01", venue: "Main Hall", capacity: 100 },
    { id: 2, title: "Hackathon: Build for Good", date: "2025-12-15", venue: "Lab 2", capacity: 200 },
    { id: 3, title: "Networking Meetup", date: "2025-12-20", venue: "Auditorium", capacity: 150 }
  ], { spaces: 2 });
}

if (!fs.existsSync(PART_FILE)) {
  fs.writeJsonSync(PART_FILE, [], { spaces: 2 });
}

// ✅ API: Get events
app.get('/api/events', async (req, res) => {
  try {
    const events = await fs.readJson(EVENTS_FILE);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read events' });
  }
});

// ✅ API: Get participants
app.get('/api/participants', async (req, res) => {
  try {
    const participants = await fs.readJson(PART_FILE);
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read participants' });
  }
});

// ✅ API: Register participant
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, college, eventId } = req.body;
    if (!name || !email || !eventId) {
      return res.status(400).json({ error: 'Name, email, and eventId are required' });
    }

    const events = await fs.readJson(EVENTS_FILE);
    const event = events.find(e => e.id === Number(eventId));
    if (!event) return res.status(400).json({ error: 'Event not found' });

    const participants = await fs.readJson(PART_FILE);
    const already = participants.find(p => p.email === email && p.eventId === Number(eventId));
    if (already) return res.status(409).json({ error: 'Already registered for this event' });

    const countForEvent = participants.filter(p => p.eventId === Number(eventId)).length;
    if (event.capacity && countForEvent >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    const newParticipant = {
      id: participants.length ? participants[participants.length - 1].id + 1 : 1,
      name,
      email,
      phone: phone || '',
      college: college || '',
      eventId: Number(eventId),
      registeredAt: new Date().toISOString(),
    };

    participants.push(newParticipant);
    await fs.writeJson(PART_FILE, participants, { spaces: 2 });

    res.json({ success: true, participant: newParticipant });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register participant' });
  }
});

// ✅ Start server and open browser (fixed for all Node versions)
app.listen(PORT, async () => {
  const url = `http://localhost:${PORT}`;
  console.log(`✅ Server running successfully at: ${url}`);
  console.log(`🌐 Open your browser and visit: ${url}`);

  try {
    const open = (await import('open')).default;
    open(url);
  } catch (err) {
    console.log("⚠️ Could not auto-open browser. Please open manually.");
  }
});
