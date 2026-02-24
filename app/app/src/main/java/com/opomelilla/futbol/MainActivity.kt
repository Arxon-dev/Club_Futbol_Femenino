package com.opomelilla.futbol

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import com.opomelilla.futbol.ui.login.LoginScreen
import com.opomelilla.futbol.ui.theme.Club_Futbol_SalaTheme
import dagger.hilt.android.AndroidEntryPoint
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import android.os.Build
import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.NavController
import androidx.core.content.ContextCompat
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.runtime.getValue
import androidx.navigation.compose.currentBackStackEntryAsState

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @javax.inject.Inject
    lateinit var tokenManager: com.opomelilla.futbol.data.local.TokenManager

    // Store pending navigation from push notification
    private var pendingNavigateTo: String? = null
    private var pendingEventId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check for intent extras from FCMService
        handleIntent(intent)

        enableEdgeToEdge()
        setContent {
            Club_Futbol_SalaTheme {
                // Android 13+ Notification Permission
                val permissionLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission(),
                    onResult = { isGranted ->
                        if (!isGranted) {
                            Toast.makeText(this@MainActivity, "Las notificaciones están desactivadas. No recibirás avisos del club.", Toast.LENGTH_LONG).show()
                        }
                    }
                )

                LaunchedEffect(Unit) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                            permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                        }
                    }
                }

                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                // If app was already open and we get a new intent, handle navigation directly
                LaunchedEffect(pendingNavigateTo, pendingEventId) {
                    if (currentRoute != "login" && currentRoute != null) {
                        val role = tokenManager.getRole()
                        navigateFromIntent(navController, role)
                    }
                }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        if (currentRoute in listOf("events", "treasury", "profile")) {
                            NavigationBar {
                                NavigationBarItem(
                                    icon = { Icon(Icons.Filled.DateRange, contentDescription = "Eventos") },
                                    label = { Text("Eventos") },
                                    selected = currentRoute == "events",
                                    onClick = {
                                        navController.navigate("events") {
                                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                )
                                NavigationBarItem(
                                    icon = { Icon(Icons.Filled.ShoppingCart, contentDescription = "Tesorería") },
                                    label = { Text("Tesorería") },
                                    selected = currentRoute == "treasury",
                                    onClick = {
                                        navController.navigate("treasury") {
                                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                )
                                NavigationBarItem(
                                    icon = { Icon(Icons.Filled.Person, contentDescription = "Mi Perfil") },
                                    label = { Text("Mi Perfil") },
                                    selected = currentRoute == "profile",
                                    onClick = {
                                        navController.navigate("profile") {
                                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController, 
                        startDestination = "login",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable("login") {
                            LoginScreen(
                                onLoginSuccess = { role ->
                                    Toast.makeText(this@MainActivity, "Bienvenido! Rol: $role", Toast.LENGTH_SHORT).show()
                                    // If we came from a push notification, navigate there instead of default
                                    if (pendingNavigateTo != null) {
                                        navigateFromIntent(navController, role)
                                    } else {
                                        navController.navigate("events") {
                                            popUpTo("login") { inclusive = true }
                                        }
                                    }
                                }
                            )
                        }
                        composable("events") {
                            com.opomelilla.futbol.ui.events.EventsScreen(
                                onNavigateToAttendance = { eventId ->
                                    navController.navigate("attendance/$eventId")
                                }
                            )
                        }
                        composable("attendance/{eventId}") { backStackEntry ->
                            val eventId = backStackEntry.arguments?.getString("eventId") ?: return@composable
                            com.opomelilla.futbol.ui.events.AttendanceScreen(
                                eventId = eventId,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable("treasury") {
                            com.opomelilla.futbol.ui.finances.TreasuryScreen()
                        }
                        composable("profile") {
                            com.opomelilla.futbol.ui.profile.ProfileScreen()
                        }
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        intent?.let {
            val navTo = it.getStringExtra("navigateTo")
            val evId = it.getStringExtra("eventId")
            if (navTo != null) {
                pendingNavigateTo = navTo
                pendingEventId = evId
            }
        }
    }

    private fun navigateFromIntent(navController: androidx.navigation.NavController, role: String? = null) {
        val dest = pendingNavigateTo
        val id = pendingEventId
        
        // Clear pending intent data
        pendingNavigateTo = null
        pendingEventId = null

        if (dest == "events") {
            if (id != null && (role == "ADMIN" || role == "COACH")) {
                // Navigate to specific event attendance for Admins/Coaches
                navController.navigate("attendance/$id") {
                    popUpTo("login") { inclusive = true }
                }
            } else {
                // Navigate to events list for players (or if no ID)
                navController.navigate("events") {
                    popUpTo("login") { inclusive = true }
                }
            }
        }
    }
}