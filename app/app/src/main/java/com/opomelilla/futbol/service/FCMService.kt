package com.opomelilla.futbol.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.opomelilla.futbol.MainActivity
import com.opomelilla.futbol.R

class FCMService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        Log.d(TAG, "From: ${remoteMessage.from}")

        var title: String? = null
        var body: String? = null

        // Check if message contains a notification payload (e.g. from Firebase Web Console).
        remoteMessage.notification?.let {
            title = it.title
            body = it.body
            Log.d(TAG, "Message Notification Body: $body")
        }

        // Check if message contains a data payload (our custom backend sends data-only messages).
        if (remoteMessage.data.isNotEmpty()) {
            Log.d(TAG, "Message data payload: ${remoteMessage.data}")
            navigateTo = remoteMessage.data["navigateTo"]
            eventId = remoteMessage.data["eventId"]
            
            // Extract title and body from data payload if available
            remoteMessage.data["title"]?.let { title = it }
            remoteMessage.data["body"]?.let { body = it }
        }

        if (title != null || body != null) {
            sendNotification(title, body, navigateTo, eventId)
        }
    }

    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed token: $token")
        // NOTE: Here we should send this token to our Node.js backend to link it with the user.
        // We will implement this in the frontend Repository.
    }

    private fun sendNotification(title: String?, messageBody: String?, navigateTo: String?, eventId: String?) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            navigateTo?.let { putExtra("navigateTo", it) }
            eventId?.let { putExtra("eventId", it) }
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Generate a unique ID for this notification
        val notificationId = System.currentTimeMillis().toInt()
        val channelId = "futsal_notifications_channel"
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title ?: "Nueva Notificación")
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)

        // Add Attendance Action Buttons if eventId is provided (assuming it's an event notification)
        if (eventId != null) {
            val attendIntent = Intent(this, com.opomelilla.futbol.receiver.AttendanceReceiver::class.java).apply {
                putExtra("eventId", eventId)
                putExtra("action", "ATTENDING")
                putExtra("notificationId", notificationId)
            }
            val attendPendingIntent = PendingIntent.getBroadcast(
                this, 1, attendIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            val declineIntent = Intent(this, com.opomelilla.futbol.receiver.AttendanceReceiver::class.java).apply {
                putExtra("eventId", eventId)
                putExtra("action", "NOT_ATTENDING")
                putExtra("notificationId", notificationId)
            }
            val declinePendingIntent = PendingIntent.getBroadcast(
                this, 2, declineIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            notificationBuilder.addAction(
                0, // No icon for modern Android
                "Asistir",
                attendPendingIntent
            ).addAction(
                0,
                "No Asistir",
                declinePendingIntent
            )
        }

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Since android Oreo notification channel is needed.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Avisos del Club",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(0, notificationBuilder.build())
    }

    companion object {
        private const val TAG = "FCMService"
    }
}
