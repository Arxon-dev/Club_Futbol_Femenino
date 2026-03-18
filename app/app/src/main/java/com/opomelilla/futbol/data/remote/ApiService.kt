package com.opomelilla.futbol.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.DELETE
import retrofit2.http.Query
import retrofit2.http.Path
import retrofit2.http.Url
import retrofit2.http.Header
import okhttp3.RequestBody
import com.opomelilla.futbol.data.remote.model.LoginRequest
import com.opomelilla.futbol.data.remote.model.LoginResponse

interface ApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @POST("auth/fcm-token")
    suspend fun sendFcmToken(@Body request: com.opomelilla.futbol.data.remote.model.FcmTokenRequest): retrofit2.Response<Unit>

    @PUT("auth/change-password")
    suspend fun changePassword(@Body request: com.opomelilla.futbol.data.remote.model.ChangePasswordRequest): retrofit2.Response<Unit>

    @GET("users/{userId}/profile")
    suspend fun getProfile(@Path("userId") userId: String): com.opomelilla.futbol.data.remote.model.UserProfileDto

    @retrofit2.http.PUT("users/{userId}/profile")
    suspend fun updateProfile(
        @Path("userId") userId: String,
        @Body profile: com.opomelilla.futbol.data.remote.model.ProfileDto
    ): retrofit2.Response<com.opomelilla.futbol.data.remote.model.UserProfileDto>

    @GET("finances/user/{userId}")
    suspend fun getFinances(
        @Path("userId") userId: String
    ): com.opomelilla.futbol.data.remote.model.TreasuryDataDto

    @GET("president-letter")
    suspend fun getPresidentLetter(): com.opomelilla.futbol.data.remote.model.PresidentLetterDto

    @GET("matches")
    suspend fun getMatches(): List<com.opomelilla.futbol.data.remote.model.MatchDto>

    @GET("social-links")
    suspend fun getSocialLinks(): com.opomelilla.futbol.data.remote.model.SocialLinkDto

    @GET("news")
    suspend fun getNews(): List<com.opomelilla.futbol.data.remote.model.NewsDto>

    @POST("news")
    suspend fun createNews(@Body request: com.opomelilla.futbol.data.remote.model.CreateNewsRequest): com.opomelilla.futbol.data.remote.model.NewsDto

    @GET("roster")
    suspend fun getRoster(): List<com.opomelilla.futbol.data.remote.model.RosterMemberDto>

    @GET("chat")
    suspend fun getMessages(@Query("userId") userId: String? = null): List<com.opomelilla.futbol.data.remote.model.ChatMessageDto>

    @POST("chat")
    suspend fun sendMessage(@Body body: com.opomelilla.futbol.data.remote.model.SendMessageRequest): com.opomelilla.futbol.data.remote.model.ChatMessageDto

    @DELETE("chat/{id}")
    suspend fun deleteMessage(@Path("id") messageId: Int): Response<Unit>

    @GET("products")
    suspend fun getProducts(): List<com.opomelilla.futbol.data.remote.model.ProductDto>

    @POST("products")
    suspend fun createProduct(@Body request: com.opomelilla.futbol.data.remote.model.CreateProductRequest): com.opomelilla.futbol.data.remote.model.ProductDto

    @POST
    suspend fun uploadImageToSupabase(
        @Url url: String,
        @Header("Authorization") authHeader: String,
        @Header("Content-Type") contentType: String,
        @Body image: RequestBody
    ): Response<Unit>
}
