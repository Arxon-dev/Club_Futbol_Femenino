package com.opomelilla.futbol.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.LoginRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(val token: String, val role: String) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: com.opomelilla.futbol.data.local.TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _uiState.value = LoginUiState.Error("Email y contraseña requeridos")
            return
        }

        _uiState.value = LoginUiState.Loading

        viewModelScope.launch {
            try {
                val response = apiService.login(LoginRequest(email, password))
                tokenManager.saveToken(response.token)
                tokenManager.saveRole(response.user.role)
                tokenManager.saveUserId(response.user.id)
                
                // Retrieve FCM token and send it in background
                com.google.firebase.messaging.FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        val fcmToken = task.result
                        viewModelScope.launch {
                            try {
                                apiService.sendFcmToken(com.opomelilla.futbol.data.remote.model.FcmTokenRequest(fcmToken))
                            } catch (e: Exception) {
                                // Silent failure for token registration to avoid blocking the user
                            }
                        }
                    }
                }

                _uiState.value = LoginUiState.Success(response.token, response.user.role)
            } catch (e: Exception) {
                _uiState.value = LoginUiState.Error("Credenciales incorrectas o error de conexión")
                _uiState.value = LoginUiState.Error("Error de conexión: ${e.localizedMessage}")
            }
        }
    }
}
