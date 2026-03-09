package com.opomelilla.futbol.ui.news

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opomelilla.futbol.BuildConfig
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.CreateNewsRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.UUID
import javax.inject.Inject

sealed class AddNewsState {
    object Idle : AddNewsState()
    object Loading : AddNewsState()
    object Success : AddNewsState()
    data class Error(val message: String) : AddNewsState()
}

@HiltViewModel
class AddNewsViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow<AddNewsState>(AddNewsState.Idle)
    val uiState: StateFlow<AddNewsState> = _uiState.asStateFlow()

    fun createNews(
        context: Context,
        title: String,
        content: String,
        category: String,
        author: String,
        imageUri: Uri?
    ) {
        if (title.isBlank() || content.isBlank() || category.isBlank()) {
            _uiState.value = AddNewsState.Error("Por favor, completa los campos requeridos.")
            return
        }

        viewModelScope.launch {
            _uiState.value = AddNewsState.Loading
            try {
                var imageUrl: String? = null

                if (imageUri != null) {
                    val bytes = context.contentResolver.openInputStream(imageUri)?.readBytes()
                    if (bytes != null) {
                        val fileName = "news_${UUID.randomUUID()}.jpg"
                        val url = "${BuildConfig.SUPABASE_URL}/storage/v1/object/general-photos/$fileName"
                        val authHeader = "Bearer ${BuildConfig.SUPABASE_ANON_KEY}"
                        
                        val requestBody = bytes.toRequestBody("image/jpeg".toMediaTypeOrNull(), 0, bytes.size)
                        
                        val uploadResponse = apiService.uploadImageToSupabase(
                            url = url,
                            authHeader = authHeader,
                            contentType = "image/jpeg",
                            image = requestBody
                        )

                        if (uploadResponse.isSuccessful) {
                            imageUrl = "${BuildConfig.SUPABASE_URL}/storage/v1/object/public/general-photos/$fileName"
                        } else {
                            _uiState.value = AddNewsState.Error("Error al subir la imagen: ${uploadResponse.errorBody()?.string()}")
                            return@launch
                        }
                    }
                }

                val request = CreateNewsRequest(
                    title = title,
                    content = content,
                    category = category,
                    imageUrl = imageUrl,
                    author = author.takeIf { it.isNotBlank() },
                    published = true
                )

                apiService.createNews(request)
                _uiState.value = AddNewsState.Success

            } catch (e: Exception) {
                _uiState.value = AddNewsState.Error("Error: ${e.message}")
            }
        }
    }

    fun resetState() {
        _uiState.value = AddNewsState.Idle
    }
}
