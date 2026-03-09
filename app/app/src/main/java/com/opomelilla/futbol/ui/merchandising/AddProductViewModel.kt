package com.opomelilla.futbol.ui.merchandising

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opomelilla.futbol.BuildConfig
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.CreateProductRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.UUID
import javax.inject.Inject

sealed class AddProductState {
    object Idle : AddProductState()
    object Loading : AddProductState()
    object Success : AddProductState()
    data class Error(val message: String) : AddProductState()
}

@HiltViewModel
class AddProductViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow<AddProductState>(AddProductState.Idle)
    val uiState: StateFlow<AddProductState> = _uiState.asStateFlow()

    fun createProduct(
        context: Context,
        name: String,
        description: String,
        priceStr: String,
        category: String,
        sizesStr: String,
        contactWhatsApp: String,
        imageUri: Uri?
    ) {
        if (name.isBlank() || priceStr.isBlank() || category.isBlank()) {
            _uiState.value = AddProductState.Error("Por favor, completa nombre, precio y categoría.")
            return
        }

        val price = priceStr.toDoubleOrNull()
        if (price == null) {
            _uiState.value = AddProductState.Error("El precio deber ser un número válido.")
            return
        }

        val sizes = sizesStr.split(",").map { it.trim() }.filter { it.isNotBlank() }

        viewModelScope.launch {
            _uiState.value = AddProductState.Loading
            try {
                var imageUrl: String? = null

                if (imageUri != null) {
                    val bytes = context.contentResolver.openInputStream(imageUri)?.readBytes()
                    if (bytes != null) {
                        val fileName = "prod_${UUID.randomUUID()}.jpg"
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
                            _uiState.value = AddProductState.Error("Error al subir la imagen: ${uploadResponse.errorBody()?.string()}")
                            return@launch
                        }
                    }
                }

                val request = CreateProductRequest(
                    name = name,
                    description = description.takeIf { it.isNotBlank() },
                    price = price,
                    category = category,
                    available = true,
                    imageUrl = imageUrl,
                    sizes = sizes.takeIf { it.isNotEmpty() },
                    contactWhatsApp = contactWhatsApp.takeIf { it.isNotBlank() }
                )

                apiService.createProduct(request)
                _uiState.value = AddProductState.Success

            } catch (e: Exception) {
                _uiState.value = AddProductState.Error("Error: ${e.message}")
            }
        }
    }

    fun resetState() {
        _uiState.value = AddProductState.Idle
    }
}
