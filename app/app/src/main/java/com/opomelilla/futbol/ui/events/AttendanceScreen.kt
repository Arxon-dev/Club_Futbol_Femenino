package com.opomelilla.futbol.ui.events

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.opomelilla.futbol.data.remote.model.AttendanceRecord

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceScreen(
    eventId: String,
    onNavigateBack: () -> Unit,
    viewModel: AttendanceViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val currentAttendances by viewModel.currentAttendances.collectAsState()

    LaunchedEffect(eventId) {
        viewModel.loadAttendance(eventId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pasar Lista") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        },
        floatingActionButton = {
            if (uiState is AttendanceUiState.Success) {
                FloatingActionButton(onClick = { 
                    viewModel.submitAttendance(eventId) {
                        onNavigateBack()
                    }
                }) {
                    Text(modifier = Modifier.padding(horizontal = 16.dp), text = "Guardar")
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            when (val state = uiState) {
                is AttendanceUiState.Loading -> {
                    CircularProgressIndicator()
                }
                is AttendanceUiState.Error -> {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "Error: ${state.message}", color = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = { viewModel.loadAttendance(eventId) }) {
                            Text("Reintentar")
                        }
                    }
                }
                is AttendanceUiState.Success -> {
                    val attendances = state.attendances
                    if (attendances.isEmpty()) {
                        Text("No hay jugadores inscritos en este evento.")
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(16.dp, 16.dp, 16.dp, 80.dp) // extra bottom padding for FAB
                        ) {
                            items(attendances) { record ->
                                AttendanceRow(
                                    record = record,
                                    isChecked = currentAttendances[record.user.id] ?: record.attended,
                                    onCheckedChange = { viewModel.toggleAttendance(record.user.id) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AttendanceRow(
    record: AttendanceRecord,
    isChecked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "${record.user.firstName} ${record.user.lastName}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                // Tag showing original confirmation status
                val displayStatus = when (record.status) {
                    "ATTENDING" -> "Asistirá"
                    "NOT_ATTENDING" -> "Ausente"
                    else -> "Pendiente"
                }
                val statusColor = when (record.status) {
                    "ATTENDING" -> MaterialTheme.colorScheme.primary
                    "NOT_ATTENDING" -> MaterialTheme.colorScheme.error
                    else -> MaterialTheme.colorScheme.onSurfaceVariant
                }
                Text(
                    text = "Confirmado: $displayStatus",
                    style = MaterialTheme.typography.labelSmall,
                    color = statusColor
                )
            }
            Switch(
                checked = isChecked,
                onCheckedChange = onCheckedChange
            )
        }
    }
}
