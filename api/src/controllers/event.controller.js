const { Event } = require('../models');
const { sendBroadcastInternal } = require('./notificationController');

exports.createEvent = async (req, res) => {
  try {
    const { title, type, date, location, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'El título y la fecha son obligatorios' });
    }

    const newEvent = await Event.create({
      title,
      type,
      date,
      location,
      description
    });

    // Send push notification asynchronously (don't await so we don't block the response)
    try {
      // Format the date for the notification
      const eventDate = new Date(date);
      const formattedDate = eventDate.toLocaleDateString('es-ES', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      const notificationTitle = 'Nuevo Evento Creado';
      const notificationBody = `[${type || 'Evento'}] ${title} el ${formattedDate} en ${location || 'Lugar por definir'}`;
      
      // Navigate payload for deep linking
      const dataPayload = {
        navigateTo: 'events',
        eventId: newEvent.id.toString()
      };

      sendBroadcastInternal(notificationTitle, notificationBody, dataPayload).catch(err => {
        console.error('Failed to send broadcast after event creation:', err);
      });
    } catch (notifError) {
      console.error('Error constructing notification:', notifError);
    }

    res.status(201).json({ message: 'Evento creado correctamente', event: newEvent });
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({ message: 'Error interno al crear el evento' });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['date', 'ASC']]
    });

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ message: 'Error interno al obtener eventos' });
  }
};

const Attendance = require('../models/attendance.model');
const User = require('../models/user.model');

// Marcar o actualizar asistencia a un evento por el usuario logueado
exports.setAttendance = async (req, res) => {
  try {
    console.log('[DEBUG] Start setAttendance');
    const eventId = req.params.id;
    const userId = req.userId;
    const { status, reason } = req.body;
    console.log(`[DEBUG] eventId: ${eventId}, userId: ${userId}, status: ${status}`);

    // Verificar si el evento existe
    const event = await Event.findByPk(eventId);
    if (!event) {
      console.log('[DEBUG] Event not found');
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Validar status
    if (!status || !['ATTENDING', 'NOT_ATTENDING', 'PENDING'].includes(status)) {
      console.log('[DEBUG] Invalid status');
      return res.status(400).json({ message: 'Estado de asistencia inválido' });
    }

    console.log('[DEBUG] Searching for existing attendance...');
    // Buscar si ya existe asistencia
    let attendance = await Attendance.findOne({
      where: {
        eventId: eventId,
        userId: userId
      }
    });

    if (attendance) {
      if (attendance.status !== status) {
        console.log('[DEBUG] Updating existing attendance to', status);
        attendance.status = status;
        attendance.reason = reason || null;
        await attendance.save();
      } else {
        console.log('[DEBUG] Attendance status already matched', status);
      }
      return res.status(200).json({ message: 'Asistencia actualizada', attendance });
    }

    console.log('[DEBUG] Creating new attendance');
    attendance = await Attendance.create({
      eventId: eventId,
      userId: userId,
      status,
      reason: reason || null
    });

    console.log('[DEBUG] Success');
    res.status(200).json({ message: 'Asistencia registrada con éxito', attendance });
  } catch (error) {
    console.error('Error registrando asistencia:', error);
    res.status(500).json({ message: 'Error interno al registrar asistencia' });
  }
};

// Obtener todas las asistencias de un evento (para ADMIN/COACH)
exports.getEventAttendance = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Verificar si el evento existe
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    const attendances = await Attendance.findAll({
      where: { eventId: eventId }
    });
    
    // As it is a simple list, we will fetch users manually to avoid complex join issues 
    // that sometimes happen if the many-to-many relationship through table isn't aliased perfectly
    const attendancesWithUsers = await Promise.all(attendances.map(async (att) => {
        if (!att.userId) return null;

        const user = await User.findByPk(att.userId, {
            attributes: ['id', 'email', 'role']
        });

        if (!user) return null;

        const emailName = user.email.split('@')[0];
        
        return {
            ...att.toJSON(),
            user: {
                ...user.toJSON(),
                first_name: emailName,
                last_name: ''
            }
        };
    }));

    const validAttendances = attendancesWithUsers.filter(att => att !== null);

    res.status(200).json({ attendances: validAttendances });
  } catch (error) {
    console.error('Error obteniendo asistencia del evento:', error);
    res.status(500).json({ message: 'Error interno al obtener asistencia' });
  }
};

// Actualizar la asistencia real (attended) de forma masiva (para ADMIN/COACH)
exports.bulkUpdateAttendance = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { attendances } = req.body; // array de { userId, attended }

    if (!attendances || !Array.isArray(attendances)) {
      return res.status(400).json({ message: 'Se requiere un array de asistencias válido' });
    }

    // Verificar si el evento existe
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    await Promise.all(attendances.map(async ({ userId, attended }) => {
      if (userId !== undefined && attended !== undefined) {
        let attRecord = await Attendance.findOne({
          where: { eventId: eventId, userId: userId }
        });

        if (attRecord) {
          attRecord.attended = attended;
          await attRecord.save();
        } else {
          // Si por alguna razon no tenia registro, lo creamos
          await Attendance.create({
            eventId: eventId,
            userId: userId,
            status: 'PENDING',
            attended: attended
          });
        }
      }
    }));

    res.status(200).json({ message: 'Asistencias actualizadas correctamente' });
  } catch (error) {
    console.error('Error actualizando asistencia masiva:', error);
    res.status(500).json({ message: 'Error interno al actualizar asistencia masiva' });
  }
};
