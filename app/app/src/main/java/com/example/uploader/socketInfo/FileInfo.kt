package com.example.uploader.socketInfo

import com.google.gson.annotations.SerializedName
import java.time.LocalDateTime

data class Files(
  @SerializedName("name") var name: String? = "",
  @SerializedName("type") var type: String? = "",
  @SerializedName("size") var size: Long? = null,
  @SerializedName("url") var url: String? = "",
  @SerializedName("parentId") var parentId: String? = "",
  @SerializedName("sentBy") var sentBy: SentBy,
  @SerializedName("sentAt") var sentAt: String? = LocalDateTime.now().toString()
)

data class SentBy(
  @SerializedName("uid") var uid: String? = null,
  @SerializedName("displayName") var displayName: String? = null,
  @SerializedName("photoURL") var photoURL: String? = null,
)

data class FileInfo(
  @SerializedName("uuid") var uuid: String? = "",
  @SerializedName("files") var files: Files
)