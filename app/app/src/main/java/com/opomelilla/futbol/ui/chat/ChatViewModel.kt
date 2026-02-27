package com.opomelilla.futbol.ui.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opomelilla.futbol.data.local.TokenManager
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.ChatMessageDto
import com.opomelilla.futbol.data.remote.model.SendMessageRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    val tokenManager: TokenManager,
    private val apiService: ApiService
) : ViewModel() {

    private val _messages = MutableStateFlow<List<ChatMessageDto>>(emptyList())
    val messages: StateFlow<List<ChatMessageDto>> = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _isSending = MutableStateFlow(false)
    val isSending: StateFlow<Boolean> = _isSending.asStateFlow()

    init {
        fetchMessages()
        startPolling()
    }

    fun fetchMessages() {
        viewModelScope.launch {
            _isLoading.value = _messages.value.isEmpty()
            _error.value = null
            try {
                _messages.value = apiService.getMessages()
            } catch (e: Exception) {
                if (_messages.value.isEmpty()) {
                    _error.value = "Error al cargar mensajes: ${e.message}"
                }
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun sendMessage(content: String) {
        if (content.isBlank()) return
        viewModelScope.launch {
            _isSending.value = true
            try {
                val msg = apiService.sendMessage(SendMessageRequest(content.trim()))
                _messages.value = _messages.value + msg
            } catch (e: Exception) {
                _error.value = "Error al enviar: ${e.message}"
            } finally {
                _isSending.value = false
            }
        }
    }

    private fun startPolling() {
        viewModelScope.launch {
            while (true) {
                delay(5000)
                try {
                    _messages.value = apiService.getMessages()
                } catch (_: Exception) { }
            }
        }
    }
}
