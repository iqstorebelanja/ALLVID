package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.NeonBlue
import com.example.ui.theme.NeonBlueGlow
import com.example.ui.theme.PremiumGold
import com.example.ui.theme.SurfaceBorder
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.SurfaceElevated
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun HeaderBar(
    isVip: Boolean,
    dailyDownloadsUsed: Int,
    dailyLimit: Int,
    isBatchMode: Boolean,
    isBatchUnlocked: Boolean,
    onToggleBatchMode: () -> Unit,
    onOpenAdSettings: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        color = SurfaceDark,
        modifier = modifier
            .fillMaxWidth()
            .border(
                width = 1.dp,
                color = SurfaceBorder,
                shape = RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp)
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Brand Logo & Raycast Title
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                Brush.linearGradient(
                                    listOf(NeonBlue, Color(0xFF0066FF))
                                )
                            )
                            .border(1.dp, Color(0xFF80E5FF), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.FlashOn,
                            contentDescription = "ALLVID Brand",
                            tint = Color.Black,
                            modifier = Modifier.size(22.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "ALLVID",
                                color = TextPrimary,
                                fontSize = 19.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(NeonBlueGlow)
                                    .border(1.dp, NeonBlue.copy(alpha = 0.5f), RoundedCornerShape(4.dp))
                                    .padding(horizontal = 5.dp, vertical = 1.dp)
                            ) {
                                Text(
                                    text = if (isVip) "VIP PRO" else "PRO",
                                    color = if (isVip) PremiumGold else NeonBlue,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        Text(
                            text = "20+ Platforms Downloader",
                            color = TextMuted,
                            fontSize = 11.sp
                        )
                    }
                }

                // Daily Quota & Ad Settings controls
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Quota Pill
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(SurfaceElevated)
                            .border(1.dp, if (dailyDownloadsUsed >= dailyLimit && !isVip) Color(0xFFEF4444) else SurfaceBorder, RoundedCornerShape(20.dp))
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (isVip) PremiumGold
                                        else if (dailyDownloadsUsed < dailyLimit) ElectricCyan
                                        else Color(0xFFEF4444)
                                    )
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isVip) "VIP UNLIMITED" else "$dailyDownloadsUsed/$dailyLimit FREE",
                                color = TextSecondary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // AdMob Dev Settings Icon
                    IconButton(
                        onClick = onOpenAdSettings,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "AdMob Settings",
                            tint = NeonBlue,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            // Mode Selector Tabs (Single URL vs Batch 10 URLs)
            Spacer(modifier = Modifier.padding(top = 8.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(SurfaceElevated)
                    .border(1.dp, SurfaceBorder, RoundedCornerShape(10.dp))
                    .padding(3.dp)
            ) {
                // Single Mode Tab
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (!isBatchMode) NeonBlueGlow else Color.Transparent)
                        .border(
                            width = if (!isBatchMode) 1.dp else 0.dp,
                            color = if (!isBatchMode) NeonBlue else Color.Transparent,
                            shape = RoundedCornerShape(8.dp)
                        )
                        .clickable { if (isBatchMode) onToggleBatchMode() }
                        .padding(vertical = 7.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "⚡ Single URL",
                        color = if (!isBatchMode) NeonBlue else TextSecondary,
                        fontSize = 12.sp,
                        fontWeight = if (!isBatchMode) FontWeight.Bold else FontWeight.Medium
                    )
                }

                // Batch Mode Tab (Indicates Lock if not unlocked)
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isBatchMode) NeonBlueGlow else Color.Transparent)
                        .border(
                            width = if (isBatchMode) 1.dp else 0.dp,
                            color = if (isBatchMode) NeonBlue else Color.Transparent,
                            shape = RoundedCornerShape(8.dp)
                        )
                        .clickable { onToggleBatchMode() }
                        .padding(vertical = 7.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Layers,
                            contentDescription = "Batch Mode",
                            tint = if (isBatchMode) NeonBlue else TextSecondary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (isBatchUnlocked || isVip) "Batch (10 URLs)" else "Batch (10 URLs) 🔒",
                            color = if (isBatchMode) NeonBlue else TextSecondary,
                            fontSize = 12.sp,
                            fontWeight = if (isBatchMode) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}
