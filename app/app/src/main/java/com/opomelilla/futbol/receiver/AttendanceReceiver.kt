package com.opomelilla.futbol.receiver

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import com.opomelilla.futbol.R
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.SetAttendanceRequest
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class AttendanceReceiver : BroadcastReceiver() {

    @Inject
    lateinit var apiService: ApiService

    @OptIn(DelicateCoroutinesApi::class)
    override fun onReceive(context: Context, intent: Intent) {
        val eventId = intent.getStringExtra("eventId") ?: return
        val action = intent.getStringExtra("action") ?: return // "ATTENDING" or "NOT_ATTENDING"
        val notificationId = intent.getIntExtra("notificationId", 0)

        Log.d("AttendanceReceiver", "Received RSVP: eventId=$eventId, action=$action")

        val pendingResult = goAsync()

        // Use GlobalScope since the receiver might die soon, but this is a quick network call
        GlobalScope.launch {
            try {
                val request = SetAttendanceRequest(
                    status = action,
                    reason = if (action == "NOT_ATTENDING") "No puedo asistir (Notificación)" else null
                )
                val response = apiService.setAttendance(eventId, request)
                
                if (response.isSuccessful) {
                    Log.d("AttendanceReceiver", "Attendance set successfully via notification")
                    updateNotification(context, notificationId, if (action == "ATTENDING") "Asistencia Confirmada" else "Asistencia Denegada")
                } else {
                    Log.e("AttendanceReceiver", "Error setting attendance: ${response.code()}")
                    updateNotification(context, notificationId, "Error al confirmar asistencia")
                }
            } catch (e: Exception) {
                Log.e("AttendanceReceiver", "Exception setting attendance", e)
                updateNotification(context, notificationId, "Error al confirmar asistencia")
            } finally {
                pendingResult.finish()
            }
        }
    }

    private fun updateNotification(context: Context, notificationId: Int, message: String) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "futsal_notifications_channel"
        
        val updatedNotification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("OpoMelilla Fútbol")
            .setContentText(message)
            .setAutoCancel(true)
            .build()
            
        notificationManager.notify(notificationId, updatedNotification)
    }
}
