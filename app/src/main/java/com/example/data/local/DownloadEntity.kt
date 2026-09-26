package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "downloads")
data class DownloadEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val platformName: String,
    val originalUrl: String,
    val quality: String,
    val mediaType: String, // "video" or "audio"
    val fileSizeBytes: Long,
    val fileSizeFormatted: String,
    val durationFormatted: String,
    val author: String,
    val thumbnailUrl: String,
    val localFilePath: String,
    val timestamp: Long = System.currentTimeMillis()
)
