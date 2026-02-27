package com.opomelilla.futbol.ui.social

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun SocialHubScreen(
    viewModel: SocialHubViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val links by viewModel.links.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Social Hub",
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.onBackground,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp, top = 24.dp)
        )
        Text(
            text = "Conecta con nosotros a través de nuestras redes sociales oficiales.",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
            modifier = Modifier.padding(bottom = 32.dp),
            textAlign = TextAlign.Center
        )

        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.padding(32.dp),
                color = MaterialTheme.colorScheme.primary
            )
        } else if (error != null) {
            Text(
                text = error ?: "",
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(16.dp),
                textAlign = TextAlign.Center
            )
        } else if (links != null) {
            val socialItems = listOfNotNull(
                links!!.instagramUrl.takeIf { it.isNotBlank() }?.let {
                    SocialItem("Instagram", it, Icons.Default.Info, Color(0xFFE1306C))
                },
                links!!.facebookUrl.takeIf { it.isNotBlank() }?.let {
                    SocialItem("Facebook", it, Icons.Default.ThumbUp, Color(0xFF1877F2))
                },
                links!!.youtubeUrl.takeIf { it.isNotBlank() }?.let {
                    SocialItem("YouTube", it, Icons.Default.PlayArrow, Color(0xFFFF0000))
                },
                links!!.twitterUrl.takeIf { it.isNotBlank() }?.let {
                    SocialItem("X (Twitter)", it, Icons.Default.Send, Color(0xFF000000))
                }
            )

            if (socialItems.isEmpty()) {
                Text(
                    text = "No hay redes sociales configuradas aún.",
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f),
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.padding(32.dp),
                    textAlign = TextAlign.Center
                )
            } else {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    socialItems.forEach { item ->
                        SocialButton(
                            icon = item.icon,
                            text = item.name,
                            color = item.color,
                            onClick = {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(item.url))
                                context.startActivity(intent)
                            }
                        )
                    }
                }
            }
        }
    }
}

private data class SocialItem(
    val name: String,
    val url: String,
    val icon: ImageVector,
    val color: Color
)

@Composable
fun SocialButton(icon: ImageVector, text: String, color: Color, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(16.dp)
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .background(color, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = text,
                tint = Color.White,
                modifier = Modifier.size(32.dp)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onBackground,
            fontWeight = FontWeight.Bold
        )
    }
}
