package com.example.data.repository

import com.example.data.local.DownloadDao
import com.example.data.local.DownloadEntity
import kotlinx.coroutines.flow.Flow

class DownloadRepository(private val downloadDao: DownloadDao) {
    val allDownloads: Flow<List<DownloadEntity>> = downloadDao.getAllDownloads()

    suspend fun saveDownload(download: DownloadEntity): Long {
        return downloadDao.insertDownload(download)
    }

    suspend fun deleteDownload(id: Long) {
        downloadDao.deleteDownloadById(id)
    }

    suspend fun clearHistory() {
        downloadDao.clearAllDownloads()
    }

    suspend fun getTotalCount(): Int {
        return downloadDao.getDownloadCount()
    }
}
