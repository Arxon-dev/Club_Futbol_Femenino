package com.opomelilla.futbol.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import com.opomelilla.futbol.data.remote.model.LoginRequest
import com.opomelilla.futbol.data.remote.model.LoginResponse

interface ApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse



    @POST("auth/fcm-token")
    suspend fun sendFcmToken(@Body request: com.opomelilla.futbol.data.remote.model.FcmTokenRequest): retrofit2.Response<Unit>

    @GET("users/{userId}/profile")
    suspend fun getProfile(@retrofit2.http.Path("userId") userId: String): com.opomelilla.futbol.data.remote.model.UserProfileDto

    @retrofit2.http.PUT("users/{userId}/profile")
    suspend fun updateProfile(
        @retrofit2.http.Path("userId") userId: String,
        @Body profile: com.opomelilla.futbol.data.remote.model.ProfileDto
    ): retrofit2.Response<com.opomelilla.futbol.data.remote.model.UserProfileDto>

    @GET("finances/user/{userId}")
    suspend fun getFinances(
        @retrofit2.http.Path("userId") userId: String
    ): com.opomelilla.futbol.data.remote.model.TreasuryDataDto

    @GET("president-letter")
    suspend fun getPresidentLetter(): com.opomelilla.futbol.data.remote.model.PresidentLetterDto

    @GET("matches")
    suspend fun getMatches(): List<com.opomelilla.futbol.data.remote.model.MatchDto>

    @GET("social-links")
    suspend fun getSocialLinks(): com.opomelilla.futbol.data.remote.model.SocialLinkDto

    @GET("news")
    suspend fun getNews(): List<com.opomelilla.futbol.data.remote.model.NewsDto>

    @GET("roster")
    suspend fun getRoster(): List<com.opomelilla.futbol.data.remote.model.RosterMemberDto>
}
