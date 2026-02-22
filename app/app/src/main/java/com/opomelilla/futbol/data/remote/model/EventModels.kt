package com.opomelilla.futbol.data.remote.model

import com.google.gson.annotations.SerializedName

data class EventDto(
    val id: String,
    val title: String,
    val type: String,
    val date: String,
    val location: String?,
    val description: String?
)

data class EventsResponse(
    val events: List<EventDto>
)

data class SetAttendanceRequest(
    val status: String, // "ATTENDING", "NOT_ATTENDING", "PENDING"
    val reason: String? = null
)

data class AttendanceUser(
    val id: String,
    val email: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val role: String
)

data class AttendanceRecord(
    val id: String,
    val status: String, // 'ATTENDING', 'NOT_ATTENDING', 'PENDING'
    val reason: String?,
    val attended: Boolean,
    val user: AttendanceUser
)

data class EventAttendanceResponse(
    val attendances: List<AttendanceRecord>
)

data class AttendanceUpdateItem(
    val userId: String,
    val attended: Boolean
)

data class BulkAttendanceRequest(
    val attendances: List<AttendanceUpdateItem>
)
