package com.opomelilla.futbol.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.opomelilla.futbol.data.remote.model.ProfileDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var birthdate by remember { mutableStateOf("") }
    var clothingSize by remember { mutableStateOf("") }
    var dorsal by remember { mutableStateOf("") }
    var position by remember { mutableStateOf("") }
    var medicalInfo by remember { mutableStateOf("") }

    // When the state becomes Success and it's the first load, populate variables
    LaunchedEffect(uiState) {
        if (uiState is ProfileUiState.Success) {
            val profile = (uiState as ProfileUiState.Success).profile
            // We only want to populate if we haven't typed anything, 
            // or we could just overwrite. For simplicity, we overwrite on exact load.
            firstName = profile.firstName ?: ""
            lastName = profile.lastName ?: ""
            phone = profile.phone ?: ""
            birthdate = profile.birthdate ?: ""
            clothingSize = profile.clothingSize ?: ""
            dorsal = profile.dorsal?.toString() ?: ""
            position = profile.position ?: ""
            medicalInfo = profile.medicalInfo ?: ""
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mi Perfil") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            when (uiState) {
                is ProfileUiState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.fillMaxWidth().wrapContentWidth())
                }
                is ProfileUiState.Error -> {
                    Text("Error: ${(uiState as ProfileUiState.Error).message}", color = MaterialTheme.colorScheme.error)
                    Button(onClick = { viewModel.loadProfile() }) {
                        Text("Reintentar")
                    }
                }
                is ProfileUiState.Success -> {
                    OutlinedTextField(
                        value = firstName,
                        onValueChange = { firstName = it },
                        label = { Text("Nombre") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = lastName,
                        onValueChange = { lastName = it },
                        label = { Text("Apellidos") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Teléfono") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = birthdate,
                        onValueChange = { birthdate = it },
                        label = { Text("Fecha de Nacimiento (YYYY-MM-DD)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = clothingSize,
                            onValueChange = { clothingSize = it },
                            label = { Text("Talla") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = dorsal,
                            onValueChange = { dorsal = it },
                            label = { Text("Dorsal") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    OutlinedTextField(
                        value = position,
                        onValueChange = { position = it },
                        label = { Text("Posición en pista") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    OutlinedTextField(
                        value = medicalInfo,
                        onValueChange = { medicalInfo = it },
                        label = { Text("Información Médica / Alergias") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )

                    Button(
                        onClick = {
                            val profile = ProfileDto(
                                firstName = firstName.takeIf { it.isNotBlank() },
                                lastName = lastName.takeIf { it.isNotBlank() },
                                phone = phone.takeIf { it.isNotBlank() },
                                birthdate = birthdate.takeIf { it.isNotBlank() },
                                clothingSize = clothingSize.takeIf { it.isNotBlank() },
                                dorsal = dorsal.toIntOrNull(),
                                position = position.takeIf { it.isNotBlank() },
                                medicalInfo = medicalInfo.takeIf { it.isNotBlank() }
                            )
                            viewModel.updateProfile(profile)
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Guardar Cambios")
                    }
                }
            }
        }
    }
}
