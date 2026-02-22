package com.opomelilla.futbol.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import com.opomelilla.futbol.data.remote.model.LoginRequest
import com.opomelilla.futbol.data.remote.model.LoginResponse
import com.opomelilla.futbol.data.remote.model.EventsResponse

interface ApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @GET("events")
    suspend fun getEvents(): com.opomelilla.futbol.data.remote.model.EventsResponse

    @POST("events/{eventId}/attendance")
    suspend fun setAttendance(
        @retrofit2.http.Path("eventId") eventId: String,
        @Body request: com.opomelilla.futbol.data.remote.model.SetAttendanceRequest
    ): retrofit2.Response<Unit>

    @GET("events/{eventId}/attendance")
    suspend fun getEventAttendance(
        @retrofit2.http.Path("eventId") eventId: String
    ): com.opomelilla.futbol.data.remote.model.EventAttendanceResponse

    @retrofit2.http.PUT("events/{eventId}/attendance/bulk")
    suspend fun bulkUpdateAttendance(
        @retrofit2.http.Path("eventId") eventId: String,
        @Body request: com.opomelilla.futbol.data.remote.model.BulkAttendanceRequest
    ): retrofit2.Response<Unit>

    @POST("auth/fcm-token")
    suspend fun sendFcmToken(@Body request: com.opomelilla.futbol.data.remote.model.FcmTokenRequest): retrofit2.Response<Unit>

    @GET("users/{userId}/profile")
    suspend fun getProfile(@retrofit2.http.Path("userId") userId: String): com.opomelilla.futbol.data.remote.model.UserProfileDto

    @retrofit2.http.PUT("users/{userId}/profile")
    suspend fun updateProfile(
        @retrofit2.http.Path("userId") userId: String,
        @Body profile: com.opomelilla.futbol.data.remote.model.ProfileDto
    ): retrofit2.Response<com.opomelilla.futbol.data.remote.model.UserProfileDto>
}
